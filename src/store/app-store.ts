"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDemoState, createScenarioRecap, createScenarioState, rebaseDemoStateToDate } from "@/data/demo-fixtures";
import { addMinutes, ottawaDateAt } from "@/domain/dates";
import type {
  BookingDraft,
  DemoScenario,
  DemoState,
  DevelopmentEvent,
  FocusStatus,
  Preferences,
  TrainingSession,
} from "@/domain/types";
import type { TimeOption } from "@/services/availability";

const STORAGE_KEY = "pro-demo-state-v1";
let actionSequence = 0;

function actionId(prefix: string): string {
  actionSequence += 1;
  return `${prefix}-${Date.now()}-${actionSequence}`;
}

type AppActions = {
  hasHydrated: boolean;
  setHasHydrated: (ready: boolean) => void;
  setBookingDraft: (draft: Partial<BookingDraft>) => void;
  resetBookingDraft: () => void;
  completeBooking: (slot: TimeOption, coachId: string) => string | undefined;
  cancelSession: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, slot: TimeOption, coachId: string) => void;
  setResourceProgress: (resourceId: string, progressSeconds: number) => void;
  markResourceReviewed: (resourceId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setScenario: (scenario: DemoScenario) => void;
  resetDemo: () => void;
  publishRecap: () => string | undefined;
  assignResource: () => void;
  changePrimaryFocus: (focusId: string) => void;
  addCoachCue: () => void;
  applyBlueprintUpdate: (recapId: string) => void;
  setPresentationMode: (enabled: boolean) => void;
  setTourOpen: (open: boolean) => void;
};

export type AppStore = DemoState & AppActions;

const persistedKeys: (keyof DemoState)[] = [
  "schemaVersion",
  "athlete",
  "scenario",
  "virtualNowISO",
  "presentationMode",
  "tourOpen",
  "facilities",
  "coaches",
  "sessionTypes",
  "sessions",
  "focuses",
  "resources",
  "progress",
  "recaps",
  "notifications",
  "developmentEvents",
  "bookingDraft",
  "preferences",
];

function pickPersistedState(store: AppStore): DemoState {
  return Object.fromEntries(persistedKeys.map((key) => [key, store[key]])) as DemoState;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createDemoState(),
      hasHydrated: false,
      setHasHydrated: (ready) => set({ hasHydrated: ready }),
      setBookingDraft: (draft) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, ...draft } })),
      resetBookingDraft: () => set({ bookingDraft: { step: 0 } }),
      completeBooking: (slot, coachId) => {
        const state = get();
        const { sessionTypeId, facilityId } = state.bookingDraft;
        const type = state.sessionTypes.find((item) => item.id === sessionTypeId);
        const facility = state.facilities.find((item) => item.id === facilityId);
        if (!type || !facility) return undefined;
        const sessionId = actionId("session");
        const newSession: TrainingSession = {
          id: sessionId,
          sessionTypeId: type.id,
          facilityId: facility.id,
          coachId,
          startAt: slot.startAt,
          endAt: addMinutes(slot.startAt, type.durationMinutes),
          status: "scheduled",
          focusIds: state.focuses.filter((focus) => focus.status === "primary" || focus.status === "building").slice(0, 2).map((focus) => focus.id),
          sourceSlotId: `${slot.id}__${coachId}`,
        };
        const nowISO = state.virtualNowISO;
        set({
          sessions: [...state.sessions, newSession],
          bookingDraft: { ...state.bookingDraft, step: 7, completedSessionId: sessionId, coachId },
          notifications: [{ id: actionId("note"), type: "booking", title: "Session booked", body: `${type.title} at ${facility.name} was added to Training.`, createdAt: nowISO, read: false, href: `/training/${sessionId}` }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "session_booked", title: `${type.title} booked`, detail: facility.name, createdAt: nowISO, sessionId }, ...state.developmentEvents],
        });
        return sessionId;
      },
      cancelSession: (sessionId) => {
        const state = get();
        const target = state.sessions.find((sessionItem) => sessionItem.id === sessionId);
        if (!target || target.status === "cancelled") return;
        const type = state.sessionTypes.find((item) => item.id === target.sessionTypeId);
        set({
          sessions: state.sessions.map((sessionItem) => sessionItem.id === sessionId ? { ...sessionItem, status: "cancelled" } : sessionItem),
          notifications: [{ id: actionId("note"), type: "booking", title: "Session cancelled", body: `${type?.title ?? "Training"} was removed and the demo slot was released.`, createdAt: state.virtualNowISO, read: false, href: "/training" }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "session_cancelled", title: "Session cancelled", detail: type?.title ?? "Training", createdAt: state.virtualNowISO, sessionId }, ...state.developmentEvents],
        });
      },
      rescheduleSession: (sessionId, slot, coachId) => {
        const state = get();
        const target = state.sessions.find((sessionItem) => sessionItem.id === sessionId);
        if (!target) return;
        const type = state.sessionTypes.find((item) => item.id === target.sessionTypeId);
        set({
          sessions: state.sessions.map((sessionItem) => sessionItem.id === sessionId ? { ...sessionItem, startAt: slot.startAt, endAt: addMinutes(slot.startAt, type?.durationMinutes ?? 60), coachId, sourceSlotId: `${slot.id}__${coachId}`, status: "scheduled" } : sessionItem),
          notifications: [{ id: actionId("note"), type: "booking", title: "Session rescheduled", body: `${type?.title ?? "Training"} now has a new demo time.`, createdAt: state.virtualNowISO, read: false, href: `/training/${sessionId}` }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "session_rescheduled", title: "Session rescheduled", detail: type?.title ?? "Training", createdAt: state.virtualNowISO, sessionId }, ...state.developmentEvents],
        });
      },
      setResourceProgress: (resourceId, progressSeconds) => {
        const state = get();
        const resource = state.resources.find((item) => item.id === resourceId);
        if (!resource) return;
        const nextSeconds = Math.max(0, Math.min(resource.durationSeconds, progressSeconds));
        set({
          progress: {
            ...state.progress,
            [resourceId]: {
              resourceId,
              progressSeconds: nextSeconds,
              completed: nextSeconds >= resource.durationSeconds,
              lastViewedAt: state.virtualNowISO,
            },
          },
        });
      },
      markResourceReviewed: (resourceId) => {
        const state = get();
        const resource = state.resources.find((item) => item.id === resourceId);
        const wasCompleted = state.progress[resourceId]?.completed;
        if (!resource) return;
        set({
          progress: { ...state.progress, [resourceId]: { resourceId, progressSeconds: resource.durationSeconds, completed: true, lastViewedAt: state.virtualNowISO } },
          notifications: wasCompleted ? state.notifications : [{ id: actionId("note"), type: "resource", title: "Review complete", body: `${resource.title} was added to your development activity.`, createdAt: state.virtualNowISO, read: false, href: `/library/${resourceId}` }, ...state.notifications],
          developmentEvents: wasCompleted ? state.developmentEvents : [{ id: actionId("event"), type: "resource_reviewed", title: "Resource reviewed", detail: resource.title, createdAt: state.virtualNowISO, resourceId, focusId: resource.focusIds[0] }, ...state.developmentEvents],
        });
      },
      markNotificationRead: (notificationId) => set((state) => ({ notifications: state.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item) })),
      markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),
      dismissNotification: (notificationId) => set((state) => ({ notifications: state.notifications.filter((item) => item.id !== notificationId) })),
      setPreference: (key, value) => set((state) => ({ preferences: { ...state.preferences, [key]: value } })),
      setScenario: (scenario) => {
        const previous = get();
        const next = createScenarioState(scenario);
        set({ ...next, preferences: previous.preferences, hasHydrated: true });
      },
      resetDemo: () => {
        const next = createDemoState();
        set({ ...next, hasHydrated: true });
      },
      publishRecap: () => {
        const state = get();
        const target = state.sessions.find((item) => item.status === "recap_pending" || item.status === "completed") ?? state.sessions.find((item) => item.status === "scheduled");
        if (!target) return undefined;
        const nowISO = state.virtualNowISO;
        const recap = createScenarioRecap(target, nowISO);
        recap.id = actionId("recap");
        recap.sessionId = target.id;
        set({
          sessions: state.sessions.map((item) => item.id === target.id ? { ...item, status: "recap_ready", recapId: recap.id } : item),
          recaps: [recap, ...state.recaps],
          notifications: [{ id: actionId("note"), type: "recap", title: "Your recap is ready", body: "Coach feedback and a Blueprint update are ready to review.", createdAt: nowISO, read: false, href: `/training/${target.id}` }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "recap_published", title: "Session recap published", detail: "Coach cue and carry-forward focus added", createdAt: nowISO, sessionId: target.id }, ...state.developmentEvents],
        });
        return target.id;
      },
      assignResource: () => {
        const state = get();
        const resource = state.resources.find((item) => !state.progress[item.id]?.completed && item.id === "seal-recover") ?? state.resources.find((item) => !state.progress[item.id]?.completed);
        if (!resource) return;
        set({
          progress: { ...state.progress, [resource.id]: state.progress[resource.id] ?? { resourceId: resource.id, progressSeconds: 0, completed: false } },
          notifications: [{ id: actionId("note"), type: "resource", title: "New resource assigned", body: resource.title, createdAt: state.virtualNowISO, read: false, href: `/library/${resource.id}` }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "resource_assigned", title: "Resource assigned", detail: resource.title, createdAt: state.virtualNowISO, resourceId: resource.id, focusId: resource.focusIds[0] }, ...state.developmentEvents],
        });
      },
      changePrimaryFocus: (focusId) => {
        const state = get();
        const focus = state.focuses.find((item) => item.id === focusId);
        if (!focus) return;
        set({
          focuses: state.focuses.map((item) => ({ ...item, status: (item.id === focusId ? "primary" : item.status === "primary" ? "maintaining" : item.status) as FocusStatus, updatedAt: state.virtualNowISO })),
          notifications: [{ id: actionId("note"), type: "blueprint", title: "Blueprint updated", body: `${focus.title} is now your primary focus.`, createdAt: state.virtualNowISO, read: false, href: "/blueprint" }, ...state.notifications],
          developmentEvents: [{ id: actionId("event"), type: "focus_changed", title: "Primary focus changed", detail: focus.title, createdAt: state.virtualNowISO, focusId }, ...state.developmentEvents],
        });
      },
      addCoachCue: () => {
        const state = get();
        const first = state.recaps[0];
        if (!first) return;
        set({
          recaps: state.recaps.map((item, index) => index === 0 ? { ...item, coachCue: "Own the first contact, then recover through the middle of the next play." } : item),
          notifications: [{ id: actionId("note"), type: "recap", title: "Coach cue added", body: "A new cue was added to your latest session recap.", createdAt: state.virtualNowISO, read: false, href: `/training/${first.sessionId}` }, ...state.notifications],
        });
      },
      applyBlueprintUpdate: (recapId) => {
        const state = get();
        const recap = state.recaps.find((item) => item.id === recapId);
        if (!recap || recap.blueprintApplied) return;
        const changes = new Map(recap.blueprintChanges.map((change) => [change.focusId, change.nextStatus]));
        set({
          focuses: state.focuses.map((focus) => ({ ...focus, status: changes.get(focus.id) ?? focus.status, updatedAt: changes.has(focus.id) ? state.virtualNowISO : focus.updatedAt })),
          recaps: state.recaps.map((item) => item.id === recapId ? { ...item, blueprintApplied: true } : item),
          notifications: [{ id: actionId("note"), type: "blueprint", title: "Blueprint updated", body: "Your latest coach feedback now carries into the next session.", createdAt: state.virtualNowISO, read: false, href: "/blueprint" }, ...state.notifications],
          developmentEvents: ([...recap.blueprintChanges.map((change) => ({ id: actionId("event"), type: "focus_changed" as const, title: "Blueprint updated", detail: change.note, createdAt: state.virtualNowISO, focusId: change.focusId })), ...state.developmentEvents] satisfies DevelopmentEvent[]),
        });
      },
      setPresentationMode: (enabled) => {
        if (enabled) {
          const next = createDemoState();
          set({ ...next, presentationMode: true, hasHydrated: true });
        } else {
          set({ presentationMode: false });
        }
      },
      setTourOpen: (open) => set({ tourOpen: open }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: pickPersistedState,
      migrate: () => createDemoState(),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const next = rebaseDemoStateToDate(state, new Date());
        useAppStore.setState({ ...next, hasHydrated: true });
      },
    },
  ),
);

export function rehydrateAppStore(): Promise<void> {
  return Promise.resolve(useAppStore.persist.rehydrate());
}

export function buildRescheduleSlot(session: TrainingSession, dayOffset: number, hour: number, minute: number): TimeOption {
  const startAt = ottawaDateAt(new Date(useAppStore.getState().virtualNowISO), dayOffset, hour, minute).toISOString();
  return { id: `reschedule__${session.id}__${dayOffset}__${hour}${minute}`, startAt, label: "", remainingSpots: 1, coachIds: useAppStore.getState().coaches.map((coach) => coach.id) };
}
