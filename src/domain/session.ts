import type { SessionStatus, TrainingSession } from "./types";

export type SessionPhase =
  | "upcoming"
  | "today"
  | "soon"
  | "complete"
  | "recap_pending"
  | "recap_ready"
  | "archived"
  | "cancelled";

export function deriveSessionPhase(session: TrainingSession, nowISO: string): SessionPhase {
  if (session.status === "cancelled") return "cancelled";
  if (session.status === "archived") return "archived";
  if (session.status === "recap_pending") return "recap_pending";
  if (session.status === "recap_ready") return "recap_ready";
  if (session.status === "completed") return "complete";

  const now = new Date(nowISO).getTime();
  const start = new Date(session.startAt).getTime();
  const end = new Date(session.endAt).getTime();
  if (now >= end) return "complete";
  if (now >= start - 45 * 60_000) return "soon";

  const sameDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return sameDay.format(new Date(session.startAt)) === sameDay.format(new Date(nowISO))
    ? "today"
    : "upcoming";
}

export function phaseLabel(phase: SessionPhase): string {
  const labels: Record<SessionPhase, string> = {
    upcoming: "Next training",
    today: "Training today",
    soon: "Training soon",
    complete: "Session complete",
    recap_pending: "Recap pending",
    recap_ready: "Your recap is ready",
    archived: "Archived",
    cancelled: "Cancelled",
  };
  return labels[phase];
}

export function isUpcomingStatus(status: SessionStatus): boolean {
  return status === "scheduled";
}

export function selectHomeSession(sessions: TrainingSession[], nowISO: string): TrainingSession | undefined {
  const lifecycleSession = sessions
    .filter((session) => ["completed", "recap_pending", "recap_ready"].includes(session.status))
    .toSorted((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())[0];

  if (lifecycleSession) {
    const age = new Date(nowISO).getTime() - new Date(lifecycleSession.endAt).getTime();
    if (age >= 0 && age < 18 * 60 * 60_000) return lifecycleSession;
  }

  return sessions
    .filter((session) => session.status === "scheduled" && new Date(session.endAt) > new Date(nowISO))
    .toSorted((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
}
