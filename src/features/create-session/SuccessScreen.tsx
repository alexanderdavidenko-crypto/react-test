import { useRef, useState, type Ref } from "react";
import type { SessionDetails } from "../../shared/api/types.ts";
import { formatSummaryDateTime } from "../../shared/lib/datetime.ts";
import { copy } from "./copy.ts";

interface SuccessScreenProps {
  session: SessionDetails;
  filtersActive: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onOpenSession: () => void;
  onCreateAnother: () => void;
  onClearFilters: () => void;
  onClose: () => void;
}

/** Экран успеха внутри диалога (ui-design 7): заголовок и сводка в polite-статусе. */
export function SuccessScreen({
  session,
  filtersActive,
  headingRef,
  onOpenSession,
  onCreateAnother,
  onClearFilters,
  onClose,
}: SuccessScreenProps) {
  const [cleared, setCleared] = useState(false);
  const openRef = useRef<HTMLButtonElement>(null);

  function handleClearFilters(): void {
    // Фокус переносится до того, как кнопка исчезнет.
    openRef.current?.focus();
    setCleared(true);
    onClearFilters();
  }

  return (
    <>
      <div className="dialog-body">
        <div role="status" className="success-status">
          <h2 id="create-title" ref={headingRef} tabIndex={-1}>
            {copy.success.title}
          </h2>
          <p>{copy.success.summary(session.title, formatSummaryDateTime(session.startsAt))}</p>
          {cleared ? <p>{copy.success.filtersCleared}</p> : null}
        </div>
        {filtersActive && !cleared ? (
          <div className="success-filters">
            <p className="muted">{copy.success.filtersActive}</p>
            <button type="button" className="button button-secondary" onClick={handleClearFilters}>
              {copy.success.clearFilters}
            </button>
          </div>
        ) : null}
      </div>
      <footer className="dialog-footer form-footer">
        <button type="button" className="button button-secondary" onClick={onClose}>
          {copy.success.close}
        </button>
        <button type="button" className="button button-secondary" onClick={onCreateAnother}>
          {copy.success.another}
        </button>
        <button ref={openRef} type="button" className="button button-primary" onClick={onOpenSession}>
          {copy.success.open}
        </button>
      </footer>
    </>
  );
}
