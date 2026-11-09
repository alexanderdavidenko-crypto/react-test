import { useCallback, useRef, useState } from "react";
import { createSession } from "../../shared/api/client.ts";
import type { ClientError } from "../../shared/api/errors.ts";
import type { CoachSummary, CreateSessionRequest, SessionDetails } from "../../shared/api/types.ts";
import type { CoachesStatus } from "./useCoaches.ts";

export type CreateStatus = "idle" | "pending" | "success" | "error";

export type SubmitOutcome =
  | { kind: "ignored" }
  | { kind: "blocked" }
  | { kind: "success"; session: SessionDetails }
  | { kind: "error"; error: ClientError };

export interface CoachesGuard {
  status: CoachesStatus;
  coaches: readonly CoachSummary[];
}

export interface UseCreateSessionResult {
  status: CreateStatus;
  session: SessionDetails | null;
  error: ClientError | null;
  /** Серверные `fieldErrors` по ключам контракта. */
  fieldErrors: Record<string, string>;
  submit: (request: CreateSessionRequest) => Promise<SubmitOutcome>;
  /** Снимает серверную ошибку поля при его редактировании. */
  clearFieldError: (serverKey: string) => void;
  reset: () => void;
}

const NO_ERRORS: Record<string, string> = {};

/**
 * Отправка формы. Guard (api-integration, раздел 9): `createSession` не вызывается, пока список
 * тренеров не загружен успешно или `coachId` не входит в него. Флаг pending (ref, срабатывает
 * синхронно) блокирует повторный вызов; POST не отменяется.
 */
export function useCreateSession(guard: CoachesGuard): UseCreateSessionResult {
  const [status, setStatus] = useState<CreateStatus>("idle");
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<ClientError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(NO_ERRORS);
  const pending = useRef(false);
  const { status: coachesStatus, coaches } = guard;

  const submit = useCallback(
    async (request: CreateSessionRequest): Promise<SubmitOutcome> => {
      if (pending.current) return { kind: "ignored" };
      if (coachesStatus !== "success" || !coaches.some((coach) => coach.id === request.coachId)) {
        return { kind: "blocked" };
      }
      pending.current = true;
      setStatus("pending");
      setError(null);
      setFieldErrors(NO_ERRORS);
      const result = await createSession(request);
      pending.current = false;
      if (result.ok) {
        setSession(result.data);
        setStatus("success");
        return { kind: "success", session: result.data };
      }
      // Недостижимо: у POST нет signal (решение 10=A). Ветка оставлена, потому что тип результата
      // клиента `ApiResult` (публичный контракт shared/api) включает `cancelled`.
      if (result.cancelled) {
        setStatus("idle");
        return { kind: "ignored" };
      }
      setError(result.error);
      setFieldErrors(result.error.kind === "api" ? (result.error.fieldErrors ?? NO_ERRORS) : NO_ERRORS);
      setStatus("error");
      return { kind: "error", error: result.error };
    },
    [coachesStatus, coaches],
  );

  const clearFieldError = useCallback((serverKey: string) => {
    setFieldErrors((current) => {
      if (!Object.hasOwn(current, serverKey)) return current;
      const { [serverKey]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const reset = useCallback(() => {
    if (pending.current) return;
    setStatus("idle");
    setSession(null);
    setError(null);
    setFieldErrors(NO_ERRORS);
  }, []);

  return { status, session, error, fieldErrors, submit, clearFieldError, reset };
}
