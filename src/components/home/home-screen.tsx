"use client";

import { motion } from "motion/react";
import { ArrowRight, CalendarDays, CalendarPlus, ChevronRight, CircleCheck, Clock3, MapPin, Play, Target } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { addCalendarEvent } from "@/services/calendar";
import { calendarDayDifference, formatDate, formatTime } from "@/domain/dates";
import { deriveSessionPhase, phaseLabel, selectHomeSession } from "@/domain/session";
import { useAppStore } from "@/store/app-store";

export function HomeScreen() {
  const state = useAppStore();
  const homeSession = selectHomeSession(state.sessions, state.virtualNowISO);
  const primaryFocus = state.focuses.find((focus) => focus.status === "primary") ?? state.focuses[0];
  const assigned = state.resources.find((resource) => {
    const progress = state.progress[resource.id];
    return progress && !progress.completed;
  });
  const upcoming = state.sessions
    .filter((session) => session.status === "scheduled" && new Date(session.endAt) > new Date(state.virtualNowISO))
    .toSorted((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(1, 4);

  return (
    <main className="page home-page">
      <PageHeader />
      <section className="home-intro" aria-label="Current training overview">
        <NextTraining state={state} session={homeSession} />
      </section>

      <div className="home-action-row" aria-label="Training actions">
        <Link className="button primary" href="/book"><CalendarPlus size={17} /> Book training</Link>
        <Link className="button secondary" href="/training"><CalendarDays size={17} /> Schedule</Link>
      </div>

      {state.bookingDraft.step > 0 && state.bookingDraft.step < 7 ? (
        <Link className="continue-booking" href="/book"><span>{state.bookingDraft.step.toString().padStart(2, "0")}</span><div><small>Continue booking</small><strong>{state.sessionTypes.find((item) => item.id === state.bookingDraft.sessionTypeId)?.title ?? "Training selection"}</strong></div><ArrowRight size={17} /></Link>
      ) : null}

      <section className="blueprint-preview card-interactive">
        <div className="section-heading"><p className="eyebrow">Current focus</p><Link href="/blueprint" aria-label="View full Blueprint">Blueprint <ArrowRight size={15} /></Link></div>
        <Link href={`/blueprint/${primaryFocus.id}`} className="primary-focus-link">
          <div className="focus-orbit" aria-hidden="true"><span /><Target size={24} /></div>
          <div><span className="status-label">Primary development focus</span><h2>{primaryFocus.title}</h2><p>{primaryFocus.summary}</p></div>
          <ChevronRight size={20} />
        </Link>
      </section>

      <section className="home-upcoming">
        <div className="section-heading"><div><p className="eyebrow">Next on your schedule</p><h2>Upcoming</h2></div><Link href="/training">See all <ArrowRight size={15} /></Link></div>
        <div className="upcoming-list">
          {upcoming.map((session) => {
            const type = state.sessionTypes.find((item) => item.id === session.sessionTypeId)!;
            const facility = state.facilities.find((item) => item.id === session.facilityId)!;
            return <Link href={`/training/${session.id}`} className="upcoming-row card-interactive" key={session.id}>
              <div className="upcoming-date"><strong>{formatDate(session.startAt, { day: "2-digit" })}</strong><span>{formatDate(session.startAt, { month: "short" })}</span></div>
              <div><strong>{formatTime(session.startAt)}</strong><span>{type.title}</span><small><MapPin size={12} /> {facility.name}</small></div>
              <ChevronRight size={17} />
            </Link>;
          })}
        </div>
      </section>

      <section className="current-action">
        <div className="section-heading"><p className="eyebrow">Before your next session</p></div>
        {assigned ? (
          <Link href={`/library/${assigned.id}`} className="action-card card-interactive">
            <div className="action-visual"><Play fill="currentColor" size={18} /></div>
            <div><h3>{assigned.title}</h3><p>{Math.ceil((assigned.durationSeconds - (state.progress[assigned.id]?.progressSeconds ?? 0)) / 60)} min remaining · {assigned.category}</p></div>
            <span className="action-arrow"><ArrowRight size={18} /></span>
          </Link>
        ) : (
          <div className="caught-up-card"><CircleCheck size={22} /><div><h3>You&apos;re caught up</h3><p>Your assigned work is reviewed.</p></div><Link href="/library">Browse library</Link></div>
        )}
      </section>

    </main>
  );
}

type StoreSnapshot = ReturnType<typeof useAppStore.getState>;

function NextTraining({ state, session }: { state: StoreSnapshot; session?: StoreSnapshot["sessions"][number] }) {
  if (!session) {
    const primary = state.focuses.find((focus) => focus.status === "primary");
    return (
      <motion.div className="next-training empty-training" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="hero-crease" aria-hidden="true" />
        <p className="eyebrow">No training scheduled</p>
        <h1>Ready for your next session?</h1>
        <p>Your Blueprint currently emphasizes <strong>{primary?.title}</strong>.</p>
        <Link className="button hero-button" href="/book">Find training <ArrowRight size={18} /></Link>
      </motion.div>
    );
  }

  const phase = deriveSessionPhase(session, state.virtualNowISO);
  const type = state.sessionTypes.find((item) => item.id === session.sessionTypeId)!;
  const facility = state.facilities.find((item) => item.id === session.facilityId)!;
  const dayDifference = Math.max(0, calendarDayDifference(state.virtualNowISO, session.startAt));
  const isLifecycle = ["complete", "recap_pending", "recap_ready"].includes(phase);
  return (
    <motion.div className={`next-training hero-${phase} photo-${type.id}`} layout>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-topline"><p className="eyebrow">{phaseLabel(phase)}</p>{phase === "upcoming" ? <span><strong>{dayDifference.toString().padStart(2, "0")}</strong> days</span> : <span className="live-status"><i />Live state</span>}</div>
      <div className="hero-date-row">
        <div><span>{formatDate(session.startAt, { weekday: "short" })}</span><strong>{formatDate(session.startAt, { day: "2-digit" })}</strong></div>
        <div className="hero-time"><Clock3 size={18} /><strong>{formatTime(session.startAt)}</strong><span>Ottawa time</span></div>
      </div>
      <div className="hero-session"><span>{type.title}</span><strong>{facility.name}</strong><small>{facility.areaLabel}</small></div>
      {phase === "today" || phase === "soon" ? <div className="today-focus"><span>Today&apos;s focus</span>{session.focusIds.map((id) => state.focuses.find((focus) => focus.id === id)?.title).filter(Boolean).join(" · ")}</div> : null}
      <div className="hero-actions">
        <Link className="button hero-button" href={`/training/${session.id}`}>{phase === "recap_ready" ? "Open recap" : isLifecycle ? "Session recap" : "Session details"}<ArrowRight size={17} /></Link>
        {session.status === "scheduled" ? <button className="button hero-quiet" onClick={() => addCalendarEvent(session, type, facility, state.preferences.calendarPreference)}><CalendarPlus size={17} /> Calendar</button> : null}
      </div>
    </motion.div>
  );
}
