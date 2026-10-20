# PRO Goaltending | Architecture

This document describes the currently implemented fictional-data athlete demo. It is not a production system design or an assertion about PRO Goaltending's internal infrastructure.

## Runtime boundaries

| Layer | Responsibility |
| --- | --- |
| [`src/domain`](src/domain) | Framework-independent product types, session phase derivation, focus recommendation, Ottawa date/time rules |
| [`src/data/demo-fixtures.ts`](src/data/demo-fixtures.ts) | Coherent synthetic athlete records, demo scenarios, recap payloads, and calendar-day rebasing |
| [`src/services`](src/services) | Deterministic fictional availability, mock gateway, calendar/maps actions, no-op analytics |
| [`src/store/app-store.ts`](src/store/app-store.ts) | Action coordination, a single source of truth, persistence, reset, presentation state |
| [`src/components`](src/components) | Product screens consuming shared state; sheet, booking, recap and interaction controls |
| [`src/app`](src/app) | Next.js App Router screens, metadata, manifest, design system, hydration and error boundaries |

The app deliberately keeps presentation components separate from state and domain rules. It does not use a network API or a customer database.

## Connected lifecycle

1. A focus-ranked recommendation proposes a training format. The athlete can choose another.
2. `DemoAvailabilityService` generates repeatable time and coach options from a facility, training type, Ottawa date, and booked demo sessions.
3. `completeBooking` checks the currently available slot and coach, then adds a scheduled session, notification, booking-draft confirmation, and development event in a coordinated store update.
4. `cancelSession` marks a scheduled session cancelled and releases its fictional capacity. `rescheduleSession` revalidates the destination, preserves the session ID, and moves occupancy between slots.
5. `publishRecap` associates predetermined fictional coaching feedback with a session, updating recap status, notifications, and the activity feed.
6. `applyBlueprintUpdate` applies proposed focus changes and flags the recap as applied. Repeating the action cannot apply it twice.
7. `markResourceReviewed` records review completion and only creates the completion activity the first time.

```text
Athlete action
    |
Domain rule / deterministic availability
    |
One Zustand store action
    |
    +-- Sessions and fictional slot occupancy
    +-- Recaps and Blueprint focuses
    +-- Resource progress
    +-- Notifications and development activity
    |
Versioned browser-local persistence
    |
Home / Training / Blueprint / Library / Notifications
```

"One coordinated update" refers to one local Zustand state mutation per action. It is not a database transaction across users or devices. Only an authenticated authoritative server could guarantee real multi-client booking capacity.

## Time and consistent demo state

All session phase context uses `virtualNowISO`. `deriveSessionPhase` is a pure function over a session and a timestamp, including a 45-minute "soon" interval.

Fixtures use the `America/Toronto` zone for Ottawa session dates. The date helpers distinguish **calendar-day shifts** from **elapsed hours**. For example, moving a 9:30 AM training session across daylight saving time must keep 9:30 AM local instead of adding a fixed multiple of 86,400,000 milliseconds. Scenario data is rebased to the viewer's current Ottawa calendar date; stable demo clock presets can place the main session in different lifecycle phases without changing the browser's actual clock.

Past and future events are synthetic and intentionally relative to the fixture reference date. This does not imply historical records belong to a real athlete.

## Persistence and hydration

Zustand persists a limited `DemoState` snapshot under `pro-demo-state-v1` at schema version 1. The actions and transient `hasHydrated` flag are not persisted. `skipHydration` and the `AppHydrator` gate prevent a browser-local snapshot from producing conflicting initial server and client content. On rehydration the app rebases the demo clock and synthetic dated records to the current reference day.

Reset restores a full curated state, including preferences and a cleared booking draft. Switching scenarios restores scenario fixtures while preserving preferences. Presentation Mode can intentionally restore a fresh showcase state.

Browser storage is not protected user-data infrastructure. A future schema migration would need explicit validation and compatibility logic rather than trusting arbitrary local JSON.

## Service boundaries

- **Availability:** `AvailabilityService` returns dates, times, and coach choices. The demo implementation is stable and deterministic and adjusts capacity for non-cancelled sessions. Derived date counts reflect the returned slot set for a selected facility and training format.
- **Payment:** `PaymentGateway` is an interface; `MockPaymentGateway` creates a fictional success response after a short delay. No financial fields or real transaction calls exist.
- **Calendar and location:** ICS download and Google Calendar URL creation include an explicit fictional-demo notice. Facility links use a maps search, not a PRO programming claim.
- **Analytics:** `AnalyticsAdapter` accepts named product events but the shipped adapter does nothing. No telemetry is sent.

These seams allow future implementations to replace mock services, but interfaces by themselves do not amount to production infrastructure.

## Security, privacy and access

The demo is an anonymous, single-athlete fixture with no real customer database, passwords, private media, coach portal, payment credentials, or third-party analytics. [`src/data/demo-fixtures.ts`](src/data/demo-fixtures.ts) defines fictional athlete, session, coach, pricing, and feedback examples rather than anonymized exports of internal records. Coaches use numbered placeholders instead of real names. [`src/components/library/resource-detail-screen.tsx`](src/components/library/resource-detail-screen.tsx) renders an animated conceptual rink diagram with predetermined chapters and progress, not real coaching footage; proprietary training videos are not included. The PRO brand and named facilities appear in a hypothetical experience, and displayed availability and booking records are fictional.

A real deployment would require identity, guardian/age-aware access where relevant, authorization by account and role, server-side booking concurrency control, protected media, signed API requests and input validation, payment-provider integration, audits, operational monitoring, consent, retention rules, deletion/export paths, and governance of the organization's actual data.

The present prototype does not claim any of these production safeguards.
