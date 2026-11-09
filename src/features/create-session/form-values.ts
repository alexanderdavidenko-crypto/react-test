import type { CreateSessionRequest, SessionType, Visibility } from "../../shared/api/types.ts";
import { localToIsoUtc } from "../../shared/lib/datetime.ts";

/** Значения контролов формы: строки (как в DOM), кроме ограниченных списков. */
export interface FormValues {
  title: string;
  type: SessionType;
  date: string;
  time: string;
  duration: string;
  capacity: string;
  coachId: string;
  locationName: string;
  locationAddress: string;
  visibility: Visibility;
  description: string;
  trainerNotes: string;
}

export type FieldName = keyof FormValues;

/** Ключ ошибки: поля формы плюс `startsAt` (ошибка пары Date/Start time). */
export type ErrorKey = FieldName | "startsAt";
export type FormErrors = Partial<Record<ErrorKey, string>>;

/** Порядок ошибок = порядок полей в DOM (для фокуса на первое невалидное). */
export const ERROR_ORDER: readonly ErrorKey[] = [
  "title",
  "type",
  "date",
  "time",
  "startsAt",
  "duration",
  "capacity",
  "coachId",
  "locationName",
  "locationAddress",
  "visibility",
  "description",
  "trainerNotes",
];

export const INITIAL_VALUES: FormValues = {
  title: "",
  type: "training",
  date: "",
  time: "",
  duration: "",
  capacity: "",
  coachId: "",
  locationName: "",
  locationAddress: "",
  visibility: "public",
  description: "",
  trainerNotes: "",
};

export function isDirty(values: FormValues): boolean {
  return (Object.keys(INITIAL_VALUES) as FieldName[]).some((key) => values[key] !== INITIAL_VALUES[key]);
}

/** Ключ серверного `fieldErrors`, который снимается при редактировании поля. */
export const FIELD_SERVER_KEY: Record<FieldName, string> = {
  title: "title",
  type: "type",
  date: "startsAt",
  time: "startsAt",
  duration: "durationMinutes",
  capacity: "capacity",
  coachId: "coachId",
  locationName: "locationName",
  locationAddress: "locationAddress",
  visibility: "visibility",
  description: "description",
  trainerNotes: "trainerNotes",
};

const SERVER_KEY_TO_ERROR: Record<string, ErrorKey> = {
  title: "title",
  type: "type",
  startsAt: "startsAt",
  durationMinutes: "duration",
  capacity: "capacity",
  coachId: "coachId",
  locationName: "locationName",
  locationAddress: "locationAddress",
  visibility: "visibility",
  description: "description",
  trainerNotes: "trainerNotes",
};

export interface SplitServerErrors {
  /** Ошибки, у которых есть поле. */
  fields: FormErrors;
  /** Тексты ключей без поля: уходят в блок формы (D-7). */
  unmatched: string[];
}

export function splitServerErrors(fieldErrors: Record<string, string>): SplitServerErrors {
  const fields: FormErrors = {};
  const unmatched: string[] = [];
  for (const [key, message] of Object.entries(fieldErrors)) {
    const target = Object.hasOwn(SERVER_KEY_TO_ERROR, key) ? SERVER_KEY_TO_ERROR[key] : undefined;
    if (target === undefined) unmatched.push(message);
    else fields[target] = message;
  }
  return { fields, unmatched };
}

/** Запрос API из уже проверенных значений; `null`, если дата и время не собираются в `startsAt`. */
export function toRequest(values: FormValues): CreateSessionRequest | null {
  const start = localToIsoUtc(values.date, values.time);
  if (!start.ok) return null;
  const description = values.description.trim();
  const trainerNotes = values.trainerNotes.trim();
  const request: CreateSessionRequest = {
    title: values.title.trim(),
    type: values.type,
    startsAt: start.iso,
    durationMinutes: Number(values.duration.trim()),
    coachId: values.coachId,
    locationName: values.locationName.trim(),
    locationAddress: values.locationAddress.trim(),
    capacity: Number(values.capacity.trim()),
    visibility: values.visibility,
  };
  if (description !== "") request.description = description;
  if (trainerNotes !== "") request.trainerNotes = trainerNotes;
  return request;
}
