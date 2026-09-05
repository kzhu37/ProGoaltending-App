"use client";

import { useEffect } from "react";
import { rehydrateAppStore, useAppStore } from "@/store/app-store";

export function AppHydrator({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const reduceMotion = useAppStore((state) => state.preferences.reduceMotion);

  useEffect(() => {
    void rehydrateAppStore();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  if (!hasHydrated) {
    return (
      <div className="app-loading" role="status" aria-label="Loading athlete experience">
        <div className="loading-mark" aria-hidden="true"><span /></div>
        <p>Preparing your training</p>
      </div>
    );
  }

  return children;
}
