import type { SessionPhase } from "@/domain/session";

export function StatusPill({ phase }: { phase: SessionPhase }) {
  const label: Record<SessionPhase, string> = {
    upcoming: "Scheduled",
    today: "Today",
    soon: "Starting soon",
    complete: "Complete",
    recap_pending: "Recap pending",
    recap_ready: "Recap ready",
    archived: "Recap available",
    cancelled: "Cancelled",
  };
  return <span className={`status-pill status-${phase}`}>{label[phase]}</span>;
}
