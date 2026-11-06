import coachesFixture from "../../frontend-accelerator-assessment/fixtures/coaches.json";
import sessionsFixture from "../../frontend-accelerator-assessment/fixtures/sessions.json";
import details101 from "../../frontend-accelerator-assessment/fixtures/session-details/ses_101.json";
import details102 from "../../frontend-accelerator-assessment/fixtures/session-details/ses_102.json";
import details103 from "../../frontend-accelerator-assessment/fixtures/session-details/ses_103.json";
import details104 from "../../frontend-accelerator-assessment/fixtures/session-details/ses_104.json";
import details105 from "../../frontend-accelerator-assessment/fixtures/session-details/ses_105.json";
import { parseCoachesResponse, parseSessionDetails } from "../shared/api/mappers.ts";
import type { CoachSummary, SessionDetails, SessionSummary } from "../shared/api/types.ts";
import { currentTime, formatIsoUtc } from "../shared/lib/datetime.ts";
import { computeDelta, shiftTimestamps } from "./clock.ts";

const rawDetails: readonly unknown[] = [details101, details102, details103, details104, details105];
const rawOrder: readonly string[] = sessionsFixture.data.map((s) => s.id);

export const coaches: readonly CoachSummary[] = parseCoachesResponse(coachesFixture).data;

export interface ResetOptions {
  /** Стартовое состояние без сессий (сценарий empty). */
  empty?: boolean;
  /** Момент «сейчас» для сдвига фикстур; по умолчанию текущее время. */
  now?: number;
}

let sessions: SessionDetails[] = [];
let nextNumber = 1;

function loadFixtures(now: number): SessionDetails[] {
  const delta = computeDelta(now);
  const byId = new Map<string, SessionDetails>();
  for (const raw of rawDetails) {
    const parsed = parseSessionDetails(shiftTimestamps(raw, delta));
    byId.set(parsed.id, parsed);
  }
  return rawOrder.map((id) => {
    const found = byId.get(id);
    if (!found) throw new Error(`Missing details fixture for ${id}`);
    return found;
  });
}

/** Сброс хранилища к стартовому состоянию (вызывается при старте мока и между тестами). */
export function resetStore(options: ResetOptions = {}): void {
  sessions = options.empty ? [] : loadFixtures(options.now ?? currentTime());
  const numbers = sessions.map((s) => Number(s.id.replace(/^ses_/, ""))).filter(Number.isFinite);
  nextNumber = (numbers.length > 0 ? Math.max(...numbers) : 100) + 1;
}

export function toSummary(details: SessionDetails): SessionSummary {
  return {
    id: details.id,
    title: details.title,
    type: details.type,
    status: details.status,
    startsAt: details.startsAt,
    durationMinutes: details.durationMinutes,
    capacity: details.capacity,
    bookedCount: details.bookedCount,
    visibility: details.visibility,
    coach: details.coach,
    location: details.location,
    updatedAt: details.updatedAt,
  };
}

export function listSessions(): readonly SessionDetails[] {
  return sessions;
}

export function findSession(id: string): SessionDetails | undefined {
  return sessions.find((s) => s.id === id);
}

export function findCoach(id: string): CoachSummary | undefined {
  return coaches.find((c) => c.id === id);
}

/** Добавляет сессию в конец списка и возвращает её; id генерирует хранилище. */
export function addSession(
  draft: Omit<SessionDetails, "id" | "createdAt" | "updatedAt">,
  now: number,
): SessionDetails {
  const stamp = formatIsoUtc(now);
  const created: SessionDetails = {
    ...draft,
    id: `ses_${nextNumber}`,
    createdAt: stamp,
    updatedAt: stamp,
  };
  nextNumber += 1;
  sessions = [...sessions, created];
  return created;
}

resetStore();
