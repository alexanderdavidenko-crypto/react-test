import type { ClientError } from "../../shared/api/errors.ts";
import { isApiError } from "../../shared/api/errors.ts";

// Тексты формы создания и экрана успеха (английский, решение 3=B).

export const copy = {
  dialogTitle: "Create session",
  closeAria: "Close create session form",
  cancel: "Cancel",
  submit: "Create session",
  pending: "Creating session…",

  labels: {
    title: "Title",
    type: "Session type",
    date: "Date",
    time: "Start time",
    duration: "Duration",
    capacity: "Capacity",
    coach: "Coach",
    locationName: "Location name",
    locationAddress: "Location address",
    visibility: "Visibility",
    description: "Description",
    trainerNotes: "Trainer notes",
    optional: "(optional)",
  },
  units: { minutes: "minutes", places: "places" },
  visibilityOptions: { public: "Public", "invite-only": "Invite only" },
  typeOptions: { training: "Training", camp: "Camp", private: "Private" },

  hints: {
    title: "3–80 characters",
    time: (zone: string): string =>
      zone === ""
        ? "Your local time. Must be in the future."
        : `Your local time (${zone}). Must be in the future.`,
    duration: "Whole number, 30–240",
    capacity: "Whole number, 1–100",
    locationName: "2–80 characters",
    locationAddress: "3–120 characters",
  },
  counter: (length: number, max: number): string => `${length} / ${max}`,

  errors: {
    title: "Enter a title of 3–80 characters.",
    date: "Choose a date.",
    time: "Choose a start time.",
    pastDateTime: "Choose a date and start time in the future.",
    nonexistentDateTime: "This date or time doesn't exist. Choose another.",
    duration: "Enter a whole number of minutes from 30 to 240.",
    capacity: "Enter a whole number of places from 1 to 100.",
    coach: "Select a coach.",
    locationName: "Enter a location name of 2–80 characters.",
    locationAddress: "Enter an address of 3–120 characters.",
    description: "Description can be up to 1000 characters.",
    trainerNotes: "Trainer notes can be up to 500 characters.",
  },
  attention: (n: number): string => `${n} ${n === 1 ? "field needs" : "fields need"} attention`,

  coaches: {
    placeholder: "Select a coach",
    loading: "Loading coaches…",
    error: "Coaches couldn't be loaded.",
    empty: "No coaches are available. Try loading coaches again.",
    retry: "Try loading coaches again",
  },

  formError: (error: ClientError): string => {
    if (error.kind === "network" || error.kind === "malformed") {
      return "We couldn't confirm that the session was created. Check the sessions list before submitting again, because a second submission may create a duplicate.";
    }
    if (isApiError(error, "VALIDATION_FAILED")) {
      return "Some fields need attention. Check the highlighted fields and submit again.";
    }
    return "The session couldn't be created. Your entries are kept. Try again.";
  },

  confirm: {
    message: "Discard this session? Your entries will be lost.",
    keep: "Keep editing",
    discard: "Discard",
  },

  success: {
    title: "Session created",
    summary: (title: string, when: string): string => `“${title}” is scheduled for ${when}.`,
    open: "Open session",
    another: "Create another",
    close: "Close",
    filtersActive: "Filters are active, so the new session may not appear in the list.",
    clearFilters: "Clear filters",
    filtersCleared: "Filters cleared.",
  },
} as const;
