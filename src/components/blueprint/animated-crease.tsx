"use client";

import { motion, useReducedMotion } from "motion/react";
import { useAppStore } from "@/store/app-store";

const paths: Record<string, { puck: string; movement: string; zone: { cx: number; cy: number; rx: number; ry: number } }> = {
  "rebound-control": { puck: "M120 12 C119 42 112 69 106 94 C100 117 133 125 160 102", movement: "M106 94 C121 101 142 108 160 102", zone: { cx: 108, cy: 98, rx: 32, ry: 22 } },
  tracking: { puck: "M36 32 C75 44 102 59 124 86 C138 103 151 110 184 116", movement: "M102 119 C108 107 115 96 124 86", zone: { cx: 124, cy: 86, rx: 25, ry: 25 } },
  "post-integration": { puck: "M195 47 C177 58 169 78 171 101", movement: "M121 115 C142 118 160 112 171 101", zone: { cx: 178, cy: 103, rx: 20, ry: 35 } },
  movement: { puck: "M52 50 C78 68 99 75 128 66", movement: "M78 116 C104 93 133 92 158 117", zone: { cx: 119, cy: 109, rx: 58, ry: 19 } },
};

export function AnimatedCrease({ focusId, label }: { focusId: string; label: string }) {
  const visual = paths[focusId] ?? paths["rebound-control"];
  const systemReduced = useReducedMotion();
  const preferenceReduced = useAppStore((state) => state.preferences.reduceMotion);
  const reduced = systemReduced || preferenceReduced;
  return (
    <div className="crease-visual" role="img" aria-label={`Conceptual overhead crease visualization for ${label}. This is not athlete tracking data.`}>
      <div className="crease-caption"><span>Concept view</span><i />{label}</div>
      <svg viewBox="0 0 240 170" fill="none">
        <defs>
          <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#102039" /><stop offset="1" stopColor="#081321" /></linearGradient>
          <radialGradient id="focusZone"><stop stopColor="#2080ff" stopOpacity=".4" /><stop offset="1" stopColor="#2080ff" stopOpacity="0" /></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect width="240" height="170" rx="20" fill="url(#ice)" />
        <path d="M24 28h192" stroke="#fff" strokeOpacity=".06" />
        <path d="M24 142h192" stroke="#fff" strokeOpacity=".06" />
        <path d="M59 22v18M181 22v18M68 22h104" stroke="#f5f9ff" strokeOpacity=".42" strokeWidth="2" />
        <path d="M68 22v16M172 22v16" stroke="#ff4d5d" strokeOpacity=".74" strokeWidth="3" />
        <motion.path d="M70 38v31a50 50 0 0 0 100 0V38" stroke="#4d9aff" strokeWidth="2" strokeOpacity=".75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, ease: "easeOut" }} />
        <path d="M74 38v29a46 46 0 0 0 92 0V38" fill="#0b66ff" fillOpacity=".08" />
        <motion.ellipse key={`${focusId}-zone`} cx={visual.zone.cx} cy={visual.zone.cy} rx={visual.zone.rx} ry={visual.zone.ry} fill="url(#focusZone)" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45 }} />
        <motion.path key={`${focusId}-puck-path`} d={visual.puck} stroke="#d6e7ff" strokeWidth="1.7" strokeDasharray="4 5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .7 }} transition={{ duration: .8, delay: .18 }} />
        <motion.path key={`${focusId}-move-path`} d={visual.movement} stroke="#2e8cff" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .65, delay: .35 }} />
        {reduced ? <circle cx={visual.zone.cx} cy={visual.zone.cy - 24} r="4" fill="#f5f9ff" /> : <motion.circle key={`${focusId}-puck`} r="4" fill="#f5f9ff" filter="url(#glow)"><animateMotion dur="2.4s" repeatCount="indefinite" path={visual.puck} /></motion.circle>}
        <g transform={`translate(${visual.zone.cx - 10} ${visual.zone.cy - 10})`}>
          <circle cx="10" cy="10" r="10" fill="#0b66ff" stroke="#8dc1ff" strokeWidth="1.5" />
          <path d="M5 12c2-5 8-5 10 0M7 8h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <path d="M20 152h28M192 152h28" stroke="#6daeff" strokeWidth="2" strokeOpacity=".5" />
        <text x="120" y="156" textAnchor="middle" fill="#8ca0b8" fontSize="7" letterSpacing="1.6">CONCEPTUAL FOCUS GEOMETRY</text>
      </svg>
    </div>
  );
}
