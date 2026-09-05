"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronRight, Clock3, FilePlay, Layers3 } from "lucide-react";
import { AnimatedCrease } from "./animated-crease";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet } from "@/components/ui/sheet";
import { formatShortDate } from "@/domain/dates";
import type { DevelopmentEvent } from "@/domain/types";
import { analytics } from "@/services/analytics";
import { useAppStore } from "@/store/app-store";

export function BlueprintScreen() {
  const state = useAppStore();
  const primary = state.focuses.find((focus) => focus.status === "primary") ?? state.focuses[0];
  const [selectedId, setSelectedId] = useState(primary.id);
  const [selectedEvent, setSelectedEvent] = useState<DevelopmentEvent>();
  const selected = state.focuses.find((focus) => focus.id === selectedId) ?? primary;

  useEffect(() => analytics.track("blueprint_viewed"), []);
  return (
    <main className="page blueprint-page">
      <PageHeader />
      <div className="page-title-row"><div><p className="eyebrow">Development system</p><h1>Blueprint</h1></div><span className="concept-label"><i /> Conceptual view</span></div>
      <AnimatedCrease focusId={selected.id} label={selected.title} />

      <section className="focus-selector" aria-label="Select development focus">
        {state.focuses.map((focus, index) => (
          <motion.button key={focus.id} className={selected.id === focus.id ? "active" : ""} onClick={() => setSelectedId(focus.id)} whileTap={{ scale: .98 }}>
            <span>0{index + 1}</span><div><strong>{focus.title}</strong><small>{focus.status}</small></div>{selected.id === focus.id ? <motion.i layoutId="focus-selector-indicator" /> : null}
          </motion.button>
        ))}
      </section>

      <motion.section className="selected-focus-card" key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="selected-focus-top"><span>{selected.category}</span><small>{selected.status} focus</small></div>
        <h2>{selected.title}</h2>
        <p>{selected.summary}</p>
        <blockquote><span>Current cue</span>{selected.coachCue}</blockquote>
        <div className="focus-stats"><span><strong>{selected.relatedSessionIds.length}</strong> related sessions</span><span><strong>{selected.resourceIds.length}</strong> connected resources</span><span><Clock3 size={15} /> Updated {formatShortDate(selected.updatedAt)}</span></div>
        <Link className="text-link" href={`/blueprint/${selected.id}`}>Open focus detail <ArrowRight size={16} /></Link>
      </motion.section>

      <section className="blueprint-history">
        <div className="section-heading"><div><p className="eyebrow">Blueprint history</p><h2>How the work evolved</h2></div><span>Scroll to explore</span></div>
        <div className="history-scrubber" tabIndex={0} aria-label="Horizontal development timeline">
          <div className="scrubber-months"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
          <div className="scrubber-track" aria-hidden="true"><i /><i /><i /><i /></div>
          {state.developmentEvents.slice(0, 8).toReversed().map((event, index) => (
            <button key={event.id} className={`scrubber-event event-${index % 3}`} style={{ left: `${5 + index * 13}%` }} onClick={() => setSelectedEvent(event)} aria-label={`${event.title}: ${event.detail}`}><span /><small>{event.title.replace("Blueprint ", "")}</small></button>
          ))}
        </div>
      </section>

      <section className="blueprint-connections">
        <div className="section-heading"><div><p className="eyebrow">Connected work</p><h2>From cue to next session</h2></div></div>
        <div className="connection-flow">
          <Link href={`/training/${selected.relatedSessionIds[0]}`}><Layers3 size={18} /><span>Last session</span><strong>{selected.relatedSessionIds.length} linked</strong><ChevronRight size={17} /></Link>
          <i aria-hidden="true" />
          <Link href={`/library/${selected.resourceIds[0]}`}><FilePlay size={18} /><span>Assigned work</span><strong>{selected.resourceIds.length} resources</strong><ChevronRight size={17} /></Link>
          <i aria-hidden="true" />
          <Link href="/book"><ArrowRight size={18} /><span>Next training</span><strong>Continue focus</strong><ChevronRight size={17} /></Link>
        </div>
      </section>

      <Sheet open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(undefined)} title="Development event" compact>
        {selectedEvent ? <div className="event-detail"><span className="event-symbol"><Layers3 size={22} /></span><p className="eyebrow">{formatShortDate(selectedEvent.createdAt)}</p><h3>{selectedEvent.title}</h3><p>{selectedEvent.detail}</p>{selectedEvent.focusId ? <Link className="button secondary wide" href={`/blueprint/${selectedEvent.focusId}`}>Open related focus</Link> : null}</div> : null}
      </Sheet>
    </main>
  );
}
