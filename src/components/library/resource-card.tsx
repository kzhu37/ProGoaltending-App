import Link from "next/link";
import { Check, Play } from "lucide-react";
import { durationLabel } from "@/domain/dates";
import type { ResourceProgress, TrainingResource } from "@/domain/types";

export function ResourceCard({ resource, progress, compact = false }: { resource: TrainingResource; progress?: ResourceProgress; compact?: boolean }) {
  const percent = progress ? Math.round((progress.progressSeconds / resource.durationSeconds) * 100) : 0;
  return (
    <Link href={`/library/${resource.id}`} className={`resource-card card-interactive ${compact ? "compact" : ""}`}>
      <div className={`resource-art resource-art-${resource.focusIds[0] ?? "default"}`}>
        <div className="resource-rink" aria-hidden="true"><i /><span /></div>
        <span className="resource-play">{progress?.completed ? <Check size={18} /> : <Play size={17} fill="currentColor" />}</span>
        <small>{durationLabel(resource.durationSeconds)}</small>
      </div>
      <div className="resource-copy"><span>{resource.category}</span><h3>{resource.title}</h3><p>{progress?.completed ? "Reviewed" : progress?.progressSeconds ? `${durationLabel(resource.durationSeconds - progress.progressSeconds)} remaining` : resource.type}</p></div>
      {progress && !progress.completed ? <div className="resource-progress"><span style={{ width: `${percent}%` }} /></div> : null}
    </Link>
  );
}
