/**
 * Единственная точка работы с датами и часовыми поясами.
 * Остальной код не вызывает `new Date(...)` и `toLocale*`.
 */

const ISO_UTC_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export interface FormatOptions {
  /** IANA-пояс; по умолчанию пояс браузера. Нужен тестам и детерминированному выводу. */
  timeZone?: string;
}

export type LocalToIsoResult =
  | { ok: true; iso: string }
  | { ok: false; reason: "invalid-date" | "invalid-time" | "nonexistent-time" };

/** Текущий момент в миллисекундах (в тестах время заморожено подменой Date). */
export function currentTime(): number {
  return Date.now();
}

/** Разбор ISO 8601 UTC (с `Z`, миллисекунды допустимы). `null`, если строка не подходит. */
export function parseIso(value: string): number | null {
  const m = ISO_UTC_PATTERN.exec(value);
  if (!m) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  // Date.parse нормализует 30 февраля, 31 апреля и 24:00; круговая сверка компонентов отсекает их.
  const d = new Date(ms);
  const matches =
    d.getUTCFullYear() === Number(m[1]) &&
    d.getUTCMonth() + 1 === Number(m[2]) &&
    d.getUTCDate() === Number(m[3]) &&
    d.getUTCHours() === Number(m[4]) &&
    d.getUTCMinutes() === Number(m[5]) &&
    d.getUTCSeconds() === Number(m[6]);
  return matches ? ms : null;
}

export function isIsoUtc(value: string): boolean {
  return parseIso(value) !== null;
}

/** Миллисекунды -> ISO UTC без миллисекунд (`YYYY-MM-DDTHH:mm:ssZ`). */
export function formatIsoUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Сдвиг ISO-строки на `deltaMs`; результат без миллисекунд. Невалидная строка возвращается как есть. */
export function shiftIso(value: string, deltaMs: number): string {
  const ms = parseIso(value);
  return ms === null ? value : formatIsoUtc(ms + deltaMs);
}

export function isFuture(iso: string, now: number): boolean {
  const ms = parseIso(iso);
  return ms !== null && ms > now;
}

function partsOf(
  ms: number,
  fields: Intl.DateTimeFormatOptions,
  options: FormatOptions,
): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...fields,
    hourCycle: "h23",
    timeZone: options.timeZone,
  });
  const result: Record<string, string> = {};
  for (const part of formatter.formatToParts(new Date(ms))) {
    result[part.type] = part.value;
  }
  return result;
}

/** Список: `Aug 3, 18:00`. Некорректная строка -> пустая строка. */
export function formatListDateTime(iso: string, options: FormatOptions = {}): string {
  const ms = parseIso(iso);
  if (ms === null) return "";
  const p = partsOf(
    ms,
    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
    options,
  );
  return `${p.month} ${p.day}, ${p.hour}:${p.minute}`;
}

/** Детали: `Aug 3, 2026, 18:00 GMT+2` (с коротким именем пояса). */
export function formatDetailsDateTime(iso: string, options: FormatOptions = {}): string {
  const ms = parseIso(iso);
  if (ms === null) return "";
  const p = partsOf(
    ms,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    },
    options,
  );
  return `${p.month} ${p.day}, ${p.year}, ${p.hour}:${p.minute} ${p.timeZoneName}`;
}

/** Служебные строки (создано/обновлено/отменено): `Aug 3, 2026, 18:00`. */
export function formatTimestamp(iso: string, options: FormatOptions = {}): string {
  const ms = parseIso(iso);
  if (ms === null) return "";
  const p = partsOf(
    ms,
    { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
    options,
  );
  return `${p.month} ${p.day}, ${p.year}, ${p.hour}:${p.minute}`;
}

/**
 * Локальные дата `YYYY-MM-DD` и время `HH:mm` (пояс браузера) -> ISO UTC без миллисекунд.
 * Несуществующее локальное время (переход на летнее время) определяется обратным разбором.
 */
export function localToIsoUtc(date: string, time: string): LocalToIsoResult {
  const d = LOCAL_DATE_PATTERN.exec(date);
  const t = LOCAL_TIME_PATTERN.exec(time);
  if (!d) return { ok: false, reason: "invalid-date" };
  if (!t) return { ok: false, reason: "invalid-time" };
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [hour, minute] = [Number(t[1]), Number(t[2])];

  // Календарная проверка независимо от пояса (30 февраля и т. п.).
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return { ok: false, reason: "invalid-date" };
  }
  if (hour > 23 || minute > 59) return { ok: false, reason: "invalid-time" };

  const local = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(local.getTime())) return { ok: false, reason: "invalid-date" };
  if (
    local.getFullYear() !== year ||
    local.getMonth() !== month - 1 ||
    local.getDate() !== day ||
    local.getHours() !== hour ||
    local.getMinutes() !== minute
  ) {
    return { ok: false, reason: "nonexistent-time" };
  }
  return { ok: true, iso: formatIsoUtc(local.getTime()) };
}
