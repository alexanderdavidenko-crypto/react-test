import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../app/App.tsx";
import { renderAt } from "../../test/render.tsx";

// Essential-тест 7b: навигация деталей (AC-1.8, 2.4, 2.5, 9.5). Реальный <dialog>, фокус и Esc — browser-verify.

const location = () => window.location.pathname + window.location.search;

describe("session details navigation", () => {
  it("opens from a row keeping query, and closing returns to the previous list URL", async () => {
    const { user } = renderAt(<App />, "/sessions?query=shooting&scenario=normal");

    await user.click(await screen.findByRole("link", { name: "U14 Shooting Lab" }));
    expect(location()).toBe("/sessions/ses_101?query=shooting&scenario=normal");

    const dialog = await screen.findByRole("dialog", { name: "U14 Shooting Lab" });
    expect(within(dialog).getByRole("heading", { level: 2 }).textContent).toBe("U14 Shooting Lab");
    expect(within(dialog).getByText("Maya Brooks")).toBeTruthy();
    // Список остаётся смонтированным под диалогом.
    expect(screen.getAllByText("U14 Shooting Lab").length).toBeGreaterThan(1);

    await user.click(within(dialog).getByRole("button", { name: "Close session details" }));
    await waitFor(() => expect(location()).toBe("/sessions?query=shooting&scenario=normal"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("deep link opens details over the filtered list, and direct close replaces with /sessions + query", async () => {
    const { user } = renderAt(<App />, "/sessions/ses_104?status=cancelled&scenario=normal");

    const dialog = await screen.findByRole("dialog", { name: "Weekend Ball Handling" });
    expect(within(dialog).getByText("Cancelled", { selector: "h3" })).toBeTruthy();
    // Список под диалогом отфильтрован по query string.
    await waitFor(() => expect(screen.getByText("1 session", { selector: "p" })).toBeTruthy());

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(location()).toBe("/sessions?status=cancelled&scenario=normal"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
