"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { durationLabel } from "@/domain/dates";
import { analytics } from "@/services/analytics";
import { useAppStore } from "@/store/app-store";

export function ResourceDetailScreen({ resourceId }: { resourceId: string }) {
  const state = useAppStore();
  const setProgress = useAppStore((item) => item.setResourceProgress);
  const markReviewed = useAppStore((item) => item.markResourceReviewed);
  const markNotificationRead = useAppStore((item) => item.markNotificationRead);
  const [playing, setPlaying] = useState(false);
  const resource = state.resources.find((item) => item.id === resourceId);
  const progress = state.progress[resourceId]?.progressSeconds ?? 0;
  const completed = state.progress[resourceId]?.completed ?? false;

  useEffect(() => {
    analytics.track("resource_opened");
    state.notifications.filter((item) => item.href === `/library/${resourceId}` && !item.read).forEach((item) => markNotificationRead(item.id));
  }, [markNotificationRead, resourceId, state.notifications]);

  useEffect(() => {
    if (!playing || !resource || completed) return;
    const timer = window.setInterval(() => {
      const current = useAppStore.getState().progress[resourceId]?.progressSeconds ?? 0;
      if (current >= resource.durationSeconds - 1) {
        markReviewed(resourceId);
        setPlaying(false);
      } else {
        setProgress(resourceId, current + 1);
      }
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [completed, markReviewed, playing, resource, resourceId, setProgress]);

  const activeChapter = useMemo(() => {
    if (!resource) return 0;
    return Math.max(0, resource.chapters.findLastIndex((chapter) => chapter.atSeconds <= progress));
  }, [progress, resource]);

  if (!resource) return <main className="page"><PageHeader back title="Library" /><div className="empty-state inline-empty"><h1>Resource not found</h1><Link className="button primary" href="/library">Back to Library</Link></div></main>;
  const focus = state.focuses.find((item) => resource.focusIds.includes(item.id));
  const percentage = (progress / resource.durationSeconds) * 100;

  const handleComplete = () => {
    markReviewed(resourceId);
    analytics.track("resource_completed");
    setPlaying(false);
  };

  return (
    <main className="page resource-detail-page">
      <PageHeader back overline="Library" title="Review" />
      <section className="review-player">
        <div className="player-status"><span>Predetermined demo review</span><small>{focus?.title}</small></div>
        <div className={`player-scene chapter-${activeChapter}`}>
          <svg viewBox="0 0 360 205" role="img" aria-label={`Abstract rink diagram for the ${resource.chapters[activeChapter]?.label ?? "review"} chapter`}>
            <defs><radialGradient id="playerGlow"><stop stopColor="#1478ff" stopOpacity=".55" /><stop offset="1" stopColor="#1478ff" stopOpacity="0" /></radialGradient></defs>
            <rect width="360" height="205" fill="#091523" />
            <path d="M46 24h268M60 34v40a120 120 0 0 0 240 0V34" stroke="#438eee" strokeOpacity=".55" strokeWidth="2" fill="#0b66ff" fillOpacity=".05" />
            <path d="M122 188 180 80l62 108" stroke="#b9d6ff" strokeDasharray="5 7" strokeOpacity=".3" />
            <circle cx={145 + activeChapter * 22} cy={126 - activeChapter * 8} r="48" fill="url(#playerGlow)" />
            <motion.path key={activeChapter} d={activeChapter % 2 ? "M75 48 C132 75 166 101 218 130" : "M284 42 C235 65 210 91 174 126"} stroke="#f5f9ff" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8 }} />
            <motion.circle key={`puck-${activeChapter}`} cx={activeChapter % 2 ? 218 : 174} cy={activeChapter % 2 ? 130 : 126} r="6" fill="#f5f9ff" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            <g transform={`translate(${138 + activeChapter * 10} ${118 - activeChapter * 3})`}><circle r="13" fill="#0b66ff" stroke="#82b9ff" strokeWidth="2" /><path d="M-6 4c3-8 9-8 12 0M-4-4h8" stroke="white" strokeWidth="2" strokeLinecap="round" /></g>
            <text x="18" y="190" fill="#8ca0b8" fontSize="9" letterSpacing="1.4">CONCEPTUAL COACHING OVERLAY · NOT ATHLETE TRACKING</text>
          </svg>
          <button className="player-main-control" onClick={() => completed ? setProgress(resourceId, 0) : setPlaying((current) => !current)} aria-label={completed ? "Replay review" : playing ? "Pause review" : "Play review"}>{completed ? <RotateCcw size={26} /> : playing ? <Pause size={27} fill="currentColor" /> : <Play size={27} fill="currentColor" />}</button>
          <div className="chapter-overlay"><span>0{activeChapter + 1}</span><div><small>Current chapter</small><strong>{resource.chapters[activeChapter]?.label}</strong></div></div>
        </div>
        <div className="player-controls">
          <div className="player-time"><span>{durationLabel(progress)}</span><span>{durationLabel(resource.durationSeconds)}</span></div>
          <label><span className="sr-only">Review progress</span><input type="range" min="0" max={resource.durationSeconds} value={progress} onChange={(event) => setProgress(resourceId, Number(event.target.value))} style={{ "--progress": `${percentage}%` } as React.CSSProperties} /></label>
          <div className="player-buttons"><button onClick={() => setProgress(resourceId, Math.max(0, progress - 10))} aria-label="Go back 10 seconds"><RotateCcw size={17} />10</button><button className="central" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button><button onClick={() => setProgress(resourceId, Math.min(resource.durationSeconds, progress + 10))} aria-label="Skip forward 10 seconds">10<SkipForward size={17} /></button></div>
        </div>
      </section>

      <section className="resource-title"><span>{resource.category} · {resource.type}</span><h1>{resource.title}</h1><p>{resource.description}</p></section>
      <section className="assigned-reason"><span>Why this was assigned</span><p>{resource.assignedReason}</p>{focus ? <Link href={`/blueprint/${focus.id}`}>View {focus.title} <ArrowRight size={15} /></Link> : null}</section>
      <section className="chapter-list"><div className="section-heading"><div><p className="eyebrow">Review timeline</p><h2>Coaching chapters</h2></div></div>{resource.chapters.map((chapter, index) => <button key={chapter.atSeconds} className={activeChapter === index ? "active" : ""} onClick={() => setProgress(resourceId, chapter.atSeconds)}><span>{durationLabel(chapter.atSeconds)}</span><i /><strong>{chapter.label}</strong><Play size={15} /></button>)}</section>
      <button className={`button wide ${completed ? "success" : "primary"}`} onClick={handleComplete}>{completed ? <><Check size={18} /> Reviewed</> : <>Mark reviewed <Check size={18} /></>}</button>
      <p className="demo-disclosure">This abstract player uses predetermined demo annotations. It does not analyze athlete video or use AI.</p>
    </main>
  );
}
