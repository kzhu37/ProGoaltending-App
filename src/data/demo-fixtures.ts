import { addMinutes, calendarDayDifference, ottawaDateAt } from "@/domain/dates";
import type {
  AppNotification,
  BlueprintFocus,
  Coach,
  DemoScenario,
  DemoState,
  DevelopmentEvent,
  Facility,
  SessionRecap,
  SessionType,
  TrainingResource,
  TrainingSession,
} from "@/domain/types";

export const facilities: Facility[] = [
  { id: "bell", name: "Bell Sensplex", region: "west", areaLabel: "Kanata · West", mapPosition: { x: 18, y: 43 } },
  { id: "richcraft", name: "Richcraft Sensplex", region: "east", areaLabel: "Gloucester · East", mapPosition: { x: 76, y: 40 } },
  { id: "nepean", name: "Nepean Sportsplex", region: "west", areaLabel: "Nepean · West-Central", mapPosition: { x: 37, y: 57 } },
  { id: "ray-friel", name: "Ray Friel Recreation Complex", region: "east", areaLabel: "Orléans · East", mapPosition: { x: 88, y: 34 } },
  { id: "jim-durrell", name: "Jim Durrell Recreation Centre", region: "central", areaLabel: "South · Central", mapPosition: { x: 56, y: 64 } },
  { id: "cardelrec", name: "CARDELREC Recreation Complex Goulbourn", region: "west", areaLabel: "Stittsville · West", mapPosition: { x: 11, y: 61 } },
  { id: "minto", name: "Minto Recreation Complex", region: "south", areaLabel: "Barrhaven · Southwest", mapPosition: { x: 35, y: 79 } },
  { id: "bob-macquarrie", name: "Bob MacQuarrie Recreation Complex", region: "east", areaLabel: "Orléans · East", mapPosition: { x: 83, y: 28 } },
  { id: "canterbury", name: "Canterbury Recreation Complex", region: "central", areaLabel: "Alta Vista · Central-East", mapPosition: { x: 66, y: 54 } },
  { id: "fred-barrett", name: "Fred Barrett Arena", region: "south", areaLabel: "South Ottawa", mapPosition: { x: 62, y: 81 } },
];

export const coaches: Coach[] = [
  { id: "coach-01", displayName: "Coach 01", focusLabel: "Technical Development" },
  { id: "coach-02", displayName: "Coach 02", focusLabel: "Movement" },
  { id: "coach-03", displayName: "Coach 03", focusLabel: "Reads & Tracking" },
  { id: "coach-04", displayName: "Coach 04", focusLabel: "Video Review" },
];

export const sessionTypes: SessionType[] = [
  { id: "private", title: "Private Training", durationMinutes: 60, demoPrice: 125, focusTags: ["Rebound Control", "Post Integration"], description: "One-athlete technical work shaped around the current Blueprint." },
  { id: "small-group", title: "Small Group Clinic", durationMinutes: 80, demoPrice: 85, focusTags: ["Tracking", "Rebound Control"], description: "Small-group repetitions with individual coaching cues." },
  { id: "development", title: "Development Session", durationMinutes: 90, demoPrice: 105, focusTags: ["Movement", "Post Integration"], description: "A broader on-ice session connecting movement, reads, and recovery." },
  { id: "video-review", title: "Video Review", durationMinutes: 30, demoPrice: 55, focusTags: ["Tracking", "Reads"], description: "A focused off-ice review using predetermined demo annotations." },
];

export const resources: TrainingResource[] = [
  { id: "tracking-traffic", title: "Tracking Through Traffic", category: "Screens & Traffic", type: "review", durationSeconds: 222, focusIds: ["tracking"], description: "Hold the release, find the puck through layers, and arrive set.", assignedReason: "Assigned to prepare your eyes and patience for the next on-ice session.", chapters: [{ atSeconds: 18, label: "Setup" }, { atSeconds: 51, label: "Initial tracking" }, { atSeconds: 97, label: "Screen management" }, { atSeconds: 144, label: "Save selection" }, { atSeconds: 186, label: "Recovery" }] },
  { id: "first-contact", title: "Rebound Control: First Contact", category: "Rebound Control", type: "video", durationSeconds: 178, focusIds: ["rebound-control"], description: "Shape the first contact and recover into the next play.", assignedReason: "Recommended because Rebound Control is your primary focus.", chapters: [{ atSeconds: 12, label: "Set position" }, { atSeconds: 48, label: "Contact angle" }, { atSeconds: 103, label: "Directing pucks" }, { atSeconds: 151, label: "Second play" }] },
  { id: "seal-recover", title: "Post Integration: Seal and Recover", category: "Post Play", type: "review", durationSeconds: 255, focusIds: ["post-integration"], description: "Connect post seal, sightline, and controlled release from the post.", assignedReason: "Recommended to maintain your post integration details.", chapters: [{ atSeconds: 22, label: "Entry" }, { atSeconds: 79, label: "Seal" }, { atSeconds: 142, label: "Scan" }, { atSeconds: 211, label: "Recover" }] },
  { id: "pre-ice", title: "Pre-Ice Movement Prep", category: "Off-Ice Preparation", type: "prep", durationSeconds: 300, focusIds: ["movement"], description: "A compact movement sequence before stepping on the ice.", assignedReason: "Use before longer development sessions.", chapters: [{ atSeconds: 0, label: "Reset" }, { atSeconds: 72, label: "Hips" }, { atSeconds: 164, label: "Edges" }, { atSeconds: 246, label: "Ready" }] },
  { id: "reading-release", title: "Reading the Release", category: "Rush Play", type: "review", durationSeconds: 200, focusIds: ["tracking"], description: "Notice stick position, release window, and traffic before committing.", assignedReason: "Recommended to reinforce Tracking Through Traffic.", chapters: [{ atSeconds: 15, label: "Pre-shot" }, { atSeconds: 68, label: "Release" }, { atSeconds: 121, label: "Traffic" }, { atSeconds: 172, label: "Decision" }] },
  { id: "lateral-arrival", title: "Lateral Arrival: Quiet Edges", category: "Crease Movement", type: "video", durationSeconds: 236, focusIds: ["movement"], description: "Arrive square and quiet without adding a second correction.", assignedReason: "Connected to your completed movement foundation.", chapters: [{ atSeconds: 20, label: "Load" }, { atSeconds: 85, label: "Travel" }, { atSeconds: 148, label: "Arrival" }, { atSeconds: 207, label: "Reset" }] },
  { id: "recovery-lane", title: "Recovery Into the Lane", category: "Recovery", type: "video", durationSeconds: 194, focusIds: ["rebound-control"], description: "Recover through the most likely second-play lane.", assignedReason: "Supports availability after first contact.", chapters: [{ atSeconds: 17, label: "Read" }, { atSeconds: 71, label: "Push" }, { atSeconds: 126, label: "Find" }, { atSeconds: 168, label: "Set" }] },
  { id: "reset-between-reps", title: "Reset Between Repetitions", category: "Mental Preparation", type: "prep", durationSeconds: 160, focusIds: ["movement"], description: "A short between-rep reset to carry one clear cue forward.", assignedReason: "A supporting preparation resource.", chapters: [{ atSeconds: 8, label: "Breathe" }, { atSeconds: 55, label: "Clear" }, { atSeconds: 104, label: "Cue" }, { atSeconds: 142, label: "Ready" }] },
];

function session(
  id: string,
  now: Date,
  dayOffset: number,
  hour: number,
  minute: number,
  sessionTypeId: string,
  facilityId: string,
  coachId: string,
  focusIds: string[],
  status: TrainingSession["status"],
  recapId?: string,
): TrainingSession {
  const startAt = ottawaDateAt(now, dayOffset, hour, minute).toISOString();
  const type = sessionTypes.find((item) => item.id === sessionTypeId) ?? sessionTypes[0];
  return { id, sessionTypeId, facilityId, coachId, startAt, endAt: addMinutes(startAt, type.durationMinutes), status, focusIds, recapId };
}

function createSessions(now: Date): TrainingSession[] {
  return [
    session("upcoming-primary", now, 2, 9, 30, "private", "bell", "coach-02", ["rebound-control", "tracking"], "scheduled"),
    session("upcoming-group", now, 7, 18, 30, "small-group", "richcraft", "coach-03", ["tracking"], "scheduled"),
    session("upcoming-development", now, 12, 16, 0, "development", "nepean", "coach-01", ["post-integration", "movement"], "scheduled"),
    session("history-01", now, -5, 17, 0, "small-group", "nepean", "coach-03", ["tracking", "rebound-control"], "archived", "recap-01"),
    session("history-02", now, -12, 8, 0, "private", "bell", "coach-01", ["rebound-control"], "archived", "recap-02"),
    session("history-03", now, -21, 18, 30, "development", "jim-durrell", "coach-02", ["movement", "tracking"], "archived", "recap-03"),
    session("history-04", now, -34, 9, 30, "private", "bell", "coach-01", ["post-integration"], "archived", "recap-04"),
    session("history-05", now, -49, 11, 0, "small-group", "richcraft", "coach-03", ["tracking"], "archived", "recap-05"),
    session("history-06", now, -66, 14, 30, "development", "minto", "coach-02", ["movement"], "archived", "recap-06"),
    session("history-07", now, -84, 10, 0, "video-review", "canterbury", "coach-04", ["tracking", "post-integration"], "archived", "recap-07"),
    session("history-08", now, -103, 16, 30, "private", "bell", "coach-01", ["movement"], "archived", "recap-08"),
  ];
}

function createFocuses(now: Date): BlueprintFocus[] {
  return [
    { id: "rebound-control", title: "Rebound Control", category: "Puck Management", status: "primary", priority: 1, summary: "Control the first contact and remain available for the second play.", coachCue: "Meet the puck; do not reach for it.", introducedAt: ottawaDateAt(now, -72, 12).toISOString(), updatedAt: ottawaDateAt(now, -5, 19).toISOString(), resourceIds: ["first-contact", "recovery-lane"], relatedSessionIds: ["history-01", "history-02", "upcoming-primary"] },
    { id: "tracking", title: "Tracking Through Traffic", category: "Reads & Tracking", status: "building", priority: 2, summary: "Stay connected to the release through bodies and layered screens.", coachCue: "Hold your edges until the release is confirmed.", introducedAt: ottawaDateAt(now, -105, 12).toISOString(), updatedAt: ottawaDateAt(now, -5, 19).toISOString(), resourceIds: ["tracking-traffic", "reading-release"], relatedSessionIds: ["history-01", "history-03", "history-05", "upcoming-group"] },
    { id: "post-integration", title: "Post Integration", category: "Post Play", status: "maintaining", priority: 3, summary: "Connect seal, vision, and release from the post without losing the middle.", coachCue: "Let the eyes lead the release from the post.", introducedAt: ottawaDateAt(now, -43, 12).toISOString(), updatedAt: ottawaDateAt(now, -12, 10).toISOString(), resourceIds: ["seal-recover"], relatedSessionIds: ["history-04", "history-07", "upcoming-development"] },
    { id: "movement", title: "Crease Movement Foundations", category: "Movement", status: "completed", priority: 4, summary: "Quiet, connected movement that arrives set before the release.", coachCue: "Finish the push before adding the save.", introducedAt: ottawaDateAt(now, -132, 12).toISOString(), updatedAt: ottawaDateAt(now, -34, 10).toISOString(), resourceIds: ["lateral-arrival", "pre-ice", "reset-between-reps"], relatedSessionIds: ["history-03", "history-06", "history-08"] },
  ];
}

function createRecaps(now: Date): SessionRecap[] {
  const sessionIds = ["history-01", "history-02", "history-03", "history-04", "history-05", "history-06", "history-07", "history-08"];
  return sessionIds.map((sessionId, index) => ({
    id: `recap-0${index + 1}`,
    sessionId,
    focusIds: index % 2 === 0 ? ["tracking", "rebound-control"] : ["rebound-control"],
    workedOn: index % 2 === 0 ? ["Tracking", "Rebound Control"] : ["Rebound Control", "Recovery"],
    coachCue: index === 0 ? "Stay patient through the release before moving into recovery." : "Arrive balanced, then let the save remain quiet.",
    summary: index === 0 ? "Traffic reads improved when the first movement stayed connected to the release." : "The session connected controlled movement with a cleaner first contact.",
    changed: index === 0 ? "Tracking is now carried into the next session as an active building focus." : "The cue was simplified so it can transfer into the next repetition.",
    carryForward: index === 0 ? "Find the release before entering recovery." : "Finish the arrival before responding to the shot.",
    assignedResourceIds: index === 0 ? ["tracking-traffic"] : [],
    blueprintChanges: index === 0 ? [{ focusId: "post-integration", nextStatus: "primary", note: "Bring the same patience to post releases." }] : [],
    publishedAt: ottawaDateAt(now, -5 - index * 10, 20).toISOString(),
    blueprintApplied: index !== 0,
  }));
}

function createNotifications(now: Date): AppNotification[] {
  return [
    { id: "note-01", type: "resource", title: "Review assigned", body: "Tracking Through Traffic is ready before your next session.", createdAt: ottawaDateAt(now, -1, 16).toISOString(), read: false, href: "/library/tracking-traffic" },
    { id: "note-02", type: "training", title: "Training this week", body: "Private Training at Bell Sensplex is coming up.", createdAt: ottawaDateAt(now, -2, 11).toISOString(), read: false, href: "/training/upcoming-primary" },
    { id: "note-03", type: "recap", title: "Session recap published", body: "Your latest coaching cues are available.", createdAt: ottawaDateAt(now, -5, 20).toISOString(), read: true, href: "/training/history-01" },
    { id: "note-04", type: "blueprint", title: "Blueprint updated", body: "Rebound Control remains your primary development focus.", createdAt: ottawaDateAt(now, -12, 18).toISOString(), read: true, href: "/blueprint" },
    { id: "note-05", type: "booking", title: "Session booked", body: "Small Group Clinic was added to your training plan.", createdAt: ottawaDateAt(now, -16, 9).toISOString(), read: true, href: "/training/upcoming-group" },
    { id: "note-06", type: "system", title: "New demo availability", body: "Additional fictional sessions are open this month.", createdAt: ottawaDateAt(now, -19, 14).toISOString(), read: true, href: "/book" },
  ];
}

function createEvents(now: Date): DevelopmentEvent[] {
  return [
    { id: "event-01", type: "resource_assigned", title: "Review assigned", detail: "Tracking Through Traffic", createdAt: ottawaDateAt(now, -1, 16).toISOString(), resourceId: "tracking-traffic", focusId: "tracking" },
    { id: "event-02", type: "session_booked", title: "Private Training booked", detail: "Bell Sensplex", createdAt: ottawaDateAt(now, -3, 14).toISOString(), sessionId: "upcoming-primary" },
    { id: "event-03", type: "recap_published", title: "Session recap published", detail: "Tracking carried forward", createdAt: ottawaDateAt(now, -5, 20).toISOString(), sessionId: "history-01" },
    { id: "event-04", type: "session_completed", title: "Small Group Clinic completed", detail: "Tracking · Rebound Control", createdAt: ottawaDateAt(now, -5, 18).toISOString(), sessionId: "history-01" },
    { id: "event-05", type: "focus_changed", title: "Blueprint updated", detail: "Rebound Control moved to Primary", createdAt: ottawaDateAt(now, -12, 19).toISOString(), focusId: "rebound-control" },
    { id: "event-06", type: "resource_reviewed", title: "First Contact reviewed", detail: "Resource completed", createdAt: ottawaDateAt(now, -14, 12).toISOString(), resourceId: "first-contact" },
    { id: "event-07", type: "focus_added", title: "Focus introduced", detail: "Post Integration", createdAt: ottawaDateAt(now, -43, 18).toISOString(), focusId: "post-integration" },
    { id: "event-08", type: "session_completed", title: "Development Session completed", detail: "Movement · Tracking", createdAt: ottawaDateAt(now, -66, 17).toISOString(), sessionId: "history-06" },
    { id: "event-09", type: "focus_changed", title: "Focus completed", detail: "Crease Movement Foundations", createdAt: ottawaDateAt(now, -72, 18).toISOString(), focusId: "movement" },
    { id: "event-10", type: "resource_assigned", title: "Review assigned", detail: "Reading the Release", createdAt: ottawaDateAt(now, -84, 18).toISOString(), resourceId: "reading-release" },
  ];
}

export function createDemoState(referenceDate = new Date()): DemoState {
  return {
    schemaVersion: 1,
    athlete: { athleteId: "ath_demo_001", developmentTier: "Development" },
    scenario: "standard",
    virtualNowISO: referenceDate.toISOString(),
    presentationMode: true,
    tourOpen: false,
    facilities,
    coaches,
    sessionTypes,
    sessions: createSessions(referenceDate),
    focuses: createFocuses(referenceDate),
    resources,
    progress: {
      "tracking-traffic": { resourceId: "tracking-traffic", progressSeconds: 84, completed: false, lastViewedAt: ottawaDateAt(referenceDate, -1, 16).toISOString() },
      "first-contact": { resourceId: "first-contact", progressSeconds: 178, completed: true, lastViewedAt: ottawaDateAt(referenceDate, -14, 12).toISOString() },
      "seal-recover": { resourceId: "seal-recover", progressSeconds: 56, completed: false, lastViewedAt: ottawaDateAt(referenceDate, -9, 19).toISOString() },
    },
    recaps: createRecaps(referenceDate),
    notifications: createNotifications(referenceDate),
    developmentEvents: createEvents(referenceDate),
    bookingDraft: { step: 0 },
    preferences: { trainingReminders: true, blueprintUpdates: true, assignedResources: true, trainingOpenings: false, reduceMotion: false, calendarPreference: "download" },
  };
}

function shiftISO(iso: string, dayDifference: number): string {
  return new Date(new Date(iso).getTime() + dayDifference * 86_400_000).toISOString();
}

export function rebaseDemoStateToDate(state: DemoState, referenceDate: Date): DemoState {
  const nextNowISO = referenceDate.toISOString();
  const dayDifference = calendarDayDifference(state.virtualNowISO, nextNowISO);
  if (dayDifference === 0) return { ...state, virtualNowISO: nextNowISO };

  const next = {
    ...state,
    virtualNowISO: nextNowISO,
    sessions: state.sessions.map((item) => ({ ...item, startAt: shiftISO(item.startAt, dayDifference), endAt: shiftISO(item.endAt, dayDifference) })),
    focuses: state.focuses.map((item) => ({ ...item, introducedAt: shiftISO(item.introducedAt, dayDifference), updatedAt: shiftISO(item.updatedAt, dayDifference) })),
    recaps: state.recaps.map((item) => ({ ...item, publishedAt: shiftISO(item.publishedAt, dayDifference) })),
    notifications: state.notifications.map((item) => ({ ...item, createdAt: shiftISO(item.createdAt, dayDifference) })),
    developmentEvents: state.developmentEvents.map((item) => ({ ...item, createdAt: shiftISO(item.createdAt, dayDifference) })),
    progress: Object.fromEntries(Object.entries(state.progress).map(([id, item]) => [id, { ...item, lastViewedAt: item.lastViewedAt ? shiftISO(item.lastViewedAt, dayDifference) : undefined }])),
    bookingDraft: { step: 0 },
  } satisfies DemoState;

  const primary = next.sessions.find((item) => item.id === "upcoming-primary");
  if (state.scenario === "standard" && primary) {
    primary.startAt = ottawaDateAt(referenceDate, 2, 9, 30).toISOString();
    primary.endAt = addMinutes(primary.startAt, sessionTypes.find((item) => item.id === primary.sessionTypeId)?.durationMinutes ?? 60);
  }
  return next;
}

export function createScenarioState(scenario: DemoScenario, referenceDate = new Date()): DemoState {
  const state = createDemoState(referenceDate);
  state.scenario = scenario;
  if (scenario === "standard" || scenario === "multiple") return state;
  if (scenario === "none") {
    state.sessions = state.sessions.filter((item) => item.status !== "scheduled");
    return state;
  }

  const target = state.sessions.find((item) => item.id === "upcoming-primary");
  if (!target) return state;
  const duration = sessionTypes.find((item) => item.id === target.sessionTypeId)?.durationMinutes ?? 60;
  const startHour = 9;
  const startMinute = 30;
  target.startAt = ottawaDateAt(referenceDate, 0, startHour, startMinute).toISOString();
  target.endAt = addMinutes(target.startAt, duration);

  if (scenario === "today") {
    state.virtualNowISO = ottawaDateAt(referenceDate, 0, 7, 15).toISOString();
  } else if (scenario === "soon") {
    state.virtualNowISO = ottawaDateAt(referenceDate, 0, 9, 8).toISOString();
  } else if (scenario === "complete") {
    target.status = "completed";
    state.virtualNowISO = ottawaDateAt(referenceDate, 0, 10, 50).toISOString();
  } else if (scenario === "recap_pending") {
    target.status = "recap_pending";
    state.virtualNowISO = ottawaDateAt(referenceDate, 0, 11, 10).toISOString();
  } else if (scenario === "recap_ready") {
    target.status = "recap_ready";
    target.recapId = "recap-scenario";
    state.virtualNowISO = ottawaDateAt(referenceDate, 0, 11, 30).toISOString();
    state.recaps.unshift(createScenarioRecap(target, state.virtualNowISO));
    state.notifications.unshift({ id: "note-scenario-recap", type: "recap", title: "Your recap is ready", body: "Coach 02 published your Private Training recap.", createdAt: state.virtualNowISO, read: false, href: `/training/${target.id}` });
  }
  return state;
}

export function createScenarioRecap(sessionItem: TrainingSession, nowISO: string): SessionRecap {
  return {
    id: "recap-scenario",
    sessionId: sessionItem.id,
    focusIds: ["rebound-control", "tracking"],
    workedOn: ["Rebound Control", "Tracking"],
    coachCue: "Stay over the first contact, then recover through the second-play lane.",
    summary: "The session linked patient tracking to a cleaner first contact under traffic.",
    changed: "Post Integration is ready to become the next primary emphasis.",
    carryForward: "Let the eyes lead every release from the post.",
    assignedResourceIds: ["seal-recover"],
    blueprintChanges: [{ focusId: "post-integration", nextStatus: "primary", note: "Promote Post Integration to the primary focus." }, { focusId: "rebound-control", nextStatus: "maintaining", note: "Carry Rebound Control forward as a maintaining focus." }],
    publishedAt: nowISO,
    blueprintApplied: false,
  };
}
