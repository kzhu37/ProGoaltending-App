"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarPlus, Check, Clock3, ExternalLink, MapPin, RefreshCw, Trash2, UserRound, Video } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet } from "@/components/ui/sheet";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate, formatShortDate, formatTime } from "@/domain/dates";
import { deriveSessionPhase } from "@/domain/session";
import { demoAvailabilityService, type TimeOption } from "@/services/availability";
import { addCalendarEvent, mapsHref } from "@/services/calendar";
import { useAppStore } from "@/store/app-store";

export function SessionDetailScreen({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const state = useAppStore();
  const cancelSession = useAppStore((item) => item.cancelSession);
  const rescheduleSession = useAppStore((item) => item.rescheduleSession);
  const applyBlueprintUpdate = useAppStore((item) => item.applyBlueprintUpdate);
  const markNotificationRead = useAppStore((item) => item.markNotificationRead);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedSlot, setSelectedSlot] = useState<TimeOption>();
  const [selectedCoach, setSelectedCoach] = useState<string>();
  const [rescheduled, setRescheduled] = useState(false);
  const session = state.sessions.find((item) => item.id === sessionId);

  useEffect(() => {
    state.notifications.filter((item) => item.href === `/training/${sessionId}` && !item.read).forEach((item) => markNotificationRead(item.id));
  }, [markNotificationRead, sessionId, state.notifications]);

  const dates = demoAvailabilityService.listDates(state, 5);
  const type = state.sessionTypes.find((item) => item.id === session?.sessionTypeId);
  const facility = state.facilities.find((item) => item.id === session?.facilityId);
  const coach = state.coaches.find((item) => item.id === session?.coachId);
  const recap = state.recaps.find((item) => item.sessionId === sessionId);
  const phase = session ? deriveSessionPhase(session, state.virtualNowISO) : "archived";
  const timeOptions = (() => {
    if (!selectedDate || !session) return [];
    return demoAvailabilityService.listTimes(state, { facilityId: session.facilityId, sessionTypeId: session.sessionTypeId, dateKey: selectedDate });
  })();
  const coachOptions = selectedSlot ? demoAvailabilityService.listCoaches(state, selectedSlot) : [];

  if (!session || !type || !facility || !coach) {
    return <main className="page"><PageHeader back title="Session" /><div className="empty-state inline-empty"><h1>Session not found</h1><p>This session may have been removed from the demo state.</p><Link className="button primary" href="/training">Back to Training</Link></div></main>;
  }

  const handleReschedule = () => {
    if (!selectedSlot || !selectedCoach) return;
    rescheduleSession(sessionId, selectedSlot, selectedCoach);
    setRescheduled(true);
    setTimeout(() => {
      setRescheduleOpen(false);
      setRescheduled(false);
      setSelectedDate(undefined);
      setSelectedSlot(undefined);
      setSelectedCoach(undefined);
    }, 900);
  };

  return (
    <main className="page session-detail-page">
      <PageHeader back overline="Training" title="Session detail" />
      <section className={`session-detail-hero detail-${phase} photo-session`}>
        <div className="detail-ice-lines" aria-hidden="true" />
        <div className="session-detail-status"><StatusPill phase={phase} /><span>Demo session</span></div>
        <h1>{type.title}</h1>
        <div className="detail-datetime"><strong>{formatDate(session.startAt, { weekday: "long", month: "long", day: "numeric" })}</strong><span><Clock3 size={17} />{formatTime(session.startAt)} · {type.durationMinutes} min</span></div>
      </section>

      <section className="detail-grid">
        <a className="detail-info-card card-interactive" href={mapsHref(facility)} target="_blank" rel="noreferrer"><MapPin size={19} /><div><span>Location</span><strong>{facility.name}</strong><small>{facility.areaLabel}</small></div><ExternalLink size={16} /></a>
        <div className="detail-info-card"><UserRound size={19} /><div><span>Coach</span><strong>{coach.displayName}</strong><small>{coach.focusLabel}</small></div></div>
      </section>

      <section className="detail-section">
        <p className="eyebrow">{phase === "archived" || recap ? "Worked on" : "Today’s focus"}</p>
        <div className="large-focus-list">{session.focusIds.map((focusId, index) => { const focus = state.focuses.find((item) => item.id === focusId); return focus ? <Link href={`/blueprint/${focus.id}`} key={focus.id}><span>0{index + 1}</span><div><strong>{focus.title}</strong><small>{focus.category}</small></div><ArrowRight size={17} /></Link> : null; })}</div>
      </section>

      {session.status === "scheduled" ? (
        <section className="detail-section">
          <p className="eyebrow">Prep</p>
          <div className="prep-list">{session.focusIds.flatMap((id) => state.focuses.find((focus) => focus.id === id)?.resourceIds.slice(0, 1) ?? []).slice(0, 2).map((resourceId) => { const resource = state.resources.find((item) => item.id === resourceId); return resource ? <Link href={`/library/${resource.id}`} key={resource.id}><Video size={18} /><div><strong>{resource.title}</strong><span>{Math.ceil(resource.durationSeconds / 60)} min review</span></div><ArrowRight size={17} /></Link> : null; })}</div>
        </section>
      ) : null}

      {phase === "recap_pending" ? <section className="recap-pending-card"><div className="pending-orbit" aria-hidden="true"><span /></div><p className="eyebrow">Recap pending</p><h2>Coach feedback is being prepared.</h2><p>When the fictional recap is published, it will appear here and in Notifications.</p></section> : null}

      {recap ? (
        <motion.section className="full-recap" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="recap-head"><div><p className="eyebrow">Session recap</p><h2>Carry the work forward.</h2></div><span>{formatShortDate(recap.publishedAt)}</span></div>
          <div className="recap-summary"><span>Session summary</span><p>{recap.summary}</p></div>
          <blockquote><span>Coach cue</span>{recap.coachCue}</blockquote>
          <div className="recap-columns"><div><span>What changed</span><p>{recap.changed}</p></div><div><span>Carry forward</span><p>{recap.carryForward}</p></div></div>
          {recap.assignedResourceIds.map((resourceId) => { const resource = state.resources.find((item) => item.id === resourceId); return resource ? <Link key={resourceId} href={`/library/${resource.id}`} className="assigned-recap-resource"><Video size={18} /><div><span>Assigned review</span><strong>{resource.title}</strong></div><ArrowRight size={18} /></Link> : null; })}
          {recap.blueprintChanges.length ? (
            <div className={`blueprint-update-panel ${recap.blueprintApplied ? "applied" : ""}`}><div className="update-mark"><Check size={20} /></div><div><span>{recap.blueprintApplied ? "Blueprint updated" : "Blueprint change ready"}</span><h3>{recap.blueprintChanges.map((change) => state.focuses.find((focus) => focus.id === change.focusId)?.title).filter(Boolean).join(" + ")}</h3><p>{recap.blueprintChanges[0].note}</p></div>{recap.blueprintApplied ? <Link className="button small secondary" href="/blueprint">View Blueprint</Link> : <button className="button small primary" onClick={() => applyBlueprintUpdate(recap.id)}>Update Blueprint</button>}</div>
          ) : null}
        </motion.section>
      ) : null}

      {session.status === "scheduled" ? (
        <section className="session-actions">
          <button className="button secondary" onClick={() => addCalendarEvent(session, type, facility, state.preferences.calendarPreference)}><CalendarPlus size={18} /> Add to calendar</button>
          <button className="button secondary" onClick={() => setRescheduleOpen(true)}><RefreshCw size={18} /> Reschedule</button>
          <button className="button danger-quiet" onClick={() => setCancelOpen(true)}><Trash2 size={18} /> Cancel session</button>
        </section>
      ) : null}

      <Sheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel session" compact>
        <div className="confirm-sheet"><div className="destructive-icon"><Trash2 size={22} /></div><h3>Release this demo slot?</h3><p>The session will be removed from upcoming Training and returned to fictional availability.</p><button className="button danger" onClick={() => { cancelSession(sessionId); setCancelOpen(false); router.push("/training"); }}>Cancel session</button><button className="button quiet" onClick={() => setCancelOpen(false)}>Keep session</button></div>
      </Sheet>

      <Sheet open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule training">
        {rescheduled ? <div className="success-mini"><span><Check size={24} /></span><h3>Session updated</h3><p>Your new demo time is now reflected across Training and Home.</p></div> : (
          <div className="reschedule-flow">
            <p className="field-label">Choose a date</p>
            <div className="date-strip">{dates.map((date) => <button key={date.key} className={selectedDate === date.key ? "active" : ""} onClick={() => { setSelectedDate(date.key); setSelectedSlot(undefined); setSelectedCoach(undefined); }}><span>{formatDate(date.iso, { weekday: "short" })}</span><strong>{formatDate(date.iso, { day: "2-digit" })}</strong></button>)}</div>
            {selectedDate ? <><p className="field-label">Available time</p><div className="time-grid">{timeOptions.map((slot) => <button key={slot.id} className={selectedSlot?.id === slot.id ? "active" : ""} onClick={() => { setSelectedSlot(slot); setSelectedCoach(undefined); }}><strong>{slot.label}</strong><span>{slot.remainingSpots === 1 ? "1 spot" : `${slot.remainingSpots} spots`}</span></button>)}</div></> : null}
            {selectedSlot ? <><p className="field-label">Coach</p><div className="coach-grid compact-coaches">{coachOptions.map((coachItem) => <button key={coachItem.id} className={selectedCoach === coachItem.id ? "active" : ""} onClick={() => setSelectedCoach(coachItem.id)}><span>{coachItem.displayName.replace("Coach ", "")}</span><div><strong>{coachItem.displayName}</strong><small>{coachItem.focusLabel}</small></div></button>)}</div></> : null}
            <button className="button primary wide" disabled={!selectedSlot || !selectedCoach} onClick={handleReschedule}>Confirm new time</button>
          </div>
        )}
      </Sheet>
    </main>
  );
}
