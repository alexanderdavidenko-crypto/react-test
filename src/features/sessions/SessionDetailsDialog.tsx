import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from "react";
import type { SessionDetails } from "../../shared/api/types.ts";
import { formatDetailsSchedule, formatTimestamp } from "../../shared/lib/datetime.ts";
import { cameFromList, goBack, navigate, useLocation } from "../../shared/router/index.ts";
import { CapacitySummary } from "./CapacitySummary.tsx";
import { copy, TYPE_LABELS, VISIBILITY_LABELS } from "./copy.ts";
import { StatusBadge } from "./StatusBadge.tsx";
import { useSessionDetails } from "./useSessionDetails.ts";

interface SessionDetailsDialogProps {
  id: string;
}

const SKELETON_BLOCKS = 4;

/** Возврат фокуса: ссылка строки с этим id, иначе h1 страницы (ui-design 8). */
function restoreFocus(id: string): void {
  const links = document.querySelectorAll<HTMLAnchorElement>("a[data-session-id]");
  const row = Array.from(links).find((link) => link.dataset.sessionId === id);
  const target = row ?? document.querySelector<HTMLElement>("h1");
  target?.focus();
}

function CancellationBlock({ details }: { details: SessionDetails }) {
  const { cancellation } = details;
  if (cancellation === null) return null;
  return (
    <section className="details-cancellation">
      <h3>
        <span aria-hidden="true">✕ </span>
        {copy.details.cancelled}
      </h3>
      {cancellation.reason === null || cancellation.reason === "" ? null : (
        <p>{copy.details.cancelReason(cancellation.reason)}</p>
      )}
      <p>{copy.details.cancelledOn(formatTimestamp(cancellation.cancelledAt))}</p>
    </section>
  );
}

function TextSection({ title, text, fallback }: { title: string; text: string | null; fallback: string }) {
  const hasText = text !== null && text.trim() !== "";
  return (
    <section className="details-section">
      <h3>{title}</h3>
      {hasText ? <p className="details-text">{text}</p> : <p className="muted">{fallback}</p>}
    </section>
  );
}

function DetailsBody({ details }: { details: SessionDetails }) {
  return (
    <>
      <CancellationBlock details={details} />
      <section className="details-section">
        <h3>{copy.details.schedule}</h3>
        <p>{formatDetailsSchedule(details.startsAt)}</p>
        <p className="muted">{copy.durationMinutes(details.durationMinutes)}</p>
      </section>
      <section className="details-section">
        <h3>{copy.details.coach}</h3>
        <p>{details.coach.name}</p>
        <p>
          <a href={`mailto:${details.coach.email}`}>{details.coach.email}</a>
        </p>
      </section>
      <section className="details-section">
        <h3>{copy.details.location}</h3>
        <p>{details.location.name}</p>
        <p className="muted">{details.location.address}</p>
      </section>
      <section className="details-section">
        <h3>{copy.details.capacity}</h3>
        <CapacitySummary
          status={details.status}
          capacity={details.capacity}
          bookedCount={details.bookedCount}
        />
      </section>
      <section className="details-section">
        <h3>{copy.details.typeVisibility}</h3>
        <p>
          {TYPE_LABELS[details.type]}
          {" · "}
          {VISIBILITY_LABELS[details.visibility]}
        </p>
      </section>
      <TextSection
        title={copy.details.description}
        text={details.description}
        fallback={copy.details.noDescription}
      />
      <TextSection
        title={copy.details.trainerNotes}
        text={details.trainerNotes}
        fallback={copy.details.noTrainerNotes}
      />
      <p className="muted small">
        {copy.details.created(formatTimestamp(details.createdAt))}
        {" · "}
        {copy.details.updated(formatTimestamp(details.updatedAt))}
      </p>
    </>
  );
}

/**
 * Детали сессии в нативном `<dialog>`. Монтируется только на `/sessions/:id` (URL — единственная
 * истина видимости); закрытие всегда через навигацию. Родитель задаёт `key={id}`.
 */
export function SessionDetailsDialog({ id }: SessionDetailsDialogProps) {
  const { search } = useLocation();
  const { status, data, retry } = useSessionDetails(id);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const closing = useRef(false);

  // Синхронизация с URL: showModal при монтировании, close и возврат фокуса при размонтировании.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (!dialog.open) dialog.showModal();
    headingRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      restoreFocus(id);
    };
  }, [id]);

  // Если нажатая кнопка исчезла (Try again), фокус возвращается на h2 после окончания загрузки.
  useEffect(() => {
    if (status === "loading" || status === "idle") return;
    const active = document.activeElement;
    if (active === null || active === document.body || active === dialogRef.current) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  function close(): void {
    if (closing.current) return;
    closing.current = true;
    if (cameFromList()) {
      goBack();
    } else {
      navigate(`/sessions${search}`, { replace: true });
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    close();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) close();
  }

  const title = status === "success" && data !== null ? data.title : copy.details.label;
  const isNotFound = status === "not-found";

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="details-title"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="dialog-frame">
        <header className="dialog-header">
          <div className="dialog-header-main">
            <span className="details-label">{copy.details.label}</span>
            <h2 id="details-title" ref={headingRef} tabIndex={-1}>
              {title}
            </h2>
            {status === "success" && data !== null ? <StatusBadge status={data.status} /> : null}
          </div>
          <button
            type="button"
            className="dialog-close"
            aria-label={copy.details.closeAria}
            onClick={close}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="dialog-body">
          {status === "loading" || status === "idle" ? (
            <>
              <div role="status" className="visually-hidden">
                {copy.details.loading}
              </div>
              <div aria-hidden="true">
                {Array.from({ length: SKELETON_BLOCKS }, (_, i) => (
                  <span key={i} className="skeleton-line details-skeleton" />
                ))}
              </div>
            </>
          ) : null}

          {status === "error" ? (
            <div role="alert" className="details-state">
              <h3>{copy.details.errorTitle}</h3>
              <p className="muted">{copy.details.errorBody}</p>
              <button type="button" className="button button-primary" onClick={retry}>
                {copy.tryAgain}
              </button>
            </div>
          ) : null}

          {isNotFound ? (
            <div className="details-state">
              <h3>{copy.details.notFoundTitle}</h3>
              <p className="muted">{copy.details.notFoundBody}</p>
            </div>
          ) : null}

          {status === "success" && data !== null ? <DetailsBody details={data} /> : null}
        </div>

        <footer className="dialog-footer">
          {isNotFound ? (
            <button type="button" className="button button-primary" onClick={close}>
              {copy.details.backToSessions}
            </button>
          ) : (
            <button type="button" className="button button-secondary" onClick={close}>
              {copy.details.close}
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
