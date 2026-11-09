import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FROZEN_NOW } from "../../test/constants.ts";
import {
  formatDetailsSchedule,
  formatIsoUtc,
  formatListDateTime,
  formatListDateTimeCompact,
  formatSummaryDateTime,
  formatTimeZoneName,
  isFuture,
  localToIsoUtc,
  parseIso,
  shiftIso,
} from "./datetime.ts";

// risk-based, не входят в обязательный набор AC-9.1.
// Риск: даты и часовые пояса дают тихие ошибки (сдвиг на час или день, «24:00», потеря перехода на
// летнее время), а форма создания строит из них `startsAt` для API. Пояс среды заменяется явным:
// `localToIsoUtc` читает пояс процесса, поэтому в тестах выставляется переменная TZ (vi.stubEnv) и после
// теста возвращается (vi.unstubAllEnvs); форматтеры получают `timeZone` параметром. Время заморожено (setup.ts).

const NOW = Date.parse(FROZEN_NOW);

function useTimeZone(zone: string): void {
  vi.stubEnv("TZ", zone);
  // Страховка от среды, где смена TZ в процессе не действует: иначе тесты проверяли бы не то.
  // (Сравнение через форматирование: канонические имена вроде Asia/Calcutta не совпадают с заданным.)
  const probe = new Date(Date.UTC(2026, 6, 15, 12));
  const fields: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", day: "numeric", hourCycle: "h23" };
  expect(new Intl.DateTimeFormat("en-US", fields).format(probe)).toBe(
    new Intl.DateTimeFormat("en-US", { ...fields, timeZone: zone }).format(probe),
  );
}

beforeEach(() => {
  vi.stubEnv("TZ", "UTC");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("localToIsoUtc: local -> UTC conversion in explicit zones", () => {
  // [zone, date, time, ожидаемый ISO UTC]
  it.each([
    ["UTC", "2026-09-15", "18:30", "2026-09-15T18:30:00Z"],
    ["Asia/Kolkata", "2026-09-15", "18:30", "2026-09-15T13:00:00Z"], // +05:30, без перехода
    ["America/Sao_Paulo", "2026-09-15", "18:30", "2026-09-15T21:30:00Z"], // -03:00
    ["Europe/Berlin", "2026-03-28", "12:00", "2026-03-28T11:00:00Z"], // зима, +01:00
    ["Europe/Berlin", "2026-07-15", "12:00", "2026-07-15T10:00:00Z"], // лето, +02:00
    ["Europe/Berlin", "2026-03-29", "01:59", "2026-03-29T00:59:00Z"], // за минуту до скачка
    ["Europe/Berlin", "2026-03-29", "03:00", "2026-03-29T01:00:00Z"], // первое существующее время после скачка
    ["Pacific/Kiritimati", "2026-09-15", "00:15", "2026-09-14T10:15:00Z"], // +14: UTC-дата на день раньше
    ["Asia/Kolkata", "2026-12-31", "23:59", "2026-12-31T18:29:00Z"],
  ])("%s %s %s -> %s", (zone, date, time, expected) => {
    useTimeZone(zone);
    expect(localToIsoUtc(date, time)).toEqual({ ok: true, iso: expected });
  });

  it("reports a nonexistent local time in the spring-forward gap, not a shifted instant", () => {
    useTimeZone("Europe/Berlin");
    for (const time of ["02:00", "02:30", "02:59"]) {
      expect(localToIsoUtc("2026-03-29", time)).toEqual({ ok: false, reason: "nonexistent-time" });
    }
  });

  it("accepts an ambiguous local time in the fall-back overlap (exists twice)", () => {
    useTimeZone("Europe/Berlin");
    const result = localToIsoUtc("2026-10-25", "02:30");
    expect(result.ok).toBe(true);
    if (result.ok) expect(["2026-10-25T00:30:00Z", "2026-10-25T01:30:00Z"]).toContain(result.iso);
  });

  it.each([
    ["2026-02-30", "10:00", "invalid-date"],
    ["2026-02-29", "10:00", "invalid-date"], // 2026 не високосный
    ["2026-04-31", "10:00", "invalid-date"],
    ["2026-13-01", "10:00", "invalid-date"],
    ["2026-00-10", "10:00", "invalid-date"],
    ["2026-1-5", "10:00", "invalid-date"],
    ["", "10:00", "invalid-date"],
    ["2026-09-15", "24:00", "invalid-time"],
    ["2026-09-15", "12:60", "invalid-time"],
    ["2026-09-15", "9:00", "invalid-time"],
    ["2026-09-15", "", "invalid-time"],
  ])("rejects %s %s as %s", (date, time, reason) => {
    expect(localToIsoUtc(date, time)).toEqual({ ok: false, reason });
  });

  it("accepts the leap day 2028-02-29", () => {
    expect(localToIsoUtc("2028-02-29", "10:00")).toEqual({ ok: true, iso: "2028-02-29T10:00:00Z" });
  });
});

describe("startsAt format and the future check", () => {
  it("always produces ISO UTC without milliseconds", () => {
    const iso = localToIsoUtc("2026-09-15", "18:30");
    expect(iso.ok && iso.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00Z$/);
    expect(formatIsoUtc(Date.UTC(2026, 8, 15, 18, 30, 5, 123))).toBe("2026-09-15T18:30:05Z");
    expect(shiftIso("2026-09-15T18:30:00.750Z", 60_000)).toBe("2026-09-15T18:31:00Z");
  });

  it("treats a string with and without milliseconds as the same instant", () => {
    expect(parseIso("2026-09-15T18:30:00Z")).toBe(parseIso("2026-09-15T18:30:00.000Z"));
  });

  it.each([
    ["2026-08-01T10:00:00Z", false], // ровно «сейчас» не будущее
    ["2026-08-01T09:59:59Z", false],
    ["2026-08-01T10:00:01Z", true],
    ["2026-08-01T10:00:00.001Z", true],
    ["2026-07-01T10:00:00Z", false],
    ["2026-02-30T10:00:00Z", false], // невалидная дата не бывает «в будущем»
    ["tomorrow", false],
    ["2026-09-01T10:00:00+02:00", false], // не UTC-форма контракта
  ])("isFuture(%s) at the frozen now is %s", (iso, expected) => {
    expect(isFuture(iso, NOW)).toBe(expected);
  });

  it("shiftIso returns an invalid string unchanged", () => {
    expect(shiftIso("2026-02-30T10:00:00Z", 1000)).toBe("2026-02-30T10:00:00Z");
  });
});

describe("formatters with an explicit time zone", () => {
  // [iso, zone, список, компактный, сводка, расписание деталей, имя пояса]
  it.each([
    [
      "2026-08-03T15:00:00Z",
      "Europe/Moscow",
      "Aug 3, 18:00",
      "Mon, Aug 3 · 18:00",
      "Mon, Aug 3 at 18:00",
      "Monday, Aug 3 at 18:00 (GMT+3)",
      "GMT+3",
    ],
    [
      "2026-08-03T15:00:00Z",
      "UTC",
      "Aug 3, 15:00",
      "Mon, Aug 3 · 15:00",
      "Mon, Aug 3 at 15:00",
      "Monday, Aug 3 at 15:00 (UTC)",
      "UTC",
    ],
    [
      "2026-08-03T15:00:00Z",
      "Asia/Kolkata", // получасовой сдвиг
      "Aug 3, 20:30",
      "Mon, Aug 3 · 20:30",
      "Mon, Aug 3 at 20:30",
      "Monday, Aug 3 at 20:30 (GMT+5:30)",
      "GMT+5:30",
    ],
    [
      "2026-08-03T15:00:00Z",
      "Pacific/Kiritimati", // +14: день вперёд
      "Aug 4, 05:00",
      "Tue, Aug 4 · 05:00",
      "Tue, Aug 4 at 05:00",
      "Tuesday, Aug 4 at 05:00 (GMT+14)",
      "GMT+14",
    ],
    [
      "2026-08-03T00:00:00Z",
      "Etc/GMT+12", // -12: день назад
      "Aug 2, 12:00",
      "Sun, Aug 2 · 12:00",
      "Sun, Aug 2 at 12:00",
      "Sunday, Aug 2 at 12:00 (GMT-12)",
      "GMT-12",
    ],
    [
      "2026-08-03T00:00:00Z",
      "UTC", // полночь: «00:00», не «24:00»
      "Aug 3, 00:00",
      "Mon, Aug 3 · 00:00",
      "Mon, Aug 3 at 00:00",
      "Monday, Aug 3 at 00:00 (UTC)",
      "UTC",
    ],
    [
      "2026-12-31T23:30:00Z",
      "Europe/Moscow", // переход через границу года
      "Jan 1, 02:30",
      "Fri, Jan 1 · 02:30",
      "Fri, Jan 1 at 02:30",
      "Friday, Jan 1 at 02:30 (GMT+3)",
      "GMT+3",
    ],
  ])("%s in %s", (iso, timeZone, list, compact, summary, schedule, zoneName) => {
    expect(formatListDateTime(iso, { timeZone })).toBe(list);
    expect(formatListDateTimeCompact(iso, { timeZone })).toBe(compact);
    expect(formatSummaryDateTime(iso, { timeZone })).toBe(summary);
    expect(formatDetailsSchedule(iso, { timeZone })).toBe(schedule);
    expect(formatTimeZoneName(Date.parse(iso), { timeZone })).toBe(zoneName);
  });

  it("formatTimeZoneName follows the moment (summer vs winter time)", () => {
    const timeZone = "Europe/Berlin";
    expect(formatTimeZoneName(Date.UTC(2026, 6, 15, 12), { timeZone })).toBe("GMT+2");
    expect(formatTimeZoneName(Date.UTC(2026, 0, 15, 12), { timeZone })).toBe("GMT+1");
  });

  it("returns an empty string for an invalid date instead of throwing", () => {
    for (const format of [
      formatListDateTime,
      formatListDateTimeCompact,
      formatSummaryDateTime,
      formatDetailsSchedule,
    ]) {
      expect(format("2026-02-30T10:00:00Z", { timeZone: "UTC" })).toBe("");
      expect(format("", { timeZone: "UTC" })).toBe("");
    }
  });
});
