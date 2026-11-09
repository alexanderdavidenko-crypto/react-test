import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../app/App.tsx";
import { setMockLatency, errorResponse } from "../../mocks/handlers.ts";
import { server } from "../../mocks/node.ts";
import { activateScenario } from "../../mocks/scenarios.ts";
import { renderAt } from "../../test/render.tsx";

// Essential-тесты S8: тесты 5 и 6 плана. Время заморожено (2026-08-01T10:00Z): «будущее» и «прошлое»
// заданы датами за месяцы от него, поэтому часовой пояс среды не влияет. Реальный <dialog>, фокус и Esc —
// browser-verify (полифил showModal в setup не моделирует модальность).

let posts: unknown[] = [];
let sessionGets = 0;

beforeEach(() => {
  posts = [];
  sessionGets = 0;
  server.events.on("request:start", async ({ request }) => {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/sessions") {
      posts.push(await request.clone().json());
    }
    if (request.method === "GET" && url.pathname === "/api/sessions") sessionGets += 1;
  });
});

afterEach(() => {
  server.events.removeAllListeners();
  vi.unstubAllEnvs(); // возвращает TZ, выставленный в тесте
});

const location = () => window.location.pathname + window.location.search;

async function openForm(user: UserEvent) {
  await user.click(await screen.findByRole("button", { name: "Create session" }));
  return screen.findByRole("dialog", { name: "Create session" });
}

async function fill(user: UserEvent, dialog: HTMLElement, label: string, value: string) {
  await user.type(within(dialog).getByLabelText(label, { exact: false }), value);
}

async function fillValid(user: UserEvent, dialog: HTMLElement, options: { coach: boolean }) {
  await fill(user, dialog, "Title", "Evening Footwork");
  await fill(user, dialog, "Date", "2026-09-15");
  await fill(user, dialog, "Start time", "18:30");
  await fill(user, dialog, "Duration", "90");
  await fill(user, dialog, "Capacity", "12");
  await fill(user, dialog, "Location name", "North Court");
  await fill(user, dialog, "Location address", "12 Lake Street");
  if (options.coach) {
    await user.selectOptions(within(dialog).getByLabelText("Coach"), "Ethan Cole");
  }
}

/** Текст описаний, на которые ссылается `aria-describedby` контрола. */
function describedBy(control: HTMLElement): string {
  const ids = (control.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
}

describe("create session", () => {
  it("validates with linked errors, submits exactly once, refreshes the list and opens the new session", async () => {
    vi.stubEnv("TZ", "Asia/Kolkata"); // явный пояс вместо пояса машины; возвращается в afterEach
    const { user } = renderAt(<App />, "/sessions?scenario=normal");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    const listRequests = sessionGets;

    const dialog = await openForm(user);
    await within(dialog).findByRole("option", { name: "Ethan Cole" });
    // Значения по умолчанию.
    expect((within(dialog).getByLabelText("Session type") as HTMLSelectElement).value).toBe("training");
    expect((within(dialog).getByRole("radio", { name: "Public" }) as HTMLInputElement).checked).toBe(true);

    // Пустая отправка: POST не уходит, ошибки связаны с полями, статус формы.
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    const title = within(dialog).getByLabelText("Title");
    expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy(title)).toContain("Enter a title of 3–80 characters.");
    expect(describedBy(within(dialog).getByLabelText("Capacity"))).toContain(
      "Enter a whole number of places from 1 to 100.",
    );
    expect(describedBy(within(dialog).getByLabelText("Coach"))).toContain("Select a coach.");
    // Число в объявлении должно совпадать с числом реально подсвеченных контролов (а не с жёстким «8»).
    const invalidCount = dialog.querySelectorAll('[aria-invalid="true"]').length;
    expect(invalidCount).toBeGreaterThan(1);
    expect(within(dialog).getByText(`${invalidCount} fields need attention`)).toBeTruthy();
    expect(posts).toHaveLength(0);

    // Дата в прошлом: ошибка пары, связанная с обоими контролами; исправление её снимает.
    await fillValid(user, dialog, { coach: true });
    await user.clear(within(dialog).getByLabelText("Date"));
    await fill(user, dialog, "Date", "2026-07-01");
    const date = within(dialog).getByLabelText("Date");
    const time = within(dialog).getByLabelText("Start time");
    expect(describedBy(date)).toContain("Choose a date and start time in the future.");
    expect(describedBy(time)).toContain("Choose a date and start time in the future.");
    expect(date.getAttribute("aria-invalid")).toBe("true");
    expect(time.getAttribute("aria-invalid")).toBe("true");
    await user.clear(date);
    await fill(user, dialog, "Date", "2026-09-15");
    expect(date.getAttribute("aria-invalid")).toBeNull();
    expect(title.getAttribute("aria-invalid")).toBeNull();

    // Двойной клик во время ожидания даёт один POST; кнопка остаётся в фокусе и aria-disabled.
    setMockLatency(150);
    const submit = within(dialog).getByRole("button", { name: "Create session" });
    await user.dblClick(submit);
    expect(within(dialog).getByRole("button", { name: "Creating session…" }).getAttribute("aria-disabled")).toBe(
      "true",
    );
    await within(dialog).findByRole("heading", { name: "Session created" });
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      title: "Evening Footwork",
      type: "training",
      visibility: "public",
      coachId: "coach_02",
      durationMinutes: 90,
      capacity: 12,
      locationName: "North Court",
      locationAddress: "12 Lake Street",
    });
    // Введено 2026-09-15 18:30 по поясу Asia/Kolkata (+05:30, без перехода): в UTC это 13:00.
    expect((posts[0] as { startsAt: string }).startsAt).toBe("2026-09-15T13:00:00Z");
    expect(within(dialog).getByText(/“Evening Footwork” is scheduled for/)).toBeTruthy();

    // Список перезапрошен и содержит новую сессию; «Open session» открывает её детали.
    await waitFor(() => expect(sessionGets).toBeGreaterThan(listRequests));
    await screen.findByRole("link", { name: "Evening Footwork" });
    await user.click(within(dialog).getByRole("button", { name: "Open session" }));
    expect(location()).toBe("/sessions/ses_106?scenario=normal");
    await screen.findByRole("dialog", { name: "Evening Footwork" });
    expect(screen.queryByRole("dialog", { name: "Session created" })).toBeNull();
  });

  it("keeps input on a 500 and on a 400 with fieldErrors, and clears a server error on edit", async () => {
    const { user } = renderAt(<App />, "/sessions");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    const dialog = await openForm(user);
    await within(dialog).findByRole("option", { name: "Ethan Cole" });
    await fillValid(user, dialog, { coach: true });

    server.use(...activateScenario("create-error"));
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    const alert = await within(dialog).findByText(
      "The session couldn't be created. Your entries are kept. Try again.",
    );
    expect(alert.closest("[role=alert]")).toBeTruthy();
    expect((within(dialog).getByLabelText("Title") as HTMLInputElement).value).toBe("Evening Footwork");
    expect((within(dialog).getByLabelText("Capacity") as HTMLInputElement).value).toBe("12");
    expect(posts).toHaveLength(1);

    server.use(
      http.post("/api/sessions", () =>
        errorResponse(400, "VALIDATION_FAILED", "The session data is invalid.", {
          title: "Title is already used.",
          somethingElse: "Unexpected server rule.",
        }),
      ),
    );
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    await within(dialog).findByText("Title is already used.");
    const title = within(dialog).getByLabelText("Title") as HTMLInputElement;
    expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy(title)).toContain("Title is already used.");
    expect(within(dialog).getByText("Unexpected server rule.")).toBeTruthy(); // ключ без поля: блок формы
    expect(title.value).toBe("Evening Footwork");
    expect(posts).toHaveLength(2);

    await user.type(title, "!");
    expect(screen.queryByText("Title is already used.")).toBeNull();
    expect(title.getAttribute("aria-invalid")).toBeNull();
  });

  it("with coaches-error never sends a POST, shows the problem at Coach and recovers via retry", async () => {
    server.use(...activateScenario("coaches-error"));
    const { user } = renderAt(<App />, "/sessions");
    await screen.findByRole("link", { name: "U14 Shooting Lab" });
    const dialog = await openForm(user);

    expect((await within(dialog).findByRole("alert")).textContent).toContain("Coaches couldn't be loaded.");
    const retry = within(dialog).getByRole("button", { name: "Try loading coaches again" });
    // Остальная форма доступна, кнопка отправки активна.
    await fillValid(user, dialog, { coach: false });
    const submit = within(dialog).getByRole("button", { name: "Create session" });
    expect(submit.getAttribute("aria-disabled")).not.toBe("true");

    await user.click(submit);
    expect(posts).toHaveLength(0);
    expect(within(dialog).getByText("Select a coach.")).toBeTruthy();
    expect(document.activeElement).toBe(retry);

    // Восстановление: после успешного повтора тренера можно выбрать и создать сессию.
    server.resetHandlers();
    await user.click(retry);
    await user.selectOptions(await within(dialog).findByLabelText("Coach"), "Maya Brooks");
    await user.click(within(dialog).getByRole("button", { name: "Create session" }));
    await within(dialog).findByRole("heading", { name: "Session created" });
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ coachId: "coach_01" });
  });
});
