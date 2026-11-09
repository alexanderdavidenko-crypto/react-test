import { screen, waitFor, within } from "@testing-library/react";
import { http } from "msw";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../app/App.tsx";
import { errorResponse } from "../../mocks/handlers.ts";
import { server } from "../../mocks/node.ts";
import { renderAt } from "../../test/render.tsx";

// Дефекты browser-verify D-1 и D-2. Реальное поведение фокуса диалога проверяется в браузере;
// здесь моделируется только то, что важно для логики: закрытие диалога снимает фокус с поля.

afterEach(() => {
  vi.restoreAllMocks();
});

describe("browser-verify D-1: no premature error when the form opens", () => {
  it("does not mark Title invalid when closing the dialog blurs it (StrictMode remount)", async () => {
    const originalClose = HTMLDialogElement.prototype.close;
    // Как в браузере: закрытие диалога убирает фокус с сфокусированного внутри него элемента.
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function close(this: HTMLDialogElement) {
      const active = document.activeElement;
      originalClose.call(this);
      if (active instanceof HTMLElement && this.contains(active)) active.blur();
    });

    const { user } = renderAt(
      <StrictMode>
        <App />
      </StrictMode>,
      "/sessions",
    );
    await user.click(await screen.findByRole("button", { name: "Create session" }));
    const dialog = await screen.findByRole("dialog", { name: "Create session" });
    const title = within(dialog).getByLabelText("Title", { exact: false });

    expect(title.getAttribute("aria-invalid")).not.toBe("true");
    expect(within(dialog).queryByText("Enter a title of 3–80 characters.")).toBeNull();
  });
});

describe("browser-verify D-2: focus after Try again in the list error", () => {
  it("moves focus to the h1 instead of losing it to BODY", async () => {
    server.use(
      http.get("/api/sessions", () =>
        errorResponse(500, "SESSIONS_UNAVAILABLE", "Sessions are temporarily unavailable."),
      ),
    );
    const { user } = renderAt(<App />, "/sessions");
    const alert = await screen.findByRole("alert");
    const retry = within(alert).getByRole("button", { name: "Try again" });
    retry.focus();

    await user.click(retry);

    const heading = screen.getByRole("heading", { level: 1, name: "Training sessions" });
    expect(document.activeElement).toBe(heading);
    await screen.findByRole("alert");
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});
