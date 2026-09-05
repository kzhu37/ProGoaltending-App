"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, ChevronRight, Clock3, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { deriveSessionPhase } from "@/domain/session";
import { formatDate, formatTime } from "@/domain/dates";
import { useAppStore } from "@/store/app-store";

type View = "upcoming" | "history";
const historyFilters = [
  { id: "all", label: "All" },
  { id: "private", label: "Private" },
  { id: "small-group", label: "Small group" },
  { id: "development", label: "Development" },
  { id: "video-review", label: "Video" },
];

export function TrainingScreen() {
  const state = useAppStore();
  const [view, setView] = useState<View>("upcoming");
  const [filter, setFilter] = useState("all");
  const upcoming = state.sessions
    .filter((session) => session.status === "scheduled" && new Date(session.endAt) > new Date(state.virtualNowISO))
    .toSorted((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const history = state.sessions
    .filter((session) => ["archived", "completed", "recap_pending", "recap_ready"].includes(session.status) && (filter === "all" || session.sessionTypeId === filter))
    .toSorted((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return (
    <main className="page training-page">
      <PageHeader />
      <div className="page-title-row"><div><p className="eyebrow">Your development record</p><h1>Training</h1></div><Link className="mini-action" href="/book"><CalendarPlus size={17} /> Book</Link></div>
      <div className="segmented-control" role="tablist" aria-label="Training views">
        {(["upcoming", "history"] as View[]).map((item) => <button key={item} role="tab" aria-selected={view === item} onClick={() => setView(item)}>{view === item ? <motion.span layoutId="training-tab" /> : null}<strong>{item}</strong></button>)}
      </div>

      {view === "upcoming" ? (
        <motion.section key="upcoming" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          {upcoming.length ? (
            <div className="session-timeline">
              <div className="timeline-month">{formatDate(upcoming[0].startAt, { month: "short", year: "numeric" })}</div>
              {upcoming.map((session, index) => {
                const type = state.sessionTypes.find((item) => item.id === session.sessionTypeId)!;
                const facility = state.facilities.find((item) => item.id === session.facilityId)!;
                const coach = state.coaches.find((item) => item.id === session.coachId)!;
                const phase = deriveSessionPhase(session, state.virtualNowISO);
                return (
                  <div className="timeline-session" key={session.id}>
                    <div className="timeline-date"><span>{formatDate(session.startAt, { weekday: "short" })}</span><strong>{formatDate(session.startAt, { day: "2-digit" })}</strong><i /></div>
                    <Link href={`/training/${session.id}`} className="session-card card-interactive">
                      <div className="session-card-top"><StatusPill phase={phase} /><span>{coach.displayName}</span></div>
                      <h2>{type.title}</h2>
                      <div className="session-metadata"><span><Clock3 size={15} />{formatTime(session.startAt)}</span><span><MapPin size={15} />{facility.name}</span></div>
                      <div className="focus-chip-row">{session.focusIds.map((id) => <span key={id}>{state.focuses.find((focus) => focus.id === id)?.title}</span>)}</div>
                      <ChevronRight className="session-chevron" size={20} />
                    </Link>
                    {index < upcoming.length - 1 ? <div className="timeline-connector" /> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state inline-empty"><div className="empty-rings" aria-hidden="true" /><p className="eyebrow">No training scheduled</p><h2>Continue your Blueprint.</h2><p>Find a fictional demo session shaped around your primary focus.</p><Link className="button primary" href="/book">Find training <ArrowRight size={17} /></Link></div>
          )}
        </motion.section>
      ) : (
        <motion.section key="history" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
          <div className="scroll-filters" role="group" aria-label="Filter training history">
            {historyFilters.map((item) => <button key={item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </div>
          <div className="history-list">
            {history.map((session) => {
              const type = state.sessionTypes.find((item) => item.id === session.sessionTypeId)!;
              const recap = state.recaps.find((item) => item.sessionId === session.id);
              return (
                <Link className="history-card card-interactive" href={`/training/${session.id}`} key={session.id}>
                  <div className="history-date"><strong>{formatDate(session.startAt, { day: "2-digit" })}</strong><span>{formatDate(session.startAt, { month: "short" })}</span></div>
                  <div><span className="history-type">{type.title}</span><h2>{recap?.workedOn.join(" · ") ?? session.focusIds.map((id) => state.focuses.find((focus) => focus.id === id)?.title).join(" · ")}</h2><p>{session.status === "recap_pending" ? "Recap pending" : recap ? "Recap available" : "Session complete"}</p></div>
                  <ChevronRight size={20} />
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}
    </main>
  );
}
