import { formatDate, formatTime } from "@/domain/dates";
import type { Facility, SessionType, TrainingSession } from "@/domain/types";

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function downloadCalendarEvent(
  session: TrainingSession,
  type: SessionType,
  facility: Facility,
): void {
  const uid = `${session.id}@pro-training-demo.local`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PRO Goaltending Demo//Training//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(session.startAt)}`,
    `DTEND:${toICSDate(session.endAt)}`,
    `SUMMARY:${type.title} — PRO Goaltending Demo`,
    `LOCATION:${facility.name}`,
    "DESCRIPTION:Fictional PRO Goaltending product demo session. No real booking is represented.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `pro-training-${formatDate(session.startAt, { month: "short", day: "numeric" }).replace(/\s/g, "-").toLowerCase()}-${formatTime(session.startAt).replace(/[:\s]/g, "").toLowerCase()}.ics`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function mapsHref(facility: Facility): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name}, Ottawa, Ontario`)}`;
}

export function addCalendarEvent(
  session: TrainingSession,
  type: SessionType,
  facility: Facility,
  preference: "download" | "google",
): void {
  if (preference === "download") {
    downloadCalendarEvent(session, type, facility);
    return;
  }
  const dates = `${toICSDate(session.startAt)}/${toICSDate(session.endAt)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${type.title} — PRO Goaltending Demo`,
    dates,
    location: `${facility.name}, Ottawa, Ontario`,
    details: "Fictional PRO Goaltending product demo session. No real booking is represented.",
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
}
