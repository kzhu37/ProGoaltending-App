import { describe, expect, it } from "vitest";
import { createDemoState, createScenarioState, rebaseDemoStateToDate } from "@/data/demo-fixtures";
import { deriveSessionPhase } from "@/domain/session";
import { calendarDayDifference } from "@/domain/dates";
import { recommendSessionType } from "@/domain/recommendation";
import { DemoAvailabilityService } from "@/services/availability";

const reference = new Date("2026-09-04T14:00:00.000Z");

describe("demo product rules", () => {
  it("creates a mature, content-rich default athlete state", () => {
    const state = createDemoState(reference);
    expect(state.sessions.filter((session) => session.status === "archived")).toHaveLength(8);
    expect(state.sessions.filter((session) => session.status === "scheduled")).toHaveLength(3);
    expect(state.resources.length).toBeGreaterThanOrEqual(8);
    expect(state.focuses.find((focus) => focus.status === "primary")?.title).toBe("Rebound Control");
  });

  it("derives today and soon phases from the centralized virtual clock", () => {
    const today = createScenarioState("today", reference);
    const soon = createScenarioState("soon", reference);
    expect(deriveSessionPhase(today.sessions.find((session) => session.id === "upcoming-primary")!, today.virtualNowISO)).toBe("today");
    expect(deriveSessionPhase(soon.sessions.find((session) => session.id === "upcoming-primary")!, soon.virtualNowISO)).toBe("soon");
  });

  it("builds the no-upcoming scenario without damaging development history", () => {
    const state = createScenarioState("none", reference);
    expect(state.sessions.some((session) => session.status === "scheduled")).toBe(false);
    expect(state.sessions.filter((session) => session.status === "archived")).toHaveLength(8);
  });

  it("recommends small group training from the primary and building focuses", () => {
    const state = createDemoState(reference);
    expect(recommendSessionType(state.focuses, state.sessionTypes).id).toBe("small-group");
  });

  it("returns deterministic availability and removes a fully reserved private slot", () => {
    const state = createDemoState(reference);
    const service = new DemoAvailabilityService();
    const date = service.listDates(state, 1)[0];
    const query = { facilityId: "bell", sessionTypeId: "private", dateKey: date.key };
    const before = service.listTimes(state, query);
    expect(before.length).toBeGreaterThan(0);
    const reserved = before[0];
    state.sessions.push({ id: "reserved", sessionTypeId: "private", facilityId: "bell", coachId: reserved.coachIds[0], startAt: reserved.startAt, endAt: new Date(new Date(reserved.startAt).getTime() + 3_600_000).toISOString(), status: "scheduled", focusIds: [] });
    expect(service.listTimes(state, query).some((slot) => slot.id === reserved.id)).toBe(false);
  });

  it.each([
    new Date("2026-09-04T14:00:00.000Z"),
    new Date("2026-12-31T14:00:00.000Z"),
    new Date("2027-03-14T14:00:00.000Z"),
  ])("keeps the primary session exactly two calendar days ahead on %s", (currentDate) => {
    const state = rebaseDemoStateToDate(createDemoState(reference), currentDate);
    const primary = state.sessions.find((session) => session.id === "upcoming-primary")!;
    expect(calendarDayDifference(currentDate.toISOString(), primary.startAt)).toBe(2);
  });
});
