import clockFixture from "../../frontend-accelerator-assessment/fixtures/fixture-clock.json";
import { parseIso, shiftIso } from "../shared/lib/datetime.ts";

const referenceNow = parseIso(clockFixture.referenceNow);
if (referenceNow === null) throw new Error("fixture-clock.json: invalid referenceNow");

const timestampFields: ReadonlySet<string> = new Set(clockFixture.timestampFields);

/** Разница между текущим моментом и referenceNow, мс. */
export function computeDelta(now: number): number {
  return now - referenceNow!;
}

/** Рекурсивно сдвигает поля из timestampFields на delta. Остальные значения копируются как есть. */
export function shiftTimestamps(value: unknown, delta: number): unknown {
  if (Array.isArray(value)) return value.map((item) => shiftTimestamps(item, delta));
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] =
        timestampFields.has(key) && typeof item === "string"
          ? shiftIso(item, delta)
          : shiftTimestamps(item, delta);
    }
    return result;
  }
  return value;
}
