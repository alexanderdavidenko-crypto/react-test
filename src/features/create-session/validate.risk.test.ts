import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FROZEN_NOW } from "../../test/constants.ts";
import { INITIAL_VALUES, type FormValues } from "./form-values.ts";
import { validate, type ValidationContext } from "./validate.ts";

// risk-based, не входят в обязательный набор AC-9.1.
// Риск: границы AC-3.1–3.8 и предел описания A-13 (UI-допущение, не AC) ошибаются на единицу и на
// trim; существующие тесты проверяют только пустую форму и дату в прошлом. Чистая функция, без UI.
// Пояс процесса фиксируется в UTC, чтобы граница «сейчас» не зависела от машины.

beforeEach(() => {
  vi.stubEnv("TZ", "UTC");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

const context: ValidationContext = { now: Date.parse(FROZEN_NOW), coachIds: ["coach_01", "coach_02"] };

const VALID: FormValues = {
  ...INITIAL_VALUES,
  title: "Evening Footwork",
  date: "2026-09-15",
  time: "18:30",
  duration: "90",
  capacity: "12",
  coachId: "coach_01",
  locationName: "North Court",
  locationAddress: "12 Lake Street",
};

const errorKeys = (values: Partial<FormValues>, ctx = context) =>
  Object.keys(validate({ ...VALID, ...values }, ctx)).sort();

const chars = (n: number) => "a".repeat(n);

describe("validate: baseline", () => {
  it("accepts a fully valid form with optional fields empty", () => {
    expect(validate(VALID, context)).toEqual({});
  });
});

describe("validate: length and range boundaries (AC-3.1, 3.3, 3.4, 3.6, 3.7, 3.8, A-13)", () => {
  // [поле, значение, допустимо?]
  it.each<[keyof FormValues, string, boolean]>([
    ["title", chars(2), false], // AC-3.1
    ["title", chars(3), true],
    ["title", chars(80), true],
    ["title", chars(81), false],
    ["title", `  ${chars(2)}  `, false], // trim: 2 символа
    ["title", `  ${chars(3)}  `, true],
    ["title", `  ${chars(80)}  `, true], // trim: 80 символов, пробелы не считаются
    ["title", "     ", false],
    ["duration", "29", false], // AC-3.3
    ["duration", "30", true],
    ["duration", "240", true],
    ["duration", "241", false],
    ["duration", " 90 ", true],
    ["duration", "", false],
    ["duration", "90.5", false],
    ["duration", "-60", false],
    ["duration", "1e2", false],
    ["duration", "abc", false],
    ["capacity", "0", false], // AC-3.4
    ["capacity", "1", true],
    ["capacity", "100", true],
    ["capacity", "101", false],
    ["capacity", "12.5", false],
    ["capacity", "", false],
    ["locationName", chars(1), false], // AC-3.6
    ["locationName", chars(2), true],
    ["locationName", chars(80), true],
    ["locationName", chars(81), false],
    ["locationName", ` ${chars(1)} `, false],
    ["locationAddress", chars(2), false], // AC-3.7
    ["locationAddress", chars(3), true],
    ["locationAddress", chars(120), true],
    ["locationAddress", chars(121), false],
    ["locationAddress", ` ${chars(2)} `, false],
    ["trainerNotes", "", true], // AC-3.8: необязательно
    ["trainerNotes", chars(500), true],
    ["trainerNotes", chars(501), false],
    ["trainerNotes", `${chars(500)}   `, true], // trim
    ["trainerNotes", `   ${chars(501)}`, false],
    ["description", "", true], // A-13: 1000, не AC
    ["description", chars(1000), true],
    ["description", chars(1001), false],
    ["description", `${chars(1000)}   `, true],
  ])("%s = %j is valid: %s", (field, value, valid) => {
    const keys = errorKeys({ [field]: value });
    // Ошибка именно у проверяемого поля и больше ни у кого.
    expect(keys).toEqual(valid ? [] : [field]);
  });
});

describe("validate: coach (AC-3.5)", () => {
  it.each<[string, string[], boolean]>([
    ["", ["coach_01"], false],
    ["coach_99", ["coach_01"], false], // нет в загруженном списке
    ["coach_01", [], false], // список тренеров не загружен
    ["coach_01", ["coach_01"], true],
  ])("coachId %j with loaded %j is valid: %s", (coachId, coachIds, valid) => {
    expect(errorKeys({ coachId }, { ...context, coachIds })).toEqual(valid ? [] : ["coachId"]);
  });
});

describe("validate: date and time (AC-3.2)", () => {
  it.each<[string, string, string[]]>([
    ["", "", ["date", "time"]],
    ["", "18:30", ["date"]],
    ["2026-09-15", "", ["time"]],
    ["2026-08-01", "10:00", ["startsAt"]], // ровно «сейчас» не в будущем
    ["2026-08-01", "10:01", []],
    ["2026-08-01", "09:59", ["startsAt"]],
    ["2026-07-31", "23:59", ["startsAt"]],
    ["2026-02-30", "10:00", ["startsAt"]], // несуществующая дата
    ["2026-09-15", "24:00", ["startsAt"]],
  ])("date %j time %j -> errors %j", (date, time, expected) => {
    expect(errorKeys({ date, time })).toEqual(expected);
  });

  it("flags a nonexistent local time (spring-forward gap) with its own message, not the past message", () => {
    vi.stubEnv("TZ", "Europe/Berlin");
    const errors = validate({ ...VALID, date: "2026-03-29", time: "02:30" }, { ...context, now: Date.UTC(2026, 0, 1) });
    expect(Object.keys(errors)).toEqual(["startsAt"]);
    expect(errors.startsAt).toBe("This date or time doesn't exist. Choose another.");
    const past = validate({ ...VALID, date: "2026-03-29", time: "03:30" }, { ...context, now: Date.UTC(2026, 5, 1) });
    expect(past.startsAt).toBe("Choose a date and start time in the future.");
  });
});
