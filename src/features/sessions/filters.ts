import { updateSearch } from "../../shared/router/index.ts";
import { SESSION_STATUSES, type SessionStatus } from "../../shared/api/types.ts";

// Фильтры списка живут только в URL. Здесь знают имена `query` и `status`; остальные параметры
// (в том числе `scenario`) остаются нетронутыми.

export interface SessionFilters {
  query: string;
  /** Пустая строка = «все статусы». */
  status: SessionStatus | "";
}

export interface FilterUpdate {
  query?: string;
  status?: SessionStatus | "";
}

function isStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

/** Чтение из search: `query` после trim, невалидный `status` = «все» (на сервер не уходит). */
export function readFilters(search: string): SessionFilters {
  const params = new URLSearchParams(search);
  const rawStatus = params.get("status") ?? "";
  return {
    query: (params.get("query") ?? "").trim(),
    status: isStatus(rawStatus) ? rawStatus : "",
  };
}

/** Новый search с обновлёнными `query`/`status`; пустое значение удаляет параметр. */
export function writeFilters(search: string, update: FilterUpdate): string {
  const updates: Record<string, string> = {};
  if (update.query !== undefined) updates.query = update.query.trim();
  if (update.status !== undefined) updates.status = update.status;
  return updateSearch(search, updates);
}

/** Сброс удаляет только `query` и `status`. */
export function clearFilters(search: string): string {
  return updateSearch(search, { query: null, status: null });
}

export function hasActiveFilters(filters: SessionFilters): boolean {
  return filters.query !== "" || filters.status !== "";
}
