import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState, createScenarioState } from "@/data/demo-fixtures";
import { dateKey, formatTime, shiftOttawaCalendarDays, formatRelativeDay } from "@/domain/dates";
import { demoAvailabilityService } from "@/services/availability";
import { useAppStore } from "@/store/app-store";

const reference = new Date("2026-09-04T14:00:00.000Z");
const query = { facilityId: "bell", sessionTypeId: "private" };

beforeEach(() => {
  useAppStore.setState({ ...createDemoState(reference), hasHydrated: true });
});

describe("Ottawa calendar semantics", () => {
  it.each([
    ["2026-10-30T13:30:00.000Z", 3, "2026-11-02T14:30:00.000Z"],
    ["2027-03-12T14:30:00.000Z", 3, "2027-03-15T13:30:00.000Z"],
  ])("preserves wall time when shifting %s by %i calendar days", (source, days, expected) => {
    expect(shiftOttawaCalendarDays(source, days)).toBe(expected);
    expect(formatTime(source)).toBe(formatTime(expected));
  });

  it("identifies tomorrow on the fall-back day rather than adding 24 hours", () => {
    expect(formatRelativeDay("2026-11-02T15:00:00.000Z", "2026-11-01T04:30:00.000Z")).toBe("Tomorrow");
  });
});

describe("availability and synchronized store actions", () => {
  it("uses actual slots for date counts, including reserved and released slots", () => {
    const service = demoAvailabilityService;
    const date = service.listDates(useAppStore.getState(), 1, query)[0];
    const before = service.listTimes(useAppStore.getState(), { ...query, dateKey: date.key });
    expect(date.availableCount).toBe(before.length);
    const first = before[0];
    expect(first).toBeDefined();
    useAppStore.getState().setBookingDraft({
      sessionTypeId: query.sessionTypeId, facilityId: query.facilityId, dateKey: date.key,
    });
    const id = useAppStore.getState().completeBooking(first, first.coachIds[0]);
    expect(id).toBeDefined();
    expect(service.listDates(useAppStore.getState(), 1, query)[0].availableCount).toBe(before.length - 1);
    useAppStore.getState().cancelSession(id!);
    expect(service.listDates(useAppStore.getState(), 1, query)[0].availableCount).toBe(before.length);
  });

  it("books once, then updates sessions, notifications, and activity together", () => {
    const service = demoAvailabilityService;
    const date = service.listDates(useAppStore.getState(), 1)[0];
    const slot = service.listTimes(useAppStore.getState(), { ...query, dateKey: date.key })[0];
    useAppStore.getState().setBookingDraft({
      sessionTypeId: query.sessionTypeId, facilityId: query.facilityId, dateKey: date.key,
    });
    const id = useAppStore.getState().completeBooking(slot, slot.coachIds[0]);
    expect(id).toBeDefined();
    expect(useAppStore.getState().sessions.find((session) => session.id === id)?.sourceSlotId).toBe(`${slot.id}__${slot.coachIds[0]}`);
    expect(useAppStore.getState().notifications[0].href).toBe(`/training/${id}`);
    expect(useAppStore.getState().developmentEvents[0].type).toBe("session_booked");
    expect(useAppStore.getState().completeBooking(slot, slot.coachIds[0])).toBeUndefined();
  });

  it("rejects arbitrary coach IDs and mismatched slot dates", () => {
    const date = demoAvailabilityService.listDates(useAppStore.getState(), 1)[0];
    const slot = demoAvailabilityService.listTimes(useAppStore.getState(), { ...query, dateKey: date.key })[0];
    useAppStore.getState().setBookingDraft({ ...query, dateKey: date.key });
    expect(useAppStore.getState().completeBooking(slot, "unknown-coach")).toBeUndefined();
    useAppStore.getState().setBookingDraft({ dateKey: "2026-12-25" });
    expect(useAppStore.getState().completeBooking(slot, slot.coachIds[0])).toBeUndefined();
  });

  it("reschedules a future session and preserves its identity", () => {
    const original = useAppStore.getState().sessions.find((session) => session.id === "upcoming-primary")!;
    const nextDate = demoAvailabilityService.listDates(useAppStore.getState(), 1)[0];
    const slot = demoAvailabilityService.listTimes(useAppStore.getState(), {
      facilityId: original.facilityId, sessionTypeId: original.sessionTypeId, dateKey: nextDate.key,
    })[0];
    useAppStore.getState().rescheduleSession(original.id, slot, slot.coachIds[0]);
    const updated = useAppStore.getState().sessions.find((session) => session.id === original.id)!;
    expect(updated.startAt).toBe(slot.startAt);
    expect(updated.id).toBe(original.id);
    expect(useAppStore.getState().developmentEvents[0].type).toBe("session_rescheduled");
    expect(dateKey(updated.startAt)).toBe(nextDate.key);
  });

  it("completes resource reviews and applies recap Blueprint changes only once", () => {
    useAppStore.setState({ ...createScenarioState("recap_ready", reference), hasHydrated: true });
    const store = useAppStore.getState();
    const priorCount = store.developmentEvents.length;
    store.markResourceReviewed("tracking-traffic");
    expect(useAppStore.getState().progress["tracking-traffic"].completed).toBe(true);
    expect(useAppStore.getState().developmentEvents).toHaveLength(priorCount + 1);
    store.markResourceReviewed("tracking-traffic");
    expect(useAppStore.getState().developmentEvents).toHaveLength(priorCount + 1);
    store.applyBlueprintUpdate("recap-scenario");
    expect(useAppStore.getState().focuses.find((focus) => focus.id === "post-integration")?.status).toBe("primary");
    expect(useAppStore.getState().recaps.find((recap) => recap.id === "recap-scenario")?.blueprintApplied).toBe(true);
    const noteCount = useAppStore.getState().notifications.length;
    store.applyBlueprintUpdate("recap-scenario");
    expect(useAppStore.getState().notifications).toHaveLength(noteCount);
  });

  it("replaces scenario fixtures but retains preferences, while reset restores defaults", () => {
    useAppStore.getState().setPreference("trainingReminders", false);
    useAppStore.getState().setScenario("none");
    expect(useAppStore.getState().sessions.filter((session) => session.status === "scheduled")).toHaveLength(0);
    expect(useAppStore.getState().preferences.trainingReminders).toBe(false);
    useAppStore.getState().resetDemo();
    expect(useAppStore.getState().scenario).toBe("standard");
    expect(useAppStore.getState().preferences.trainingReminders).toBe(true);
    expect(useAppStore.getState().bookingDraft.step).toBe(0);
  });
});
