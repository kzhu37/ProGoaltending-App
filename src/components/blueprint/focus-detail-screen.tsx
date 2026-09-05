"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, FilePlay } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedCrease } from "./animated-crease";
import { formatDate, formatShortDate } from "@/domain/dates";
import { useAppStore } from "@/store/app-store";

export function FocusDetailScreen({ focusId }: { focusId: string }) {
  const state = useAppStore();
  const focus = state.focuses.find((item) => item.id === focusId);
  if (!focus) return <main className="page"><PageHeader back title="Blueprint" /><div className="empty-state inline-empty"><h1>Focus not found</h1><Link className="button primary" href="/blueprint">Back to Blueprint</Link></div></main>;
  const sessions = state.sessions.filter((item) => focus.relatedSessionIds.includes(item.id));
  const events = state.developmentEvents.filter((item) => item.focusId === focus.id || (item.sessionId && focus.relatedSessionIds.includes(item.sessionId)));
  return (
    <main className="page focus-detail-page">
      <PageHeader back overline="Blueprint" title="Focus detail" />
      <section className="focus-detail-title"><div><span>{focus.status} focus</span><h1>{focus.title}</h1><p>{focus.summary}</p></div><small>Updated {formatShortDate(focus.updatedAt)}</small></section>
      <AnimatedCrease focusId={focus.id} label={focus.title} />
      <blockquote className="focus-cue"><span>Coach cue</span>{focus.coachCue}</blockquote>
      <div className="focus-origin"><div><span>Introduced</span><strong>{formatDate(focus.introducedAt, { month: "long", day: "numeric", year: "numeric" })}</strong></div><div><span>Current state</span><strong>{focus.status}</strong></div></div>
      <section className="detail-section"><p className="eyebrow">Assigned resources</p><div className="resource-link-list">{focus.resourceIds.map((id) => { const resource = state.resources.find((item) => item.id === id); const progress = state.progress[id]; return resource ? <Link href={`/library/${id}`} key={id}><span className="resource-link-icon">{progress?.completed ? <Check size={18} /> : <FilePlay size={18} />}</span><div><strong>{resource.title}</strong><small>{progress?.completed ? "Reviewed" : `${Math.ceil(resource.durationSeconds / 60)} min · ${resource.type}`}</small></div><ArrowRight size={17} /></Link> : null; })}</div></section>
      <section className="detail-section"><p className="eyebrow">Related sessions</p><div className="related-session-list">{sessions.slice(0, 4).map((session) => { const type = state.sessionTypes.find((item) => item.id === session.sessionTypeId); return <Link href={`/training/${session.id}`} key={session.id}><CalendarDays size={18} /><div><strong>{type?.title}</strong><small>{formatShortDate(session.startAt)}</small></div><ArrowRight size={17} /></Link>; })}</div></section>
      <section className="detail-section"><p className="eyebrow">Recent activity</p><div className="focus-activity">{events.slice(0, 5).map((event) => <div key={event.id}><span /><time>{formatShortDate(event.createdAt)}</time><p><strong>{event.title}</strong>{event.detail}</p></div>)}</div></section>
      <Link className="button primary wide" href={`/book`}>Find related training <ArrowRight size={17} /></Link>
    </main>
  );
}
