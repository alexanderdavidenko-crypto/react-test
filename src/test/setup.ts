import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { setMockLatency } from "../mocks/handlers.ts";
import { server } from "../mocks/node.ts";
import { resetStore } from "../mocks/store.ts";
import { FROZEN_NOW } from "./constants.ts";

// jsdom 31 не реализует HTMLDialogElement.showModal/close (проверено запуском): минимальный полифил.
// Он не моделирует фокус, инертность фона и Esc; это проверяется в browser-verify.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute("open", "");
  };
}
if (typeof HTMLDialogElement.prototype.close !== "function") {
  HTMLDialogElement.prototype.close = function close(
    this: HTMLDialogElement,
    returnValue?: string,
  ): void {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event("close"));
  };
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  // Подменяем только Date: таймеры, MSW, userEvent и debounce работают по-настоящему.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FROZEN_NOW);
  setMockLatency(0);
  resetStore();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

afterAll(() => {
  server.close();
});
