"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, ClipboardCheck, Eye, FilePlus2, Focus, Home, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "@/components/settings/toggle";
import { formatDate, formatTime } from "@/domain/dates";
import type { DemoScenario } from "@/domain/types";
import { useAppStore } from "@/store/app-store";

const scenarios: { id: DemoScenario; label: string; detail: string }[] = [
  { id: "standard", label: "Standard", detail: "Next session in a few days" },
  { id: "today", label: "Training Today", detail: "Morning training-day state" },
  { id: "soon", label: "Training Soon", detail: "Inside the 45-minute window" },
  { id: "complete", label: "Session Complete", detail: "Training just ended" },
  { id: "recap_pending", label: "Recap Pending", detail: "Waiting for coach feedback" },
  { id: "recap_ready", label: "Recap Ready", detail: "Feedback ready to apply" },
  { id: "none", label: "No Upcoming", detail: "Intentional empty Home state" },
  { id: "multiple", label: "Multiple Upcoming", detail: "Three future sessions" },
];

export function DemoControlScreen() {
  const state = useAppStore();
  const setScenario = useAppStore((item) => item.setScenario);
  const resetDemo = useAppStore((item) => item.resetDemo);
  const publishRecap = useAppStore((item) => item.publishRecap);
  const assignResource = useAppStore((item) => item.assignResource);
  const changePrimary = useAppStore((item) => item.changePrimaryFocus);
  const addCoachCue = useAppStore((item) => item.addCoachCue);
  const setPresentation = useAppStore((item) => item.setPresentationMode);
  const setTourOpen = useAppStore((item) => item.setTourOpen);
  const [resetOpen, setResetOpen] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  const confirmAction = (label: string, action: () => void) => {
    action();
    setFeedback(label);
    window.setTimeout(() => setFeedback(undefined), 2_200);
  };

  return (
    <main className="page demo-page">
      <PageHeader back overline="Demo tools" title="Control Center" />
      <section className="demo-time-card"><div className="clock-rings" aria-hidden="true"><i /><i /></div><p className="eyebrow">Virtual demo clock</p><h2>{formatTime(state.virtualNowISO)}</h2><p>{formatDate(state.virtualNowISO, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p><span>Ottawa time · {state.scenario.replace("_", " ")}</span></section>
      <section className="presentation-panel"><div><span className="presentation-icon"><Sparkles size={19} /></span><div><strong>Presentation Mode</strong><p>Keeps the demo in a reliable, content-rich state.</p></div></div><Toggle label="Presentation mode" checked={state.presentationMode} onChange={setPresentation} /></section>
      <section className="demo-section"><div className="section-heading"><div><p className="eyebrow">Scenario presets</p><h2>Change the athlete context</h2></div><span>Resets scenario data</span></div><div className="scenario-grid">{scenarios.map((scenario, index) => <button key={scenario.id} className={state.scenario === scenario.id ? "active" : ""} onClick={() => setScenario(scenario.id)}><span>0{index + 1}</span><div><strong>{scenario.label}</strong><small>{scenario.detail}</small></div>{state.scenario === scenario.id ? <motion.i layoutId="scenario-check"><Check size={15} /></motion.i> : null}</button>)}</div></section>
      <section className="demo-section coach-simulator"><div className="section-heading"><div><p className="eyebrow">Coach event simulator</p><h2>Trigger athlete updates</h2></div><span>Coach 01</span></div><p className="simulator-note">These actions demonstrate how a future coaching system could update the athlete product.</p><div className="simulator-actions"><button onClick={() => confirmAction("Recap published", () => { publishRecap(); })}><ClipboardCheck size={19} /><div><strong>Publish recap</strong><small>Creates feedback and notification</small></div><ArrowRight size={17} /></button><button onClick={() => confirmAction("Resource assigned", assignResource)}><FilePlus2 size={19} /><div><strong>Assign resource</strong><small>Adds review to Home and Library</small></div><ArrowRight size={17} /></button><button onClick={() => confirmAction("Primary focus changed", () => changePrimary("post-integration"))}><Focus size={19} /><div><strong>Change primary focus</strong><small>Promotes Post Integration</small></div><ArrowRight size={17} /></button><button onClick={() => confirmAction("Coach cue added", addCoachCue)}><PlayCircle size={19} /><div><strong>Add coach cue</strong><small>Updates latest recap</small></div><ArrowRight size={17} /></button></div></section>
      <section className="demo-section quick-demo"><div className="section-heading"><div><p className="eyebrow">Presentation shortcuts</p><h2>Jump to a showcase</h2></div></div><div><Link href="/"><Home size={18} /><span>Show Home</span><ArrowRight size={17} /></Link><Link href="/book"><PlayCircle size={18} /><span>Show booking</span><ArrowRight size={17} /></Link><Link href="/blueprint"><Focus size={18} /><span>Show Blueprint</span><ArrowRight size={17} /></Link><button onClick={() => setTourOpen(true)}><Eye size={18} /><span>Start product tour</span><ArrowRight size={17} /></button></div></section>
      <button className="reset-demo-button" onClick={() => setResetOpen(true)}><RotateCcw size={18} /><div><strong>Reset entire demo</strong><span>Restore curated fixtures and preferences</span></div><ArrowRight size={17} /></button>
      <p className="demo-disclosure">All athletes, coaches, sessions, availability, feedback, and pricing in this product are fictional demo data.</p>
      {feedback ? <motion.div className="demo-toast" role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Check size={17} />{feedback}</motion.div> : null}
      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo" compact><div className="confirm-sheet"><div className="reset-icon"><RotateCcw size={22} /></div><h3>Reset every demo action?</h3><p>This returns booking, progress, scenarios, and notifications to the intended presentation state.</p><button className="button primary" onClick={() => { resetDemo(); setResetOpen(false); }}>Reset demo</button><button className="button quiet" onClick={() => setResetOpen(false)}>Cancel</button></div></Sheet>
    </main>
  );
}
