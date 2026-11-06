import { delay, http, HttpResponse, type RequestHandler } from "msw";
import scenarios from "../../frontend-accelerator-assessment/fixtures/mock-scenarios.json";
import {
  SESSION_STATUSES,
  SESSION_TYPES,
  VISIBILITIES,
  type SessionStatus,
} from "../shared/api/types.ts";
import { currentTime, isIsoUtc } from "../shared/lib/datetime.ts";
import { addSession, coaches, findCoach, findSession, listSessions, toSummary } from "./store.ts";

let latencyMs: number = scenarios.normal.defaultLatencyMs;

/** Задержка ответов; тесты выставляют 0. */
export function setMockLatency(ms: number): void {
  latencyMs = ms;
}

async function wait(): Promise<void> {
  if (latencyMs > 0) await delay(latencyMs);
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
): Response {
  return HttpResponse.json(
    { error: fieldErrors ? { code, message, fieldErrors } : { code, message } },
    { status },
  );
}

function isStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

type Body = Record<string, unknown>;

function validateCreate(body: Body): Record<string, string> {
  const errors: Record<string, string> = {};
  const text = (key: string, label: string): void => {
    const value = body[key];
    if (typeof value !== "string" || value.trim() === "") errors[key] = `${label} is required.`;
  };
  text("title", "Title");
  text("locationName", "Location name");
  text("locationAddress", "Location address");
  if (typeof body.type !== "string" || !(SESSION_TYPES as readonly string[]).includes(body.type)) {
    errors.type = "Unsupported session type.";
  }
  if (
    typeof body.visibility !== "string" ||
    !(VISIBILITIES as readonly string[]).includes(body.visibility)
  ) {
    errors.visibility = "Unsupported visibility.";
  }
  if (typeof body.startsAt !== "string" || !isIsoUtc(body.startsAt)) {
    errors.startsAt = "Start must be an ISO 8601 UTC date.";
  }
  for (const key of ["durationMinutes", "capacity"] as const) {
    const value = body[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      errors[key] = "Must be a positive number.";
    }
  }
  if (typeof body.coachId !== "string" || !findCoach(body.coachId)) {
    errors.coachId = "Unknown coach.";
  }
  for (const key of ["description", "trainerNotes"] as const) {
    const value = body[key];
    if (value !== undefined && value !== null && typeof value !== "string") {
      errors[key] = "Must be text or empty.";
    }
  }
  return errors;
}

function optionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const handlers: RequestHandler[] = [
  http.get("/api/sessions", async ({ request }) => {
    await wait();
    const params = new URL(request.url).searchParams;
    const status = params.get("status") ?? "";
    if (status !== "" && !isStatus(status)) {
      return errorResponse(400, "INVALID_FILTER", "Unsupported status filter.");
    }
    const query = (params.get("query") ?? "").trim().toLowerCase();
    const matched = listSessions().filter((s) => {
      if (status !== "" && s.status !== status) return false;
      if (query === "") return true;
      return [s.title, s.coach.name, s.location.name, s.location.address].some((field) =>
        field.toLowerCase().includes(query),
      );
    });
    return HttpResponse.json({
      data: matched.map(toSummary),
      meta: { page: 1, pageSize: 10, total: matched.length },
    });
  }),

  http.get("/api/sessions/:sessionId", async ({ params }) => {
    await wait();
    const found = findSession(String(params.sessionId));
    if (!found) {
      return errorResponse(
        404,
        scenarios["unknown-session"].body.error.code,
        scenarios["unknown-session"].body.error.message,
      );
    }
    return HttpResponse.json(found);
  }),

  http.get("/api/coaches", async () => {
    await wait();
    return HttpResponse.json({ data: coaches });
  }),

  http.post("/api/sessions", async ({ request }) => {
    await wait();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "VALIDATION_FAILED", "Request body must be valid JSON.");
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return errorResponse(400, "VALIDATION_FAILED", "Request body must be an object.");
    }
    const input = body as Body;
    const fieldErrors = validateCreate(input);
    if (Object.keys(fieldErrors).length > 0) {
      return errorResponse(400, "VALIDATION_FAILED", "The session data is invalid.", fieldErrors);
    }
    const coach = findCoach(input.coachId as string)!;
    const created = addSession(
      {
        title: (input.title as string).trim(),
        type: input.type as (typeof SESSION_TYPES)[number],
        status: "scheduled",
        startsAt: input.startsAt as string,
        durationMinutes: input.durationMinutes as number,
        capacity: input.capacity as number,
        bookedCount: 0,
        visibility: input.visibility as (typeof VISIBILITIES)[number],
        coach,
        location: {
          name: (input.locationName as string).trim(),
          address: (input.locationAddress as string).trim(),
        },
        description: optionalText(input.description),
        trainerNotes: optionalText(input.trainerNotes),
        cancellation: null,
      },
      currentTime(),
    );
    return HttpResponse.json(created, { status: 201 });
  }),
];
