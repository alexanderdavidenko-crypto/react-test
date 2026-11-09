import type { SessionStatus } from "../../shared/api/types.ts";
import { STATUS_LABELS } from "./copy.ts";

function Icon({ status }: { status: SessionStatus }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true,
    focusable: false,
  } as const;
  switch (status) {
    case "scheduled":
      return (
        <svg {...common}>
          <rect x="1.5" y="2.5" width="9" height="8" rx="1" />
          <path d="M1.5 5h9M4 1v2.5M8 1v2.5" />
        </svg>
      );
    case "full":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4.5" fill="currentColor" />
        </svg>
      );
    case "cancelled":
      return (
        <svg {...common}>
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
        </svg>
      );
    case "completed":
      return (
        <svg {...common}>
          <path d="M2 6.5l2.8 2.8L10 3.2" />
        </svg>
      );
  }
}

/** Статус не только цветом: форма-иконка (скрыта от скринридера) и видимый текст. */
export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      <Icon status={status} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
