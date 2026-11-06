import { describe, expect, it } from "vitest";
import { parseIso } from "./datetime";

describe("parseIso: календарная валидность", () => {
  it.each(["2026-02-30T10:00:00Z", "2026-04-31T10:00:00Z", "2026-01-01T24:00:00Z"])(
    "отклоняет невалидную дату %s",
    (value) => {
      expect(parseIso(value)).toBeNull();
    },
  );

  it("разбирает валидную строку", () => {
    expect(parseIso("2026-08-03T18:00:00Z")).toBe(Date.UTC(2026, 7, 3, 18, 0, 0));
  });

  it("принимает високосный день 2028-02-29", () => {
    expect(parseIso("2028-02-29T10:00:00Z")).toBe(Date.UTC(2028, 1, 29, 10, 0, 0));
  });

  it("разбирает строку с миллисекундами", () => {
    expect(parseIso("2026-08-03T18:00:00.123Z")).toBe(Date.UTC(2026, 7, 3, 18, 0, 0, 123));
  });
});
