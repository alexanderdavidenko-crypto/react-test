import { setupWorker } from "msw/browser";
import { handlers } from "./handlers.ts";
import { activateScenario, resolveScenario } from "./scenarios.ts";

/** Запускает worker; промис завершается, когда worker готов перехватывать запросы. */
export async function startBrowserMock(): Promise<void> {
  const selection = resolveScenario(window.location.search, import.meta.env.VITE_MOCK_SCENARIO);
  console.info(`[mock] scenario: ${selection.name} (source: ${selection.source})`);
  const worker = setupWorker(...activateScenario(selection.name), ...handlers);
  await worker.start({
    onUnhandledRequest(request, print) {
      // Ошибка только для /api; ассеты Vite и прочее пропускаются.
      if (new URL(request.url).pathname.startsWith("/api")) print.error();
    },
  });
}
