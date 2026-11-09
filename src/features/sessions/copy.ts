import type { SessionStatus, SessionType, Visibility } from "../../shared/api/types.ts";
import type { ClientError } from "../../shared/api/errors.ts";
import type { SessionFilters } from "./filters.ts";

// Тексты интерфейса фичи (английский, решение 3=B).

export const STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  full: "Full",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const TYPE_LABELS: Record<SessionType, string> = {
  training: "Training",
  camp: "Camp",
  private: "Private",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public",
  "invite-only": "Invite only",
};

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export const copy = {
  pageTitle: "Training sessions",
  createSession: "Create session",
  searchLabel: "Search sessions",
  searchPlaceholder: "Title, coach, or location…",
  statusLabel: "Status",
  allStatuses: "All statuses",
  clearFilters: "Clear filters",
  loading: "Loading sessions…",
  emptyTitle: "No sessions yet",
  emptyBody: "Create the first training session to start building your schedule.",
  noMatchTitle: "No sessions match your filters",
  errorTitle: "Sessions couldn't be loaded",
  tryAgain: "Try again",

  sessionsCount: (n: number): string => plural(n, "session", "sessions"),
  matchCount: (n: number): string =>
    `${n} ${n === 1 ? "session matches" : "sessions match"} your filters`,
  filtersCleared: (countText: string): string => `Filters cleared. ${countText}.`,
  durationMinutes: (n: number): string => plural(n, "minute", "minutes"),
  durationShort: (n: number): string => `${n} min`,

  // Заголовки колонок списка (визуальные, aria-hidden; CSS приводит к верхнему регистру).
  columns: {
    session: "Session",
    start: "Start",
    coach: "Coach",
    capacity: "Capacity",
    status: "Status",
  },

  noMatchBody: (filters: SessionFilters): string => {
    const status = filters.status === "" ? "" : STATUS_LABELS[filters.status];
    if (filters.query !== "" && status !== "") {
      return `Nothing found for “${filters.query}” with status ${status}. Try different keywords or clear the filters.`;
    }
    if (filters.query !== "") {
      return `Nothing found for “${filters.query}”. Try different keywords or clear the filters.`;
    }
    return `No ${status} sessions found. Clear the filters to see all sessions.`;
  },

  errorBody: (error: ClientError | null): string => {
    if (error?.kind === "network") return "Check your connection and try again.";
    if (error?.kind === "malformed") {
      return "The server sent an unexpected response. Try again in a moment.";
    }
    return "Your filters are kept. Try again in a moment.";
  },

  details: {
    label: "Session details",
    closeAria: "Close session details",
    close: "Close",
    loading: "Loading session details…",
    errorTitle: "Session details couldn't be loaded",
    errorBody: "Try again, or close this window and pick another session.",
    notFoundTitle: "Session not found",
    notFoundBody: "It may have been removed, or the link may be wrong.",
    backToSessions: "Back to sessions",
    cancelled: "Cancelled",
    cancelReason: (reason: string): string => `Reason: ${reason}`,
    cancelledOn: (when: string): string => `Cancelled on ${when}`,
    schedule: "Schedule",
    coach: "Coach",
    location: "Location",
    capacity: "Capacity",
    typeVisibility: "Type and visibility",
    description: "Description",
    noDescription: "No description provided.",
    trainerNotes: "Trainer notes",
    noTrainerNotes: "No trainer notes.",
    created: (when: string): string => `Created ${when}`,
    updated: (when: string): string => `Last updated ${when}`,
    bookedOf: (booked: number, capacity: number): string =>
      `${booked} booked of ${plural(capacity, "place", "places")}`,
    placesLeft: (left: number): string => `${plural(left, "place", "places")} left`,
    noPlacesLeft: "No places left",
  },

  // Скрытые подписи для скринридера в строке списка.
  sr: {
    starts: "Starts: ",
    duration: "Duration: ",
    coach: "Coach: ",
    location: "Location: ",
    capacity: (booked: number, capacity: number): string =>
      `Capacity: ${booked} of ${capacity}`,
    status: "Status: ",
  },
} as const;
