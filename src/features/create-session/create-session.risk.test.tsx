import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../../app/App.tsx";
import { server } from "../../mocks/node.ts";
import { resetStore } from "../../mocks/store.ts";
import { renderAt } from "../../test/render.tsx";

// risk-based, не входят в обязательный набор AC-9.1.
// Риск: потеря введённых данных при закрытии, неверное утверждение об исходе POST при сетевой ошибке
// (риск дубля сессии), и «исчезнувшая» созданная сессия при пустом списке или активных фильтрах (AC-3.13).
// Реальный <dialog>, фокус, Esc и инертность фона в jsdom не проверяются (полифил showModal): browser-verify.

let sessionGets = 0;

beforeEach(() => {
  sessionGets = 0;
  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/sessions") sessionGets += 1;
  });
});

afterEach(() => {
  server.events.removeAllListeners();
});

const location = () => window.location.pathname + window.location.search;
const later = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const rowLinks = () =>
  screen.queryAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/sessions/"));

async function openForm(user: UserEvent) {
  // В пустом состоянии кнопок две (шапка и пустое состояние): берём первую, кнопку шапки.
  const [button] = await screen.findAllByRole("button", { name: "Create session" });
  await user.click(button);
  return screen.findByRole("dialog", { name: "Create session" });
}

async function fill(user: UserEvent, dialog: HTMLElement, label: string, value: string) {
  await user.type(within(dialog).getByLabelText(label, { exact: false }), value);
}

async function fillValid(user: UserEvent, dialog: HTMLElement) {
  await within(dialog).findByRole("option", { name: "Ethan Cole" });
  await fill(user, dialog, "Title", "Evening Footwork");
  await fill(user, dialog, "Date", "2026-09-15");
  await fill(user, dialog, "Start time", "18:30");
  await fill(user, dialog, "Duration", "90");
  await fill(user, dialog, "Capacity", "12");
  await fill(user, dialog, "Location name", "North Court");
  await fill(user, dialog, "Location address", "12 Lake Street");
  await user.selectOptions(within(dialog).getByLabelText("Coach"), "Ethan Cole");
}

describe("create session: closing a dirty form", () => {
  it("asks before discarding: Keep editing keeps the input, Discard closes; a clean form closes at once", async () => {
    const { user } = renderAt(<App />, "/sessions");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });

    // Чистая форма закрывается без вопроса.
    let dialog = await openForm(user);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Create session" })).toBeNull();

    dialog = await openForm(user);
    await fill(user, dialog, "Title", "Half done");

    // «Cancel» и «×» ведут к одному подтверждению; «Keep editing» оставляет форму с данными.
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(within(dialog).getByText("Discard this session? Your entries will be lost.")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Keep editing" }));
    expect(within(dialog).queryByText("Discard this session? Your entries will be lost.")).toBeNull();
    expect((within(dialog).getByLabelText("Title") as HTMLInputElement).value).toBe("Half done");
    expect(screen.getByRole("dialog", { name: "Create session" })).toBe(dialog);

    await user.click(within(dialog).getByRole("button", { name: "Close create session form" }));
    expect(within(dialog).getByRole("button", { name: "Keep editing" })).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Discard" }));
    expect(screen.queryByRole("dialog", { name: "Create session" })).toBeNull();

    // Повторное открытие даёт пустую форму: введённое не просочилось.
    dialog = await openForm(user);
    expect((within(dialog).getByLabelText("Title") as HTMLInputElement).value).toBe("");
  });
});

describe("create session: outcome of POST is unknown", () => {
  it.each<[string, () => Response]>([
    ["network error", () => HttpResponse.error()],
    [
      "malformed response",
      () => new HttpResponse("<html>preview</html>", { status: 201, headers: { "Content-Type": "text/html" } }),
    ],
  ])("%s: does not claim the session was not created, keeps input, and closing refetches the list", async (_label, respond) => {
    server.use(http.post("/api/sessions", respond));
    const { user } = renderAt(<App />, "/sessions");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    const dialog = await openForm(user);
    await fillValid(user, dialog);

    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    const alert = await within(dialog).findByRole("alert");
    expect(alert.textContent).toContain("couldn't confirm that the session was created");
    expect(alert.textContent).toContain("Check the sessions list");
    expect(alert.textContent).not.toMatch(/wasn't created|was not created|couldn't be created|not created/i);
    expect((within(dialog).getByLabelText("Title") as HTMLInputElement).value).toBe("Evening Footwork");

    // Закрытие (форма грязная -> подтверждение) перезапрашивает список: исход мог быть успешным.
    const before = sessionGets;
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await user.click(within(dialog).getByRole("button", { name: "Discard" }));
    expect(screen.queryByRole("dialog", { name: "Create session" })).toBeNull();
    await waitFor(() => expect(sessionGets).toBeGreaterThan(before));
  });
});

describe("create session: the new session stays reachable (AC-3.13)", () => {
  it("empty list + POST: the created session appears and the empty state goes away", async () => {
    resetStore({ empty: true });
    const { user } = renderAt(<App />, "/sessions");
    await screen.findByRole("heading", { name: "No sessions yet" });

    const dialog = await openForm(user);
    await fillValid(user, dialog);
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    await within(dialog).findByRole("heading", { name: "Session created" });

    await waitFor(() => expect(rowLinks()).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Evening Footwork" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "No sessions yet" })).toBeNull();
  });

  it("active filters hide the new session: success screen warns, Clear filters reveals it, Open session opens it", async () => {
    const { user } = renderAt(<App />, "/sessions?query=shooting&scenario=normal");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    expect(rowLinks()).toHaveLength(1);

    const dialog = await openForm(user);
    await fillValid(user, dialog);
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    await within(dialog).findByRole("heading", { name: "Session created" });

    // Фильтр её скрывает: список по-прежнему из одной строки, экран успеха объясняет это.
    await waitFor(() => expect(sessionGets).toBeGreaterThan(1));
    await later(30);
    expect(screen.queryByRole("link", { name: "Evening Footwork" })).toBeNull();
    expect(
      within(dialog).getByText("Filters are active, so the new session may not appear in the list."),
    ).toBeTruthy();

    await user.click(within(dialog).getByRole("button", { name: "Clear filters" }));
    expect(within(dialog).getByText("Filters cleared.")).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(location()).toBe("/sessions?scenario=normal"); // scenario сохранён
    await screen.findByRole("link", { name: "Evening Footwork" });
    expect(rowLinks()).toHaveLength(6);

    await user.click(within(dialog).getByRole("button", { name: "Open session" }));
    expect(location()).toBe("/sessions/ses_106?scenario=normal");
    await screen.findByRole("dialog", { name: "Evening Footwork" });
    expect(screen.queryByRole("dialog", { name: "Session created" })).toBeNull();
  });
});
