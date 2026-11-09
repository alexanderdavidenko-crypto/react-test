import { useCallback, useEffect, useState } from "react";
import { getCoaches } from "../../shared/api/client.ts";
import type { ClientError } from "../../shared/api/errors.ts";
import type { CoachSummary } from "../../shared/api/types.ts";

export type CoachesStatus = "loading" | "success" | "error";

export interface UseCoachesResult {
  status: CoachesStatus;
  /** Список последнего успешного ответа; пусто при loading и error. Ссылка меняется с каждым ответом. */
  coaches: readonly CoachSummary[];
  error: ClientError | null;
  retry: () => void;
}

interface Settled {
  key: number;
  coaches: readonly CoachSummary[];
  error: ClientError | null;
}

const NONE: readonly CoachSummary[] = [];

/**
 * Тренеры для формы: запрос при монтировании (форма открыта), без автоповтора. `retry` отменяет
 * незавершённый запрос и стартует новый. Статус `loading` выводится при рендере.
 */
export function useCoaches(): UseCoachesResult {
  const [settled, setSettled] = useState<Settled | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void getCoaches({ signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setSettled({ key: attempt, coaches: result.data.data, error: null });
      } else if (!result.cancelled) {
        setSettled({ key: attempt, coaches: NONE, error: result.error });
      }
    });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (settled === null || settled.key !== attempt) {
    return { status: "loading", coaches: NONE, error: null, retry };
  }
  return {
    status: settled.error === null ? "success" : "error",
    coaches: settled.coaches,
    error: settled.error,
    retry,
  };
}
