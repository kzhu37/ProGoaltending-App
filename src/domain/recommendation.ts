import type { BlueprintFocus, SessionType } from "./types";

const focusPreference: Record<string, string[]> = {
  "rebound-control": ["small-group", "private"],
  tracking: ["small-group", "video-review"],
  "post-integration": ["private", "development"],
  movement: ["development", "private"],
};

export function recommendSessionType(
  focuses: BlueprintFocus[],
  sessionTypes: SessionType[],
): SessionType {
  const rankedFocuses = focuses
    .filter((focus) => focus.status !== "completed")
    .toSorted((a, b) => a.priority - b.priority);
  const votes = new Map<string, number>();
  rankedFocuses.forEach((focus, focusIndex) => {
    (focusPreference[focus.id] ?? ["development"]).forEach((typeId, typeIndex) => {
      votes.set(typeId, (votes.get(typeId) ?? 0) + 10 - focusIndex * 2 - typeIndex);
    });
  });
  const bestId = [...votes.entries()].toSorted((a, b) => b[1] - a[1])[0]?.[0];
  return sessionTypes.find((type) => type.id === bestId) ?? sessionTypes[0];
}
