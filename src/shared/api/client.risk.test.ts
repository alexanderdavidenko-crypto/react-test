import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse, type JsonBodyType } from "msw";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { useSessions } from "../../features/sessions/useSessions.ts";
import { server } from "../../mocks/node.ts";
import { findSession, listSessions, toSummary } from "../../mocks/store.ts";
import {
  createSession,
  getCoaches,
  getSessionDetails,
  getSessions,
  type ApiResult,
  type SessionsQuery,
} from "./client.ts";
import { ApiError, NetworkError, ResponseShapeError } from "./errors.ts";
import type { CreateSessionRequest } from "./types.ts";

// risk-based, не входят в обязательный набор AC-9.1 (implementation-plan раздел 8, api-integration раздел 14).
// Риск: без бэкенда `preview` отвечает HTML со статусом 200, а неверная форма ответа или потерянная отмена
// запроса молча портят интерфейс. Проверяется только граница HTTP (msw/node) и хук списка; тексты и
// вёрстка здесь не проверяются.

const NEW_SESSION: CreateSessionRequest = {
  title: "Evening Footwork",
  type: "training",
  startsAt: "2026-09-15T18:30:00Z",
  durationMinutes: 90,
  coachId: "coach_01",
  locationName: "North Court",
  locationAddress: "12 Lake Street",
  capacity: 12,
  visibility: "public",
};

const HTML = "<!doctype html><html><body>preview</body></html>";
const htmlResponse = (status: number) =>
  new HttpResponse(HTML, { status, headers: { "Content-Type": "text/html" } });

type Method = "get" | "post";
// [имя, метод, путь, вызов, статус успеха по контракту]
const ENDPOINTS: readonly (readonly [string, Method, string, () => Promise<ApiResult<unknown>>, number])[] = [
  ["getSessions", "get", "/api/sessions", () => getSessions(), 200],
  ["getSessionDetails", "get", "/api/sessions/ses_101", () => getSessionDetails("ses_101"), 200],
  ["getCoaches", "get", "/api/coaches", () => getCoaches(), 200],
  ["createSession", "post", "/api/sessions", () => createSession(NEW_SESSION), 201],
];

function failureOf(result: ApiResult<unknown>): Error & { status?: number } {
  if (result.ok || result.cancelled) throw new Error(`expected an error result, got ${JSON.stringify(result)}`);
  return result.error;
}

describe("shared/api: HTTP boundary", () => {
  it.each(ENDPOINTS)("%s: HTML body with the success status (preview without backend) is ResponseShapeError", async (_n, method, path, call, ok) => {
    server.use(http[method](path, () => htmlResponse(ok)));
    const error = failureOf(await call());
    expect(error).toBeInstanceOf(ResponseShapeError);
    expect(error.status).toBe(ok);
  });

  it.each(ENDPOINTS)("%s: a valid JSON body with an unexpected success status is ResponseShapeError", async (_n, method, path, call, ok) => {
    const wrong = ok === 200 ? 201 : 200;
    server.use(http[method](path, () => HttpResponse.json({}, { status: wrong })));
    const error = failureOf(await call());
    expect(error).toBeInstanceOf(ResponseShapeError);
    expect(error.status).toBe(wrong);
  });

  it.each(ENDPOINTS)("%s: a dropped connection is NetworkError", async (_n, method, path, call) => {
    server.use(http[method](path, () => HttpResponse.error()));
    expect(failureOf(await call())).toBeInstanceOf(NetworkError);
  });

  it.each(ENDPOINTS)("%s: 500 with a contract body is ApiError with code and message, no fieldErrors", async (_n, method, path, call) => {
    server.use(
      http[method](path, () =>
        HttpResponse.json({ error: { code: "BOOM", message: "It broke." } }, { status: 500 }),
      ),
    );
    const error = failureOf(await call());
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: "BOOM", message: "It broke.", fieldErrors: undefined });
  });

  it("400 with fieldErrors keeps them on ApiError", async () => {
    server.use(
      http.post("/api/sessions", () =>
        HttpResponse.json(
          { error: { code: "VALIDATION_FAILED", message: "Invalid.", fieldErrors: { title: "Too short." } } },
          { status: 400 },
        ),
      ),
    );
    const error = failureOf(await createSession(NEW_SESSION));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: "VALIDATION_FAILED", fieldErrors: { title: "Too short." } });
  });

  // Не-2xx без контрактного тела -> ResponseShapeError с HTTP-статусом, а не ApiError и не NetworkError.
  it.each<[string, number, () => Response]>([
    ["HTML", 500, () => htmlResponse(500)],
    ["empty body", 502, () => new HttpResponse(null, { status: 502 })],
    ["JSON without error", 400, () => HttpResponse.json({ message: "nope" }, { status: 400 })],
    ["error without code", 400, () => HttpResponse.json({ error: { message: "x" } }, { status: 400 })],
    ["error with a non-string message", 500, () => HttpResponse.json({ error: { code: "X", message: 5 } }, { status: 500 })],
    ["JSON null", 503, () => HttpResponse.json(null, { status: 503 })],
  ])("non-2xx without a contract body (%s, %i) is ResponseShapeError carrying the status", async (_label, status, respond) => {
    server.use(http.post("/api/sessions", respond));
    const error = failureOf(await createSession(NEW_SESSION));
    expect(error).toBeInstanceOf(ResponseShapeError);
    expect(error.status).toBe(status);
  });

  it("drops fieldErrors with non-string values instead of passing them on", async () => {
    server.use(
      http.post("/api/sessions", () =>
        HttpResponse.json(
          { error: { code: "VALIDATION_FAILED", message: "Invalid.", fieldErrors: { title: 5 } } },
          { status: 400 },
        ),
      ),
    );
    const error = failureOf(await createSession(NEW_SESSION));
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).fieldErrors).toBeUndefined();
  });
});

describe("shared/api: wrong shape of a successful response", () => {
  const summary = () => toSummary(listSessions()[0]);
  const list = (item: JsonBodyType) => ({ data: [item], meta: { page: 1, pageSize: 10, total: 1 } });
  const respondList = (body: JsonBodyType) => server.use(http.get("/api/sessions", () => HttpResponse.json(body)));

  it("accepts a valid body and ignores extra fields (control for the cases below)", async () => {
    respondList(list({ ...summary(), somethingNew: 1 }));
    const result = await getSessions();
    expect(result.ok).toBe(true);
  });

  it.each<[string, () => JsonBodyType]>([
    ["unknown status enum", () => list({ ...summary(), status: "archived" })],
    ["unknown type enum", () => list({ ...summary(), type: "yoga" })],
    ["not an ISO date", () => list({ ...summary(), startsAt: "next Monday" })],
    ["ISO date without Z", () => list({ ...summary(), startsAt: "2026-08-03T18:00:00" })],
    ["impossible calendar date", () => list({ ...summary(), startsAt: "2026-02-30T10:00:00Z" })],
    ["numeric field as string", () => list({ ...summary(), capacity: "12" })],
    ["missing coach", () => list({ ...summary(), coach: undefined })],
    ["missing meta", () => ({ data: [summary()] })],
    ["meta with a non-number", () => ({ data: [summary()], meta: { page: 1, pageSize: 10, total: "1" } })],
    ["data is not an array", () => ({ data: {}, meta: { page: 1, pageSize: 10, total: 0 } })],
    ["body is an array", () => []],
    ["body is null", () => null],
  ])("getSessions: %s -> ResponseShapeError with status 200", async (_label, body) => {
    respondList(body());
    const error = failureOf(await getSessions());
    expect(error).toBeInstanceOf(ResponseShapeError);
    expect(error.status).toBe(200);
  });

  it("getSessionDetails: missing cancellation or a non-ISO createdAt -> ResponseShapeError", async () => {
    const details = findSession("ses_101")!;
    for (const broken of [
      { ...details, cancellation: undefined },
      { ...details, createdAt: "yesterday" },
      { ...details, description: 5 },
    ]) {
      server.use(http.get("/api/sessions/ses_101", () => HttpResponse.json(broken)));
      expect(failureOf(await getSessionDetails("ses_101"))).toBeInstanceOf(ResponseShapeError);
    }
  });

  it("createSession: a 201 with a wrong shape -> ResponseShapeError", async () => {
    server.use(http.post("/api/sessions", () => HttpResponse.json({ id: "ses_1" }, { status: 201 })));
    const error = failureOf(await createSession(NEW_SESSION));
    expect(error).toBeInstanceOf(ResponseShapeError);
    expect(error.status).toBe(201);
  });
});

describe("shared/api: list request parameters", () => {
  async function requestUrl(params?: SessionsQuery): Promise<URL> {
    let seen: URL | undefined;
    server.use(
      http.get("/api/sessions", ({ request }) => {
        seen = new URL(request.url);
        return undefined; // дальше отвечает базовый обработчик
      }),
    );
    await getSessions(params);
    if (seen === undefined) throw new Error("request was not observed");
    return seen;
  }

  it.each<[string, SessionsQuery | undefined, string]>([
    ["no params", undefined, ""],
    ["empty values", { query: "", status: "" }, ""],
    ["whitespace query", { query: "   ", status: "" }, ""],
    ["query only, trimmed", { query: "  shooting ", status: "" }, "?query=shooting"],
    ["status only", { status: "full" }, "?status=full"],
    ["query and status, in this order", { status: "full", query: "Maya" }, "?query=Maya&status=full"],
    ["query is URL-encoded", { query: "a&b=c d" }, "?query=a%26b%3Dc+d"],
  ])("%s -> %j sends exactly %j", async (_label, params, search) => {
    expect((await requestUrl(params)).search).toBe(search);
  });

  it("never sends scenario or other page parameters, even with ?scenario= in the page URL", async () => {
    window.history.replaceState(null, "", "/sessions?scenario=list-error&utm=1&query=page");
    const withExtras: SessionsQuery & Record<string, unknown> = {
      query: "x",
      status: "full",
      scenario: "list-error",
      utm: "1",
    };
    const url = await requestUrl(withExtras);
    expect(url.search).toBe("?query=x&status=full");
    expect(url.searchParams.has("scenario")).toBe(false);
  });
});

describe("shared/api: cancellation", () => {
  function gate() {
    let open!: () => void;
    const opened = new Promise<void>((resolve) => {
      open = resolve;
    });
    return { opened, open };
  }
  const later = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const staleBody = () => ({ data: [toSummary(listSessions()[0])], meta: { page: 1, pageSize: 10, total: 1 } });

  it("an aborted request resolves as cancelled, not as an error, even if the server answers later", async () => {
    const g = gate();
    server.use(
      http.get("/api/sessions", async () => {
        await g.opened;
        return HttpResponse.json(staleBody());
      }),
    );
    const controller = new AbortController();
    const pending = getSessions({}, { signal: controller.signal });
    controller.abort();
    g.open();
    expect(await pending).toEqual({ ok: false, cancelled: true });
  });

  it("a slow response of a superseded filter never replaces the newer result", async () => {
    const g = gate();
    server.use(
      http.get("/api/sessions", async ({ request }) => {
        if (new URL(request.url).searchParams.get("query") !== "slow") return undefined;
        await g.opened;
        return HttpResponse.json(staleBody());
      }),
    );
    const { result, rerender } = renderHook(({ query }) => useSessions({ query, status: "" }), {
      initialProps: { query: "slow" },
    });
    rerender({ query: "" }); // пользователь сменил фильтр, пока «slow» в полёте
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data?.meta.total).toBe(5);

    g.open(); // запоздавший ответ первого запроса
    await later(60);
    expect(result.current.status).toBe("success");
    expect(result.current.data?.meta.total).toBe(5);
    expect(result.current.shownFilters).toEqual({ query: "", status: "" });
  });

  it("under StrictMode the response of the first (cancelled) mount request is ignored", async () => {
    const g = gate();
    let calls = 0;
    server.use(
      http.get("/api/sessions", async () => {
        calls += 1;
        if (calls !== 1) return undefined;
        await g.opened; // первый запрос (до эмулированного размонтирования) отвечает поздно и «чужими» данными
        return HttpResponse.json(staleBody());
      }),
    );
    const { result } = renderHook(() => useSessions({ query: "", status: "" }), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(calls).toBe(2); // StrictMode: монтирование, отмена, повторное монтирование
    expect(result.current.data?.meta.total).toBe(5);

    g.open();
    await later(60);
    expect(result.current.status).toBe("success");
    expect(result.current.data?.meta.total).toBe(5);
  });
});
