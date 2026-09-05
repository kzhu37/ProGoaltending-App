const OTTAWA_TIME_ZONE = "America/Toronto";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function partsInOttawa(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: OTTAWA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return parts as DateParts;
}

function timeZoneOffsetMs(date: Date): number {
  const parts = partsInOttawa(date);
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUTC - date.getTime();
}

function ottawaWallTimeToDate(parts: DateParts): Date {
  const wallTime = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  let result = new Date(wallTime - timeZoneOffsetMs(new Date(wallTime)));
  result = new Date(wallTime - timeZoneOffsetMs(result));
  return result;
}

export function ottawaDateAt(base: Date, dayOffset: number, hour: number, minute = 0): Date {
  const parts = partsInOttawa(base);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset));
  return ottawaWallTimeToDate({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour,
    minute,
    second: 0,
  });
}

export function ottawaDateFromKey(key: string, hour: number, minute = 0): Date {
  const [year, month, day] = key.split("-").map(Number);
  return ottawaWallTimeToDate({ year, month, day, hour, minute, second: 0 });
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function dateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OTTAWA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function calendarDayDifference(fromISO: string, toISO: string): number {
  const from = new Date(`${dateKey(fromISO)}T00:00:00.000Z`).getTime();
  const to = new Date(`${dateKey(toISO)}T00:00:00.000Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OTTAWA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OTTAWA_TIME_ZONE,
    ...options,
  }).format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return formatDate(iso, { month: "short", day: "numeric" });
}

export function formatRelativeDay(iso: string, nowISO: string): string {
  const targetKey = dateKey(iso);
  const todayKey = dateKey(nowISO);
  const tomorrowKey = dateKey(new Date(new Date(nowISO).getTime() + 86_400_000).toISOString());
  if (targetKey === todayKey) return "Today";
  if (targetKey === tomorrowKey) return "Tomorrow";
  return formatDate(iso, { weekday: "long" });
}

export function durationLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function humanTimeAgo(iso: string, nowISO: string): string {
  const differenceMinutes = Math.max(
    0,
    Math.round((new Date(nowISO).getTime() - new Date(iso).getTime()) / 60_000),
  );
  if (differenceMinutes < 60) return `${Math.max(1, differenceMinutes)}m`;
  if (differenceMinutes < 1_440) return `${Math.round(differenceMinutes / 60)}h`;
  return `${Math.round(differenceMinutes / 1_440)}d`;
}

export { OTTAWA_TIME_ZONE };
