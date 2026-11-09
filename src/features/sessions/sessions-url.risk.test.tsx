import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../../app/App.tsx";
import { server } from "../../mocks/node.ts";
import { navigate } from "../../shared/router/index.ts";
import { renderAt } from "../../test/render.tsx";
import { SEARCH_DEBOUNCE_MS } from "./SessionsPage.tsx";

// risk-based, не входят в обязательный набор AC-9.1.
// Риск (ревью M-2, M-3, AC-1.11): Назад/Вперёд должны согласовывать список, поле и live-регион с URL.
// M-2: после «Clear filters» и «Назад» к отфильтрованному адресу регион не должен повторять «Filters cleared».
// M-3: отложенная запись поиска не должна перезаписать адрес, на который пользователь ушёл кнопкой «Назад».
// Реальный стек истории браузера в jsdom упрощён (popstate приходит асинхронно): проверяется только итог.

let requests: URL[] = [];

beforeEach(() => {
  requests = [];
  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/sessions") requests.push(url);
  });
});

afterEach(() => {
  server.events.removeAllListeners();
});

const location = () => window.location.pathname + window.location.search;
const searchbox = () => screen.getByRole("searchbox", { name: "Search sessions" });
// Постоянный polite-регион списка (в тестах нет диалогов, поэтому он единственный role=status).
const live = () => screen.getByRole("status").textContent;
const later = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Push новой записи истории из «приложения» (как переход по ссылке). */
function push(url: string): void {
  act(() => navigate(url));
}

function back(): void {
  act(() => window.history.back());
}

describe("sessions list and history (M-2, M-3, AC-1.11)", () => {
  it("after Clear filters then Back to the filtered URL, the live region does not repeat 'Filters cleared'", async () => {
    const { user } = renderAt(<App />, "/sessions?query=shooting");
    await waitFor(() => expect(live()).toBe("1 session matches your filters"));
    push("/sessions?query=shooting&utm=1"); // отдельная запись, чтобы Clear (replace) не затёр исходную
    await waitFor(() => expect(live()).toBe("1 session matches your filters"));

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(live()).toBe("Filters cleared. 5 sessions."));
    expect(location()).toBe("/sessions?utm=1");

    back();
    await waitFor(() => expect(location()).toBe("/sessions?query=shooting"));
    await waitFor(() => expect(live()).toBe("1 session matches your filters"));
    expect(searchbox()).toHaveProperty("value", "shooting");
    expect(screen.getAllByRole("link").filter((l) => l.getAttribute("href")?.startsWith("/sessions/"))).toHaveLength(1);
  });

  it("typing and then Back within the debounce window does not overwrite the URL with the pending replace", async () => {
    const { user } = renderAt(<App />, "/sessions?query=maya");
    await waitFor(() => expect(live()).toBe("2 sessions match your filters"));
    push("/sessions?query=maya&utm=1");
    await waitFor(() => expect(location()).toBe("/sessions?query=maya&utm=1"));
    const before = requests.length;

    await user.type(searchbox(), "x"); // «mayax»: запись в URL запланирована через SEARCH_DEBOUNCE_MS
    back();
    await waitFor(() => expect(location()).toBe("/sessions?query=maya"));

    await later(SEARCH_DEBOUNCE_MS + 150); // дольше окна debounce: отложенный replace успел бы сработать
    expect(location()).toBe("/sessions?query=maya");
    expect(searchbox()).toHaveProperty("value", "maya"); // поле показывает URL, а не несохранённый ввод
    expect(requests.slice(before).some((u) => u.searchParams.get("query") === "mayax")).toBe(false);
    expect(live()).toBe("2 sessions match your filters");
  });
});
