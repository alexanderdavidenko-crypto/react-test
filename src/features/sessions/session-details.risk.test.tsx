import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "../../app/App.tsx";
import { server } from "../../mocks/node.ts";
import { activateScenario } from "../../mocks/scenarios.ts";
import { findSession } from "../../mocks/store.ts";
import { renderAt } from "../../test/render.tsx";

// risk-based, не входят в обязательный набор AC-9.1.
// Риск: детали открываются по прямой ссылке без списка, поэтому ошибка и «не найдено» должны оставлять
// выход (Try again, Back to sessions); отсутствующие описание и заметки не должны показываться как «null».
// Реальный <dialog>, фокус и озвучка (role=alert) за пределами jsdom: browser-verify.

const location = () => window.location.pathname + window.location.search;

describe("session details: error and not found", () => {
  it("details-error offers Try again and recovers to the details on success", async () => {
    server.use(...activateScenario("details-error")); // ses_101 -> 500
    const { user } = renderAt(<App />, "/sessions/ses_101?scenario=details-error");

    const dialog = await screen.findByRole("dialog", { name: "Session details" });
    const alert = await within(dialog).findByRole("alert");
    expect(within(alert).getByRole("heading", { name: "Session details couldn't be loaded" })).toBeTruthy();
    expect(within(alert).getByText("Try again, or close this window and pick another session.")).toBeTruthy();
    expect(within(dialog).queryByRole("heading", { name: "U14 Shooting Lab" })).toBeNull();
    // Выход есть и без повтора.
    expect(within(dialog).getByRole("button", { name: "Close" })).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "Back to sessions" })).toBeNull();

    // Переход ошибка -> успех: более поздний server.use перекрывает статичный сценарий.
    server.use(http.get("/api/sessions/ses_101", () => HttpResponse.json(findSession("ses_101"))));
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    await within(dialog).findByRole("heading", { name: "U14 Shooting Lab" });
    expect(within(dialog).queryByRole("alert")).toBeNull();
    expect(within(dialog).queryByRole("button", { name: "Try again" })).toBeNull();
    expect(within(dialog).getByText("Maya Brooks")).toBeTruthy();
  });

  it("an unknown session shows not found without Try again, and Back to sessions leaves to the list keeping search", async () => {
    const { user } = renderAt(<App />, "/sessions/ses_unknown?status=full&scenario=normal");

    const dialog = await screen.findByRole("dialog", { name: "Session details" });
    const alert = await within(dialog).findByRole("alert");
    expect(within(alert).getByRole("heading", { name: "Session not found" })).toBeTruthy();
    expect(within(alert).getByText("It may have been removed, or the link may be wrong.")).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "Try again" })).toBeNull(); // повтор бессмысленен
    expect(within(dialog).queryByRole("button", { name: "Close" })).toBeNull(); // вместо него Back to sessions

    await user.click(within(dialog).getByRole("button", { name: "Back to sessions" }));
    await waitFor(() => expect(location()).toBe("/sessions?status=full&scenario=normal"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("session details: missing description and notes", () => {
  it.each<[string, string | null]>([
    ["null", null],
    ["empty string", ""],
    ["whitespace only", "   "],
  ])("%s description and trainer notes show a placeholder, never the word null", async (_label, value) => {
    const base = findSession("ses_101")!;
    server.use(
      http.get("/api/sessions/ses_101", () =>
        HttpResponse.json({ ...base, description: value, trainerNotes: value }),
      ),
    );
    renderAt(<App />, "/sessions/ses_101");

    const dialog = await screen.findByRole("dialog", { name: "U14 Shooting Lab" });
    await within(dialog).findByText("No description provided.");
    expect(within(dialog).getByText("No trainer notes.")).toBeTruthy();
    expect(dialog.textContent).not.toMatch(/null|undefined/i);
  });
});
