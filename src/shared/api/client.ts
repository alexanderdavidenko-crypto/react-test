import { ApiError, NetworkError, ResponseShapeError, type ClientError } from "./errors.ts";
import {
  parseCoachesResponse,
  parseErrorBody,
  parseSessionDetails,
  parseSessionsResponse,
} from "./mappers.ts";
import type {
  CoachesResponse,
  CreateSessionRequest,
  SessionDetails,
  SessionsResponse,
  SessionStatus,
} from "./types.ts";

/** Отмена не ошибка данных: отдельный признак `cancelled`. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; cancelled: false; error: ClientError }
  | { ok: false; cancelled: true };

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface SessionsQuery {
  query?: string;
  status?: SessionStatus | "";
}

interface RequestSpec<T> {
  method: "GET" | "POST";
  path: string;
  expectedStatus: number;
  parse: (json: unknown) => T;
  body?: unknown;
  signal?: AbortSignal;
}

function failure(error: ClientError): ApiResult<never> {
  return { ok: false, cancelled: false, error };
}

// Единственное место вызова fetch.
async function request<T>(spec: RequestSpec<T>): Promise<ApiResult<T>> {
  const { signal } = spec;
  const headers: Record<string, string> = { Accept: "application/json" };
  const init: RequestInit = { method: spec.method, headers, signal };
  if (spec.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(spec.body);
  }

  let response: Response;
  try {
    response = await fetch(spec.path, init);
  } catch {
    return signal?.aborted ? { ok: false, cancelled: true } : failure(new NetworkError());
  }

  let text: string;
  try {
    text = await response.text();
  } catch {
    return signal?.aborted ? { ok: false, cancelled: true } : failure(new NetworkError());
  }
  if (signal?.aborted) return { ok: false, cancelled: true };

  let json: unknown;
  let jsonOk = true;
  try {
    json = JSON.parse(text);
  } catch {
    jsonOk = false;
  }

  if (!response.ok) {
    const body = jsonOk ? parseErrorBody(json) : null;
    if (body) {
      return failure(new ApiError(response.status, body.code, body.message, body.fieldErrors));
    }
    return failure(new ResponseShapeError("Error response has no contract body", response.status));
  }

  if (response.status !== spec.expectedStatus) {
    return failure(
      new ResponseShapeError(`Unexpected success status ${response.status}`, response.status),
    );
  }
  if (!jsonOk) {
    return failure(new ResponseShapeError("Response body is not JSON", response.status));
  }
  try {
    return { ok: true, data: spec.parse(json) };
  } catch (error) {
    if (error instanceof ResponseShapeError) {
      return failure(new ResponseShapeError(error.message, response.status));
    }
    throw error;
  }
}

export function getSessions(
  params: SessionsQuery = {},
  options: RequestOptions = {},
): Promise<ApiResult<SessionsResponse>> {
  const search = new URLSearchParams();
  const query = params.query?.trim();
  if (query) search.set("query", query);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return request({
    method: "GET",
    path: qs ? `/api/sessions?${qs}` : "/api/sessions",
    expectedStatus: 200,
    parse: parseSessionsResponse,
    signal: options.signal,
  });
}

export function getSessionDetails(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<SessionDetails>> {
  return request({
    method: "GET",
    path: `/api/sessions/${encodeURIComponent(id)}`,
    expectedStatus: 200,
    parse: (json) => parseSessionDetails(json),
    signal: options.signal,
  });
}

export function getCoaches(options: RequestOptions = {}): Promise<ApiResult<CoachesResponse>> {
  return request({
    method: "GET",
    path: "/api/coaches",
    expectedStatus: 200,
    parse: parseCoachesResponse,
    signal: options.signal,
  });
}

/** Создание не отменяется (решение 10=A), поэтому сигнал не принимается. */
export function createSession(request_: CreateSessionRequest): Promise<ApiResult<SessionDetails>> {
  return request({
    method: "POST",
    path: "/api/sessions",
    expectedStatus: 201,
    parse: (json) => parseSessionDetails(json),
    body: request_,
  });
}
