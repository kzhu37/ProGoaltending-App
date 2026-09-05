export type DemoAnalyticsEvent =
  | "app_opened"
  | "session_viewed"
  | "resource_opened"
  | "resource_completed"
  | "booking_started"
  | "booking_completed"
  | "blueprint_viewed"
  | "recap_viewed";

export interface AnalyticsAdapter {
  track(event: DemoAnalyticsEvent, properties?: Record<string, string | number | boolean>): void;
}

class NoOpAnalyticsAdapter implements AnalyticsAdapter {
  track(): void {
    // Deliberately empty: the demo ships without third-party tracking.
  }
}

export const analytics: AnalyticsAdapter = new NoOpAnalyticsAdapter();
