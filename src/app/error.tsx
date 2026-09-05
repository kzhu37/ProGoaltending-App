"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="center-state">
      <div className="state-geometry" aria-hidden="true" />
      <p className="eyebrow">Connection interrupted</p>
      <h1>We couldn&apos;t load this view.</h1>
      <p>Your demo data is still stored locally.</p>
      <button className="button primary" onClick={retry}><RotateCcw size={18} /> Try again</button>
    </main>
  );
}
