"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Eye, LockKeyhole, RotateCcw, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "./toggle";
import { useAppStore } from "@/store/app-store";

export function SettingsScreen() {
  const state = useAppStore();
  const setPreference = useAppStore((item) => item.setPreference);
  const resetDemo = useAppStore((item) => item.resetDemo);
  const setTourOpen = useAppStore((item) => item.setTourOpen);
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <main className="page settings-page">
      <PageHeader back overline="PRO // Training" title="Settings" />
      <section className="demo-account-card"><div className="account-mark">DA</div><div><span>Demo account</span><strong>PRO Demo Athlete</strong><small>{state.athlete.athleteId}</small></div><i>Demo mode</i></section>
      <SettingsSection title="Notifications">
        <SettingRow title="Training reminders" detail="Session timing and preparation" control={<Toggle label="Training reminders" checked={state.preferences.trainingReminders} onChange={(value) => setPreference("trainingReminders", value)} />} />
        <SettingRow title="Blueprint updates" detail="Focus and coaching changes" control={<Toggle label="Blueprint updates" checked={state.preferences.blueprintUpdates} onChange={(value) => setPreference("blueprintUpdates", value)} />} />
        <SettingRow title="Assigned resources" detail="New reviews and preparation" control={<Toggle label="Assigned resources" checked={state.preferences.assignedResources} onChange={(value) => setPreference("assignedResources", value)} />} />
        <SettingRow title="Training openings" detail="Relevant fictional availability" control={<Toggle label="Training openings" checked={state.preferences.trainingOpenings} onChange={(value) => setPreference("trainingOpenings", value)} />} />
      </SettingsSection>
      <SettingsSection title="Experience">
        <SettingRow title="Reduce motion" detail="Limit nonessential animation" control={<Toggle label="Reduce motion" checked={state.preferences.reduceMotion} onChange={(value) => setPreference("reduceMotion", value)} />} />
        <div className="setting-select"><div><CalendarDays size={18} /><span><strong>Calendar action</strong><small>Used when adding a session</small></span></div><div className="inline-segment"><button className={state.preferences.calendarPreference === "download" ? "active" : ""} onClick={() => setPreference("calendarPreference", "download")}>.ics</button><button className={state.preferences.calendarPreference === "google" ? "active" : ""} onClick={() => setPreference("calendarPreference", "google")}>Google</button></div></div>
      </SettingsSection>
      <SettingsSection title="Demo tools">
        <Link className="settings-link" href="/demo"><SlidersHorizontal size={18} /><div><strong>Demo Control Center</strong><small>Scenarios, simulator, and presentation mode</small></div><ChevronRight size={18} /></Link>
        <button className="settings-link" onClick={() => setTourOpen(true)}><Eye size={18} /><div><strong>Restart product tour</strong><small>Three-part guided overview</small></div><ChevronRight size={18} /></button>
        <button className="settings-link destructive-setting" onClick={() => setResetOpen(true)}><RotateCcw size={18} /><div><strong>Reset demo data</strong><small>Restore the curated initial state</small></div><ChevronRight size={18} /></button>
      </SettingsSection>
      <section className="privacy-note"><LockKeyhole size={19} /><div><span>Local & fictional</span><p>This demo uses fictional athlete data and stores demo state only in this browser. It collects no customer or payment information.</p></div></section>
      <Link className="settings-footer-link" href="/demo">Open presentation controls <ArrowRight size={16} /></Link>
      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data" compact><div className="confirm-sheet"><div className="reset-icon"><RotateCcw size={22} /></div><h3>Return to the curated state?</h3><p>Bookings, progress, notifications, preferences, and scenario changes will be reset.</p><button className="button primary" onClick={() => { resetDemo(); setResetOpen(false); }}>Reset everything</button><button className="button quiet" onClick={() => setResetOpen(false)}>Keep current state</button></div></Sheet>
    </main>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="settings-section"><p className="eyebrow">{title}</p><div>{children}</div></section>;
}

function SettingRow({ title, detail, control }: { title: string; detail: string; control: React.ReactNode }) {
  return <div className="setting-row"><div><strong>{title}</strong><small>{detail}</small></div>{control}</div>;
}
