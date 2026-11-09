import { isFuture, localToIsoUtc } from "../../shared/lib/datetime.ts";
import type { FormErrors, FormValues } from "./form-values.ts";
import { copy } from "./copy.ts";

export interface ValidationContext {
  /** Текущий момент, мс. */
  now: number;
  /** id тренеров из последнего успешного `GET /api/coaches`; пусто = выбрать нельзя. */
  coachIds: readonly string[];
}

export const LIMITS = {
  title: { min: 3, max: 80 },
  duration: { min: 30, max: 240 },
  capacity: { min: 1, max: 100 },
  locationName: { min: 2, max: 80 },
  locationAddress: { min: 3, max: 120 },
  trainerNotes: { max: 500 },
  /** UI-допущение A-13, не AC. */
  description: { max: 1000 },
} as const;

function outside(value: string, min: number, max: number): boolean {
  const length = value.trim().length;
  return length < min || length > max;
}

function notWholeNumberIn(raw: string, min: number, max: number): boolean {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return true;
  const n = Number(text);
  return n < min || n > max;
}

/** Чистая проверка по AC-3.1–3.8 на trim-значениях. Ошибки у поля или у пары `startsAt`. */
export function validate(values: FormValues, context: ValidationContext): FormErrors {
  const errors: FormErrors = {};
  const { title, duration, capacity, locationName, locationAddress, trainerNotes, description } = LIMITS;

  if (outside(values.title, title.min, title.max)) errors.title = copy.errors.title;

  const date = values.date.trim();
  const time = values.time.trim();
  if (date === "") errors.date = copy.errors.date;
  if (time === "") errors.time = copy.errors.time;
  if (date !== "" && time !== "") {
    const start = localToIsoUtc(date, time);
    if (!start.ok) errors.startsAt = copy.errors.nonexistentDateTime;
    else if (!isFuture(start.iso, context.now)) errors.startsAt = copy.errors.pastDateTime;
  }

  if (notWholeNumberIn(values.duration, duration.min, duration.max)) errors.duration = copy.errors.duration;
  if (notWholeNumberIn(values.capacity, capacity.min, capacity.max)) errors.capacity = copy.errors.capacity;
  if (values.coachId === "" || !context.coachIds.includes(values.coachId)) {
    errors.coachId = copy.errors.coach;
  }
  if (outside(values.locationName, locationName.min, locationName.max)) {
    errors.locationName = copy.errors.locationName;
  }
  if (outside(values.locationAddress, locationAddress.min, locationAddress.max)) {
    errors.locationAddress = copy.errors.locationAddress;
  }
  if (values.description.trim().length > description.max) errors.description = copy.errors.description;
  if (values.trainerNotes.trim().length > trainerNotes.max) errors.trainerNotes = copy.errors.trainerNotes;
  return errors;
}
