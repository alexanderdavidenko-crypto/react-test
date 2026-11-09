import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SESSION_STATUSES, type SessionStatus } from "../../shared/api/types.ts";
import { navigate, readHistoryState, useLocation } from "../../shared/router/index.ts";
import { copy, STATUS_LABELS } from "./copy.ts";
import { clearFilters, hasActiveFilters, readFilters, writeFilters, type FilterUpdate } from "./filters.ts";
import { LiveStatus } from "./LiveStatus.tsx";
import { SessionRow } from "./SessionRow.tsx";
import { useSessions } from "./useSessions.ts";

/** Пауза после последнего символа перед записью поиска в URL. */
export const SEARCH_DEBOUNCE_MS = 300;

const SKELETON_ROWS = 5;

interface SessionsPageProps {
  /** В S6 форма создания не реализована: без обработчика кнопка ничего не делает. */
  onCreateSession?: () => void;
}

function isStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

export function SessionsPage({ onCreateSession }: SessionsPageProps) {
  const { pathname, search } = useLocation();
  const filters = readFilters(search);
  const active = hasActiveFilters(filters);
  const { status, data, error, isRefreshing, retry } = useSessions(filters);

  // Локальное transient-значение поля; в URL уходит с debounce. Внешнее изменение URL
  // (Назад, сброс) синхронизируется в поле во время рендера.
  const [text, setText] = useState(filters.query);
  const [seenQuery, setSeenQuery] = useState(filters.query);
  if (seenQuery !== filters.query) {
    setSeenQuery(filters.query);
    if (filters.query !== text.trim()) setText(filters.query);
  }
  const [justCleared, setJustCleared] = useState(false);

  const searchInput = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ pathname, search });
  useEffect(() => {
    latest.current = { pathname, search };
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function replaceFilters(next: (search: string) => string): void {
    const current = latest.current;
    const nextSearch = next(current.search);
    if (nextSearch === current.search) return;
    navigate(`${current.pathname}${nextSearch}`, { replace: true, state: readHistoryState() });
  }

  function writeUpdate(update: FilterUpdate): void {
    replaceFilters((s) => writeFilters(s, update));
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setText(value);
    setJustCleared(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => writeUpdate({ query: value }), SEARCH_DEBOUNCE_MS);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value;
    setJustCleared(false);
    writeUpdate({ status: isStatus(value) ? value : "" });
  }

  function handleClear(): void {
    window.clearTimeout(timer.current);
    setText("");
    setJustCleared(true);
    // Фокус переносится до того, как кнопка исчезнет вместе с фильтрами.
    searchInput.current?.focus();
    replaceFilters(clearFilters);
  }

  const total = data?.meta.total ?? 0;
  const rows = data?.data ?? [];

  let liveMessage = "";
  if (status === "loading") {
    liveMessage = copy.loading;
  } else if (status === "success") {
    if (rows.length === 0) {
      liveMessage = active ? copy.noMatchTitle : copy.emptyTitle;
    } else if (justCleared) {
      liveMessage = copy.filtersCleared(copy.sessionsCount(total));
    } else {
      liveMessage = active ? copy.matchCount(total) : copy.sessionsCount(total);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1 tabIndex={-1}>{copy.pageTitle}</h1>
        <button type="button" className="button button-primary" onClick={onCreateSession}>
          {copy.createSession}
        </button>
      </header>

      <div className="toolbar">
        <div className="toolbar-search">
          <label htmlFor="sessions-search" className="visually-hidden">
            {copy.searchLabel}
          </label>
          <input
            ref={searchInput}
            id="sessions-search"
            name="query"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={copy.searchPlaceholder}
            value={text}
            onChange={handleSearchChange}
          />
        </div>
        <div className="toolbar-status">
          <label htmlFor="sessions-status" className="visually-hidden">
            {copy.statusLabel}
          </label>
          <select
            id="sessions-status"
            name="status"
            value={filters.status}
            onChange={handleStatusChange}
          >
            <option value="">{copy.allStatuses}</option>
            {SESSION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        {active ? (
          <button type="button" className="button button-secondary" onClick={handleClear}>
            {copy.clearFilters}
          </button>
        ) : null}
      </div>

      <section className="list-area" aria-busy={isRefreshing}>
        {status === "error" ? (
          <div role="alert" className="state-message">
            <h2>{copy.errorTitle}</h2>
            <p>{copy.errorBody(error)}</p>
            <button type="button" className="button button-primary" onClick={retry}>
              {copy.tryAgain}
            </button>
          </div>
        ) : null}

        {status === "loading" && data === null ? (
          <ul className="session-list" aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <li key={i} className="session-row skeleton-row">
                <span className="skeleton-line" />
              </li>
            ))}
          </ul>
        ) : null}

        {data !== null && status !== "error" && rows.length === 0 && status === "success" ? (
          active ? (
            <div className="state-message">
              <h2>{copy.noMatchTitle}</h2>
              <p>{copy.noMatchBody(filters)}</p>
              <button type="button" className="button button-secondary" onClick={handleClear}>
                {copy.clearFilters}
              </button>
            </div>
          ) : (
            <div className="state-message">
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyBody}</p>
              <button type="button" className="button button-primary" onClick={onCreateSession}>
                {copy.createSession}
              </button>
            </div>
          )
        ) : null}

        {data !== null && status !== "error" && rows.length > 0 ? (
          <div className={isRefreshing ? "list-content is-refreshing" : "list-content"}>
            <p className="list-count">{copy.sessionsCount(total)}</p>
            <div className="session-list-head" aria-hidden="true">
              <span>Session</span>
              <span>Start</span>
              <span>Coach</span>
              <span>Capacity</span>
              <span>Status</span>
            </div>
            <ul className="session-list">
              {rows.map((session) => (
                <SessionRow key={session.id} session={session} search={search} />
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <LiveStatus message={liveMessage} />
    </main>
  );
}
