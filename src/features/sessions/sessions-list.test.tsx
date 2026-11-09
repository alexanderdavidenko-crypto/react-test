import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../../app/App.tsx";
import { errorResponse } from "../../mocks/handlers.ts";
import { server } from "../../mocks/node.ts";
import { listSessions, resetStore, toSummary } from "../../mocks/store.ts";
import { formatListDateTime } from "../../shared/lib/datetime.ts";
import { renderAt } from "../../test/render.tsx";

// Essential-тесты S6: тесты 1, 2, 3, 4, 7a плана. Запросы наблюдаются на HTTP-границе (msw).

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

const searchbox = () => screen.getByRole("searchbox", { name: "Search sessions" });
const statusSelect = () => screen.getByRole("combobox", { name: "Status" });
// Только ссылки строк списка: в диалоге деталей (S7) есть своя ссылка mailto.
const rowLinks = () =>
  screen.queryAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/sessions/"));
const rowOf = (title: string) => screen.getByRole("link", { name: title }).closest("li")!;

describe("sessions list", () => {
  it("shows loading state, then rows with all list fields (AC-1.2, 1.7, 4.1, 4.2)", async () => {
    renderAt(<App />, "/sessions");

    expect(screen.getByRole("status").textContent).toBe("Loading sessions…");
    expect(rowLinks()).toHaveLength(0);

    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    expect(rowLinks()).toHaveLength(5);
    expect(screen.getByRole("status").textContent).toBe("5 sessions");
    expect(screen.getByText("5 sessions", { selector: "p" })).toBeTruthy();

    const first = listSessions()[0];
    const row = within(rowOf("U14 Shooting Lab"));
    expect(screen.getByRole("link", { name: "U14 Shooting Lab" }).getAttribute("href")).toBe(
      "/sessions/ses_101",
    );
    expect(row.getByText(/Training/)).toBeTruthy();
    expect(row.getByText(/North Court/)).toBeTruthy();
    expect(row.getByText(formatListDateTime(first.startsAt))).toBeTruthy();
    expect(row.getByText("90 minutes")).toBeTruthy();
    expect(row.getByText("Maya Brooks")).toBeTruthy();
    expect(row.getByText("14 / 18")).toBeTruthy();
    expect(row.getByText("Capacity: 14 of 18")).toBeTruthy();
    expect(row.getByText("Scheduled")).toBeTruthy();

    // Статус читается текстом у всех четырёх значений, не только цветом.
    expect(within(rowOf("Varsity Defense Intensive")).getByText("Full")).toBeTruthy();
    expect(within(rowOf("Weekend Ball Handling")).getByText("Cancelled")).toBeTruthy();
    expect(within(rowOf("U12 Team Fundamentals")).getByText("Completed")).toBeTruthy();
  });

  it("sends query and status to the API, narrows the list, and Clear filters keeps scenario (AC-1.3-1.6, 1.13, 1.14)", async () => {
    const { user } = renderAt(<App />, "/sessions?scenario=demo");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    const historyLength = window.history.length;

    await user.type(searchbox(), "shooting");
    await waitFor(() => expect(rowLinks()).toHaveLength(1));
    const last = requests[requests.length - 1];
    expect(last.searchParams.get("query")).toBe("shooting");
    expect(last.searchParams.has("status")).toBe(false);
    // Debounce: ввод по символам не порождает запрос на каждую букву.
    expect(requests.some((u) => u.searchParams.get("query") === "s")).toBe(false);
    expect(window.location.search).toBe("?scenario=demo&query=shooting");
    expect(window.history.length).toBe(historyLength); // replace, не push

    await user.selectOptions(statusSelect(), "full");
    await screen.findByRole("heading", { name: "No sessions match your filters" });
    const withBoth = requests[requests.length - 1];
    expect(withBoth.searchParams.get("query")).toBe("shooting");
    expect(withBoth.searchParams.get("status")).toBe("full");
    expect(window.location.search).toContain("status=full");
    expect(window.history.length).toBe(historyLength);

    await user.clear(searchbox());
    await waitFor(() => expect(rowLinks()).toHaveLength(1)); // только Full: Varsity Defense Intensive
    expect(screen.getByRole("link", { name: "Varsity Defense Intensive" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(rowLinks()).toHaveLength(5));
    expect(searchbox()).toHaveProperty("value", "");
    expect(statusSelect()).toHaveProperty("value", "");
    expect(document.activeElement).toBe(searchbox());
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(window.location.search).toBe("?scenario=demo");
    expect(screen.getByRole("status").textContent).toBe("Filters cleared. 5 sessions.");
    // scenario никогда не уходит на сервер.
    expect(requests.every((u) => !u.searchParams.has("scenario"))).toBe(true);
  });

  it("distinguishes the empty state from filters with no matches (AC-4.3, 4.4)", async () => {
    resetStore({ empty: true });
    const empty = renderAt(<App />, "/sessions");
    await screen.findByRole("heading", { name: "No sessions yet" });
    expect(screen.getByText(/Create the first training session/)).toBeTruthy();
    // Кнопка в шапке и в пустом состоянии.
    expect(screen.getAllByRole("button", { name: "Create session" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("No sessions yet");
    empty.unmount();

    resetStore();
    const { user } = renderAt(<App />, "/sessions?query=zzzz");
    await screen.findByRole("heading", { name: "No sessions match your filters" });
    expect(screen.queryByRole("heading", { name: "No sessions yet" })).toBeNull();
    expect(screen.getByText("Nothing found for “zzzz”. Try different keywords or clear the filters.")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Create session" })).toHaveLength(1); // только шапка
    expect(screen.getByRole("status").textContent).toBe("No sessions match your filters");

    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    await waitFor(() => expect(rowLinks()).toHaveLength(5));
    expect(window.location.search).toBe("");
  });

  it("shows the status-specific no-match texts", async () => {
    renderAt(<App />, "/sessions?status=cancelled&query=shooting");
    await screen.findByText(
      "Nothing found for “shooting” with status Cancelled. Try different keywords or clear the filters.",
    );
  });

  it("shows a list error with Try again that keeps filters and recovers (AC-4.5)", async () => {
    server.use(
      http.get("/api/sessions", () =>
        errorResponse(500, "SESSIONS_UNAVAILABLE", "Sessions are temporarily unavailable."),
      ),
    );
    const { user } = renderAt(<App />, "/sessions?query=shooting&scenario=list-error");

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading", { name: "Sessions couldn't be loaded" })).toBeTruthy();
    expect(within(alert).getByText("Your filters are kept. Try again in a moment.")).toBeTruthy();
    expect(searchbox()).toHaveProperty("value", "shooting");
    expect(window.location.search).toBe("?query=shooting&scenario=list-error");
    expect(rowLinks()).toHaveLength(0);

    // Восстановление: сервер снова отвечает списком.
    const [only] = listSessions();
    server.use(
      http.get("/api/sessions", () =>
        HttpResponse.json({
          data: [toSummary(only)],
          meta: { page: 1, pageSize: 10, total: 1 },
        }),
      ),
    );
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(requests[requests.length - 1].searchParams.get("query")).toBe("shooting");
  });
});

describe("filters restored from the URL (AC-1.9-1.12, 1.14)", () => {
  it("restores query and status, and ignores unrelated parameters", async () => {
    renderAt(<App />, "/sessions?query=Maya&status=scheduled&utm=1&scenario=normal");
    await waitFor(() => expect(rowLinks()).toHaveLength(2));

    expect(searchbox()).toHaveProperty("value", "Maya");
    expect(statusSelect()).toHaveProperty("value", "scheduled");
    expect(screen.getByRole("status").textContent).toBe("2 sessions match your filters");
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
    const first = requests[0];
    expect(first.searchParams.get("query")).toBe("Maya");
    expect(first.searchParams.get("status")).toBe("scheduled");
    expect(first.searchParams.has("utm")).toBe(false);
    expect(first.searchParams.has("scenario")).toBe(false);
    expect(window.location.search).toBe("?query=Maya&status=scheduled&utm=1&scenario=normal");
  });

  it("treats an invalid status as all and does not send it to the server", async () => {
    renderAt(<App />, "/sessions?status=bogus&query=%20%20&utm=1");
    await waitFor(() => expect(rowLinks()).toHaveLength(5));

    expect(statusSelect()).toHaveProperty("value", "");
    expect(requests).toHaveLength(1);
    expect(requests[0].search).toBe(""); // ни status, ни пробельный query
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("redirects an unknown path to /sessions keeping search, and /sessions/:id shows the list", async () => {
    const first = renderAt(<App />, "/nowhere?query=Maya&scenario=x");
    await waitFor(() => expect(window.location.pathname).toBe("/sessions"));
    expect(window.location.search).toBe("?query=Maya&scenario=x");
    await waitFor(() => expect(rowLinks()).toHaveLength(2));
    first.unmount();

    renderAt(<App />, "/sessions/ses_101?query=Maya");
    await waitFor(() => expect(rowLinks()).toHaveLength(2));
    expect(window.location.pathname).toBe("/sessions/ses_101");
  });
});
