import { isIsoUtc } from "../lib/datetime.ts";
import { ResponseShapeError } from "./errors.ts";
import {
  SESSION_STATUSES,
  SESSION_TYPES,
  VISIBILITIES,
  type CoachSummary,
  type CoachesResponse,
  type LocationSummary,
  type SessionDetails,
  type SessionSummary,
  type SessionsResponse,
} from "./types.ts";

// Строгая проверка формы ответа. Все функции бросают ResponseShapeError;
// лишние поля игнорируются, неизвестный enum и невалидная дата = malformed.

type Obj = Record<string, unknown>;

function fail(path: string, expected: string, status?: number): never {
  throw new ResponseShapeError(`Unexpected response shape at ${path}: expected ${expected}`, status);
}

function obj(value: unknown, path: string): Obj {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail(path, "object");
  }
  return value as Obj;
}

function str(value: unknown, path: string): string {
  return typeof value === "string" ? value : fail(path, "string");
}

function num(value: unknown, path: string): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fail(path, "number");
}

function nullableStr(value: unknown, path: string): string | null {
  return value === null ? null : str(value, path);
}

function iso(value: unknown, path: string): string {
  const s = str(value, path);
  return isIsoUtc(s) ? s : fail(path, "ISO 8601 UTC date");
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  const s = str(value, path);
  return (allowed as readonly string[]).includes(s) ? (s as T) : fail(path, allowed.join(" | "));
}

function array(value: unknown, path: string): unknown[] {
  return Array.isArray(value) ? value : fail(path, "array");
}

export function parseCoach(value: unknown, path = "coach"): CoachSummary {
  const o = obj(value, path);
  return {
    id: str(o.id, `${path}.id`),
    name: str(o.name, `${path}.name`),
    email: str(o.email, `${path}.email`),
  };
}

function parseLocation(value: unknown, path: string): LocationSummary {
  const o = obj(value, path);
  return {
    name: str(o.name, `${path}.name`),
    address: str(o.address, `${path}.address`),
  };
}

export function parseSessionSummary(value: unknown, path = "session"): SessionSummary {
  const o = obj(value, path);
  return {
    id: str(o.id, `${path}.id`),
    title: str(o.title, `${path}.title`),
    type: oneOf(o.type, SESSION_TYPES, `${path}.type`),
    status: oneOf(o.status, SESSION_STATUSES, `${path}.status`),
    startsAt: iso(o.startsAt, `${path}.startsAt`),
    durationMinutes: num(o.durationMinutes, `${path}.durationMinutes`),
    capacity: num(o.capacity, `${path}.capacity`),
    bookedCount: num(o.bookedCount, `${path}.bookedCount`),
    visibility: oneOf(o.visibility, VISIBILITIES, `${path}.visibility`),
    coach: parseCoach(o.coach, `${path}.coach`),
    location: parseLocation(o.location, `${path}.location`),
    updatedAt: iso(o.updatedAt, `${path}.updatedAt`),
  };
}

export function parseSessionDetails(value: unknown, path = "session"): SessionDetails {
  const summary = parseSessionSummary(value, path);
  const o = obj(value, path);
  let cancellation: SessionDetails["cancellation"] = null;
  if (o.cancellation !== null) {
    const c = obj(o.cancellation, `${path}.cancellation`);
    cancellation = {
      reason: nullableStr(c.reason, `${path}.cancellation.reason`),
      cancelledAt: iso(c.cancelledAt, `${path}.cancellation.cancelledAt`),
    };
  }
  return {
    ...summary,
    description: nullableStr(o.description, `${path}.description`),
    trainerNotes: nullableStr(o.trainerNotes, `${path}.trainerNotes`),
    createdAt: iso(o.createdAt, `${path}.createdAt`),
    cancellation,
  };
}

export function parseSessionsResponse(value: unknown): SessionsResponse {
  const o = obj(value, "response");
  const meta = obj(o.meta, "meta");
  return {
    data: array(o.data, "data").map((item, i) => parseSessionSummary(item, `data[${i}]`)),
    meta: {
      page: num(meta.page, "meta.page"),
      pageSize: num(meta.pageSize, "meta.pageSize"),
      total: num(meta.total, "meta.total"),
    },
  };
}

export function parseCoachesResponse(value: unknown): CoachesResponse {
  const o = obj(value, "response");
  return {
    data: array(o.data, "data").map((item, i) => parseCoach(item, `data[${i}]`)),
  };
}

/** Тело ошибки контракта `{error:{code,message,fieldErrors?}}`; `null`, если форма не подходит. */
export function parseErrorBody(
  value: unknown,
): { code: string; message: string; fieldErrors?: Record<string, string> } | null {
  if (typeof value !== "object" || value === null) return null;
  const error = (value as Obj).error;
  if (typeof error !== "object" || error === null) return null;
  const e = error as Obj;
  if (typeof e.code !== "string" || typeof e.message !== "string") return null;
  let fieldErrors: Record<string, string> | undefined;
  if (typeof e.fieldErrors === "object" && e.fieldErrors !== null && !Array.isArray(e.fieldErrors)) {
    const entries = Object.entries(e.fieldErrors as Obj);
    if (entries.every(([, v]) => typeof v === "string")) {
      fieldErrors = Object.fromEntries(entries) as Record<string, string>;
    }
  }
  return fieldErrors
    ? { code: e.code, message: e.message, fieldErrors }
    : { code: e.code, message: e.message };
}
