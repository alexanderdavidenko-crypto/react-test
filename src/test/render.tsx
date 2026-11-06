import { render, type RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";

/** Рендер с заданным начальным URL; userEvent привязан к реальным таймерам. */
export function renderAt(
  ui: ReactElement,
  url = "/sessions",
): RenderResult & { user: UserEvent } {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  return { user, ...render(ui) };
}
