import { useCallback, useEffect, useState } from "react";
import { getSessionDetails } from "../../shared/api/client.ts";
import { isApiError, type ClientError } from "../../shared/api/errors.ts";
import type { SessionDetails } from "../../shared/api/types.ts";

export type SessionDetailsStatus = "idle" | "loading" | "success" | "error" | "not-found";

export interface UseSessionDetailsResult {
  status: SessionDetailsStatus;
  /** Только данные текущего `id`; при смене `id` прежние данные не показываются. */
  data: SessionDetails | null;
  error: ClientError | null;
  retry: () => void;
}

interface Settled {
  /** Ключ запроса, которому принадлежит результат. */
  key: string;
  data: SessionDetails | null;
  error: ClientError | null;
}

/**
 * Детали сессии по `id`. Без `id` запрос не выполняется (`idle`). Запрос отменяется при смене `id`
 * и размонтировании. Состояние `loading` выводится при рендере (ключ не совпал с ключом результата).
 */
export function useSessionDetails(id: string | null): UseSessionDetailsResult {
  const [settled, setSettled] = useState<Settled | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([id, attempt]);

  useEffect(() => {
    if (id === null) return;
    const controller = new AbortController();
    void getSessionDetails(id, { signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setSettled({ key, data: result.data, error: null });
      } else if (!result.cancelled) {
        setSettled({ key, data: null, error: result.error });
      }
    });
    return () => controller.abort();
  }, [id, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (id === null) return { status: "idle", data: null, error: null, retry };
  if (settled === null || settled.key !== key) {
    return { status: "loading", data: null, error: null, retry };
  }
  if (settled.error === null) {
    return { status: "success", data: settled.data, error: null, retry };
  }
  const notFound = isApiError(settled.error, "SESSION_NOT_FOUND");
  return { status: notFound ? "not-found" : "error", data: null, error: settled.error, retry };
}
