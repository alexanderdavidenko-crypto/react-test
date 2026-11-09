import { useCallback, useEffect, useState } from "react";
import { getSessions } from "../../shared/api/client.ts";
import type { ClientError } from "../../shared/api/errors.ts";
import type { SessionsResponse } from "../../shared/api/types.ts";
import type { SessionFilters } from "./filters.ts";

export type SessionsStatus = "loading" | "success" | "error";

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
  /** Фильтры, для которых получен результат. */
  filters: SessionFilters;
}

export interface UseSessionsResult extends State {
  /**
   * Фильтры, которым соответствуют показанные данные: при `loading` это прежние фильтры.
   * Нужны, чтобы прежнее пустое состояние (no-match) не переписывалось текстом новых фильтров.
   */
  shownFilters: SessionFilters;
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
        setSettled({ key, data: result.data, error: null, filters: { query, status } });
      } else if (!result.cancelled) {
        setSettled({ key, data: null, error: result.error, filters: { query, status } });
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
      shownFilters: settled.filters,
      isRefreshing: false,
      retry,
    };
  }
  const previous = settled?.data ?? null;
  return {
    status: "loading",
    data: previous,
    error: null,
    shownFilters: settled?.filters ?? filters,
    isRefreshing: previous !== null,
    retry,
  };
}
