"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const steps = [
  { number: "01", title: "Your training", copy: "See what is next, how to prepare, and every session that shaped the current plan." },
  { number: "02", title: "Your Blueprint", copy: "PRO remembers the technical focus and carries each coaching cue into the next session." },
  { number: "03", title: "Your next step", copy: "Assigned review and recommended training keep development moving between sessions." },
];

export function ProductTour() {
  const open = useAppStore((state) => state.tourOpen);
  const setOpen = useAppStore((state) => state.setTourOpen);
  const [index, setIndex] = useState(0);
  const close = () => { setOpen(false); setIndex(0); };
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="tour-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Product tour">
          <button className="tour-close icon-button" onClick={close} aria-label="Close tour"><X size={20} /></button>
          <motion.div className="tour-card" key={index} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <span className="tour-number">{steps[index].number}</span>
            <p className="eyebrow">PRO // TRAINING</p>
            <h2>{steps[index].title}</h2>
            <p>{steps[index].copy}</p>
            <div className="tour-progress">{steps.map((_, stepIndex) => <span key={stepIndex} className={stepIndex <= index ? "active" : ""} />)}</div>
            <button className="button primary" onClick={() => index === steps.length - 1 ? close() : setIndex((current) => current + 1)}>
              {index === steps.length - 1 ? "Enter experience" : "Continue"}<ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
