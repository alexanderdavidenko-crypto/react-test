import { useCallback, useEffect, useState } from "react";
import { getSessions } from "../../shared/api/client.ts";
import type { ClientError } from "../../shared/api/errors.ts";
import type { SessionsResponse } from "../../shared/api/types.ts";
import type { SessionFilters } from "./filters.ts";

export type SessionsStatus = "idle" | "loading" | "success" | "error";

interface State {
  status: SessionsStatus;
  data: SessionsResponse | null;
  error: ClientError | null;
}

interface Settled {
  /** Ключ запроса, которому принадлежит результат. */
  key: string;
  data: SessionsResponse | null;
  error: ClientError | null;
}

export interface UseSessionsResult extends State {
  /** Идёт загрузка при уже имеющихся (прежних) данных: список приглушается. */
  isRefreshing: boolean;
  retry: () => void;
}

/**
 * Список сессий по фильтрам. Запрос отменяется при смене фильтров и размонтировании, устаревшие
 * ответы игнорируются. Прежние данные сохраняются на время `loading`. `reloadKey` — сигнал
 * принудительного обновления (после создания сессии). Состояние `loading` выводится при рендере
 * (ключ запроса не совпадает с ключом последнего результата), без setState в эффекте.
 */
export function useSessions(filters: SessionFilters, reloadKey = 0): UseSessionsResult {
  const [settled, setSettled] = useState<Settled | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { query, status } = filters;
  const key = JSON.stringify([query, status, attempt, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    void getSessions({ query, status }, { signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setSettled({ key, data: result.data, error: null });
      } else if (!result.cancelled) {
        setSettled({ key, data: null, error: result.error });
      }
    });
    return () => controller.abort();
  }, [key, query, status]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (settled !== null && settled.key === key) {
    return {
      status: settled.error === null ? "success" : "error",
      data: settled.data,
      error: settled.error,
      isRefreshing: false,
      retry,
    };
  }
  const previous = settled?.data ?? null;
  return { status: "loading", data: previous, error: null, isRefreshing: previous !== null, retry };
}
