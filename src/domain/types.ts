export type Region = "west" | "central" | "south" | "east";
export type FocusStatus =
  | "primary"
  | "building"
  | "maintaining"
  | "introduced"
  | "completed"
  | "revisit";
export type SessionStatus =
  | "scheduled"
  | "completed"
  | "recap_pending"
  | "recap_ready"
  | "archived"
  | "cancelled";
export type DemoScenario =
  | "standard"
  | "today"
  | "soon"
  | "complete"
  | "recap_pending"
  | "recap_ready"
  | "none"
  | "multiple";

export type DemoAthlete = {
  athleteId: "ath_demo_001";
  developmentTier: "Development";
};

export type Facility = {
  id: string;
  name: string;
  region: Region;
  areaLabel: string;
  mapPosition: { x: number; y: number };
};

export type Coach = {
  id: string;
  displayName: string;
  focusLabel: string;
};

export type SessionType = {
  id: string;
  title: string;
  durationMinutes: number;
  demoPrice: number;
  focusTags: string[];
  description: string;
};

export type AvailabilitySlot = {
  id: string;
  facilityId: string;
  coachId: string;
  sessionTypeId: string;
  startAt: string;
  remainingSpots: number;
};

export type TrainingSession = {
  id: string;
  sessionTypeId: string;
  facilityId: string;
  coachId: string;
  startAt: string;
  endAt: string;
  status: SessionStatus;
  focusIds: string[];
  recapId?: string;
  sourceSlotId?: string;
};

export type BlueprintFocus = {
  id: string;
  title: string;
  category: string;
  status: FocusStatus;
  priority: number;
  summary: string;
  coachCue: string;
  introducedAt: string;
  updatedAt: string;
  resourceIds: string[];
  relatedSessionIds: string[];
};

export type BlueprintChange = {
  focusId: string;
  nextStatus: FocusStatus;
  note: string;
};

export type SessionRecap = {
  id: string;
  sessionId: string;
  focusIds: string[];
  workedOn: string[];
  coachCue: string;
  summary: string;
  changed: string;
  carryForward: string;
  assignedResourceIds: string[];
  blueprintChanges: BlueprintChange[];
  publishedAt: string;
  blueprintApplied: boolean;
};

export type ResourceChapter = {
  atSeconds: number;
  label: string;
};

export type TrainingResource = {
  id: string;
  title: string;
  category: string;
  type: "video" | "review" | "prep";
  durationSeconds: number;
  focusIds: string[];
  chapters: ResourceChapter[];
  description: string;
  assignedReason: string;
};

export type ResourceProgress = {
  resourceId: string;
  progressSeconds: number;
  completed: boolean;
  lastViewedAt?: string;
};

export type NotificationType =
  | "booking"
  | "training"
  | "blueprint"
  | "resource"
  | "recap"
  | "system";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type DevelopmentEventType =
  | "session_completed"
  | "focus_added"
  | "focus_changed"
  | "resource_assigned"
  | "resource_reviewed"
  | "recap_published"
  | "session_booked"
  | "session_rescheduled"
  | "session_cancelled";

export type DevelopmentEvent = {
  id: string;
  type: DevelopmentEventType;
  title: string;
  detail: string;
  createdAt: string;
  sessionId?: string;
  focusId?: string;
  resourceId?: string;
};

export type BookingDraft = {
  step: number;
  sessionTypeId?: string;
  facilityId?: string;
  dateKey?: string;
  slotId?: string;
  coachId?: string;
  paymentMethod?: "card" | "apple" | "google" | "credit";
  completedSessionId?: string;
};

export type Preferences = {
  trainingReminders: boolean;
  blueprintUpdates: boolean;
  assignedResources: boolean;
  trainingOpenings: boolean;
  reduceMotion: boolean;
  calendarPreference: "download" | "google";
};

export type DemoState = {
  schemaVersion: 1;
  athlete: DemoAthlete;
  scenario: DemoScenario;
  virtualNowISO: string;
  presentationMode: boolean;
  tourOpen: boolean;
  facilities: Facility[];
  coaches: Coach[];
  sessionTypes: SessionType[];
  sessions: TrainingSession[];
  focuses: BlueprintFocus[];
  resources: TrainingResource[];
  progress: Record<string, ResourceProgress>;
  recaps: SessionRecap[];
  notifications: AppNotification[];
  developmentEvents: DevelopmentEvent[];
  bookingDraft: BookingDraft;
  preferences: Preferences;
};
