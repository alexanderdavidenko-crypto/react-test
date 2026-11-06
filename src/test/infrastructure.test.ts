import { expect, it } from "vitest";
import { createSession, getSessions } from "../shared/api/client.ts";
import { FROZEN_NOW } from "./constants.ts";

// Один инфраструктурный тест, выполняется дважды: второй прогон доказывает сброс store между тестами.
it.each([1, 2])("test infrastructure: runner, msw/node, frozen time, store reset (run %i)", async () => {
  expect(new Date().toISOString()).toBe("2026-08-01T10:00:00.000Z");
  expect(FROZEN_NOW).toBe("2026-08-01T10:00:00Z");

  const list = await getSessions();
  if (!list.ok) throw new Error("expected intercepted /api/sessions to succeed");
  expect(list.data.meta.total).toBe(5); // не 6: store сброшен после первого прогона
  // fixture clock: 2026-08-03T16:00Z + (2026-08-01T10:00Z - 2026-07-27T12:00Z)
  expect(list.data.data[0].startsAt).toBe("2026-08-08T14:00:00Z");

  const created = await createSession({
    title: "Infra check",
    type: "training",
    startsAt: "2026-09-01T10:00:00Z",
    durationMinutes: 60,
    coachId: "coach_01",
    locationName: "Gym",
    locationAddress: "1 Main St",
    capacity: 10,
    visibility: "public",
  });
  expect(created.ok).toBe(true);
});
