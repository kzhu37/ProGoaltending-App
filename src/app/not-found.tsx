import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="center-state">
      <div className="state-geometry" aria-hidden="true" />
      <p className="eyebrow">Not found</p>
      <h1>That training view isn&apos;t here.</h1>
      <p>Return to your current development plan.</p>
      <Link className="button primary" href="/"><ArrowLeft size={18} /> Back home</Link>
    </main>
  );
}
