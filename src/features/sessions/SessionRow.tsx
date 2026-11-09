import type { MouseEvent } from "react";
import type { SessionSummary } from "../../shared/api/types.ts";
import { formatListDateTime } from "../../shared/lib/datetime.ts";
import { FROM_LIST_STATE, navigate } from "../../shared/router/index.ts";
import { copy, TYPE_LABELS } from "./copy.ts";
import { StatusBadge } from "./StatusBadge.tsx";

interface SessionRowProps {
  session: SessionSummary;
  /** Текущий search (с `?`), сохраняется в ссылке на детали. */
  search: string;
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function SessionRow({ session, search }: SessionRowProps) {
  const href = `/sessions/${encodeURIComponent(session.id)}${search}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    // Модификаторы и средняя кнопка остаются за браузером (новая вкладка).
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    navigate(href, { state: FROM_LIST_STATE });
  }

  return (
    <li className="session-row">
      <div className="cell cell-session">
        <a
          className="session-link"
          href={href}
          data-session-id={session.id}
          onClick={handleClick}
        >
          {session.title}
        </a>
        <span className="muted">
          {TYPE_LABELS[session.type]}
          {" · "}
          <span className="visually-hidden">{copy.sr.location}</span>
          {session.location.name}
        </span>
      </div>
      <div className="cell cell-start">
        <span>
          <span className="visually-hidden">{copy.sr.starts}</span>
          {formatListDateTime(session.startsAt)}
        </span>
        <span className="muted small">
          <span className="visually-hidden">{copy.sr.duration}</span>
          {copy.durationMinutes(session.durationMinutes)}
        </span>
      </div>
      <div className="cell cell-coach">
        <span className="visually-hidden">{copy.sr.coach}</span>
        {session.coach.name}
      </div>
      <div className="cell cell-capacity">
        <span className="visually-hidden">
          {copy.sr.capacity(session.bookedCount, session.capacity)}
        </span>
        <span aria-hidden="true">
          {session.bookedCount} / {session.capacity}
        </span>
      </div>
      <div className="cell cell-status">
        <span className="visually-hidden">{copy.sr.status}</span>
        <StatusBadge status={session.status} />
      </div>
    </li>
  );
}
