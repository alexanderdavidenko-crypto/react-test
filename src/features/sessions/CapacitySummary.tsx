import type { SessionStatus } from "../../shared/api/types.ts";
import { copy } from "./copy.ts";

interface CapacitySummaryProps {
  status: SessionStatus;
  capacity: number;
  bookedCount: number;
}

/** Q-4: текст несёт смысл, полоса декоративна. «left» не показывается для cancelled/completed. */
export function CapacitySummary({ status, capacity, bookedCount }: CapacitySummaryProps) {
  const inactive = status === "cancelled" || status === "completed";
  const left = capacity - bookedCount;
  const percent = capacity > 0 ? Math.min(100, Math.max(0, (bookedCount / capacity) * 100)) : 0;
  const tone = inactive ? "muted" : status === "full" ? "warning" : "primary";

  return (
    <div className="capacity-summary">
      <p>{copy.details.bookedOf(bookedCount, capacity)}</p>
      {inactive ? null : (
        <p className="muted">{left > 0 ? copy.details.placesLeft(left) : copy.details.noPlacesLeft}</p>
      )}
      <div className="capacity-bar" aria-hidden="true">
        <div className={`capacity-bar-fill capacity-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
