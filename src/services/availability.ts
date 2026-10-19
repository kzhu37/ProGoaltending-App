import { dateKey, formatTime, ottawaDateAt, ottawaDateFromKey } from "@/domain/dates";
import type { Coach, DemoState } from "@/domain/types";

export type DateOption = {
  key: string;
  iso: string;
  availableCount: number;
};

export type TimeOption = {
  id: string;
  startAt: string;
  label: string;
  remainingSpots: number;
  coachIds: string[];
};

export type AvailabilityQuery = {
  facilityId: string;
  sessionTypeId: string;
  dateKey: string;
};

export interface AvailabilityService {
  listDates(state: DemoState, days?: number, query?: Omit<AvailabilityQuery, "dateKey">): DateOption[];
  listTimes(state: DemoState, query: AvailabilityQuery): TimeOption[];
  listCoaches(state: DemoState, slot: TimeOption): Coach[];
}

const SESSION_HOURS = [8, 9.5, 11, 14.5, 16, 18.5];

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function makeTimeSlotId(query: AvailabilityQuery, hour: number, minute: number): string {
  return `${query.facilityId}__${query.sessionTypeId}__${query.dateKey}__${hour.toString().padStart(2, "0")}${minute.toString().padStart(2, "0")}`;
}

export function parseTimeSlotId(slotId: string): AvailabilityQuery & { hour: number; minute: number } {
  const [facilityId, sessionTypeId, selectedDateKey, compactTime] = slotId.split("__");
  return {
    facilityId,
    sessionTypeId,
    dateKey: selectedDateKey,
    hour: Number(compactTime.slice(0, 2)),
    minute: Number(compactTime.slice(2, 4)),
  };
}

export class DemoAvailabilityService implements AvailabilityService {
  listDates(state: DemoState, days = 9, query?: Omit<AvailabilityQuery, "dateKey">): DateOption[] {
    const reference = new Date(state.virtualNowISO);
    return Array.from({ length: days }, (_, index) => {
      const date = ottawaDateAt(reference, index + 1, 12);
      const key = dateKey(date.toISOString());
      // Only report an availability count when a facility and training format are known.
      const availableCount = query ? this.listTimes(state, { ...query, dateKey: key }).length : 0;
      return { key, iso: date.toISOString(), availableCount };
    });
  }

  listTimes(state: DemoState, query: AvailabilityQuery): TimeOption[] {
    const seed = stableHash(`${query.facilityId}-${query.sessionTypeId}-${query.dateKey}`);
    const selectedHours = SESSION_HOURS.filter((_, index) => (seed + index) % 4 !== 0).slice(0, 4);

    return selectedHours
      .map((decimalHour, index) => {
        const hour = Math.floor(decimalHour);
        const minute = decimalHour % 1 === 0 ? 0 : 30;
        const startAt = ottawaDateFromKey(query.dateKey, hour, minute).toISOString();
        const coachIds = state.coaches
          .filter((_, coachIndex) => (seed + index + coachIndex) % 3 !== 0)
          .map((coach) => coach.id);
        const id = makeTimeSlotId(query, hour, minute);
        const bookedCount = state.sessions.filter(
          (session) =>
            session.status !== "cancelled" &&
            session.facilityId === query.facilityId &&
            session.sessionTypeId === query.sessionTypeId &&
            session.startAt === startAt,
        ).length;
        const capacity = query.sessionTypeId === "small-group" ? 3 : 1;
        return {
          id,
          startAt,
          label: formatTime(startAt),
          remainingSpots: Math.max(0, capacity - bookedCount),
          coachIds,
        };
      })
      .filter((slot) => slot.remainingSpots > 0 && slot.coachIds.length > 0);
  }

  listCoaches(state: DemoState, slot: TimeOption): Coach[] {
    return state.coaches.filter((coach) => slot.coachIds.includes(coach.id));
  }
}

export const demoAvailabilityService = new DemoAvailabilityService();
