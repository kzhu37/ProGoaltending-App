"use client";

import type { Facility, Region } from "@/domain/types";

export function OttawaMap({ facilities, selectedId, region, onSelect }: { facilities: Facility[]; selectedId?: string; region: Region | "all"; onSelect: (facility: Facility) => void }) {
  return (
    <div className="ottawa-map" role="group" aria-label="Schematic Ottawa facility map">
      <svg viewBox="0 0 360 236" fill="none" aria-hidden="true">
        <path d="M15 93C52 73 72 42 119 47c41 4 67-18 109-25 46-8 78 14 112 38l-16 144c-43 7-79 17-118 8-58-13-97 13-148-4-22-8-37-26-52-44L15 93Z" fill="#0d1c2d" stroke="#243b56" />
        <path d="M-4 86c54 10 74 28 118 22 53-8 69-33 121-27 52 7 82 39 137 32" stroke="#1665b5" strokeWidth="11" strokeOpacity=".22" />
        <path d="M-4 86c54 10 74 28 118 22 53-8 69-33 121-27 52 7 82 39 137 32" stroke="#3c8fe1" strokeWidth="1.5" strokeOpacity=".5" />
        <path d="M41 167 303 53M92 30l159 188M26 136l298 39" stroke="#8294a8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity=".18" />
        <text x="20" y="218" fill="#6f849c" fontSize="8" letterSpacing="1.5">SCHEMATIC OTTAWA AREA · DEMO LOCATIONS</text>
      </svg>
      {facilities.map((facility, index) => {
        const dimmed = region !== "all" && facility.region !== region;
        return (
          <button
            key={facility.id}
            className={`map-pin ${selectedId === facility.id ? "active" : ""} ${dimmed ? "dimmed" : ""} ${index === 0 ? "pulse" : ""}`}
            style={{ left: `${facility.mapPosition.x}%`, top: `${facility.mapPosition.y}%` }}
            onClick={() => onSelect(facility)}
            aria-label={`${facility.name}, ${facility.areaLabel}`}
            disabled={dimmed}
          >
            <i>{index + 1}</i><span>{facility.name.replace(" Recreation Complex", "").replace(" Recreation Centre", "")}</span>
          </button>
        );
      })}
    </div>
  );
}
