import { http, type RequestHandler } from "msw";
import scenarios from "../../frontend-accelerator-assessment/fixtures/mock-scenarios.json";
import { errorResponse } from "./handlers.ts";
import { resetStore } from "./store.ts";

export const SCENARIO_NAMES = [
  "normal",
  "empty",
  "list-error",
  "details-error",
  "coaches-error",
  "create-error",
] as const;

export type ScenarioName = (typeof SCENARIO_NAMES)[number];
export type ScenarioSource = "url" | "env" | "default";

export interface ScenarioSelection {
  name: ScenarioName;
  source: ScenarioSource;
}

export function isScenarioName(value: unknown): value is ScenarioName {
  return typeof value === "string" && (SCENARIO_NAMES as readonly string[]).includes(value);
}

/**
 * Приоритет: ?scenario= в URL, затем VITE_MOCK_SCENARIO, затем normal.
 * Невалидное имя -> console.warn и откат на следующий источник.
 */
export function resolveScenario(search: string, envValue: unknown): ScenarioSelection {
  const fromUrl = new URLSearchParams(search).get("scenario");
  const candidates: [ScenarioSource, string | null][] = [
    ["url", fromUrl],
    ["env", typeof envValue === "string" && envValue !== "" ? envValue : null],
  ];
  for (const [source, value] of candidates) {
    if (value === null) continue;
    if (isScenarioName(value)) return { name: value, source };
    console.warn(
      `[mock] Unknown scenario "${value}" from ${source}. Allowed: ${SCENARIO_NAMES.join(", ")}.`,
    );
  }
  return { name: "normal", source: "default" };
}

type ErrorScenario = "list-error" | "details-error" | "coaches-error" | "create-error";

function staticError(name: ErrorScenario): (() => Response) {
  const { status, body } = scenarios[name];
  return () => errorResponse(status, body.error.code, body.error.message);
}

/**
 * Готовит хранилище под сценарий и возвращает переопределяющие обработчики.
 * Передавать перед базовыми (браузер) или в server.use (тесты).
 */
export function activateScenario(name: ScenarioName): RequestHandler[] {
  resetStore({ empty: name === "empty" });
  switch (name) {
    case "list-error":
      return [http.get("/api/sessions", staticError("list-error"))];
    case "details-error":
      return [
        http.get(
          `/api/sessions/${scenarios["details-error"].targetSessionId}`,
          staticError("details-error"),
        ),
      ];
    case "coaches-error":
      return [http.get("/api/coaches", staticError("coaches-error"))];
    case "create-error":
      return [http.post("/api/sessions", staticError("create-error"))];
    case "normal":
    case "empty":
      return [];
  }
}
