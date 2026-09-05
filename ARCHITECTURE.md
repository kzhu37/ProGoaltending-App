# Architecture

## Boundaries

- `src/domain` contains framework-independent types, Ottawa date handling, session lifecycle derivation, and deterministic recommendation rules.
- `src/data/demo-fixtures.ts` creates a complete athlete state relative to the current demo date and provides scenario presets for the virtual clock.
- `src/services` defines deterministic availability, calendar/maps actions, a payment interface with `MockPaymentGateway`, and a no-op analytics adapter.
- `src/store/app-store.ts` coordinates cross-domain actions. Zustand persistence is explicitly versioned, client-rehydrated, and reset-safe.
- `src/app` owns App Router routes, metadata, manifest, loading/error boundaries, and design tokens. Interactive product components live under `src/components`.

## State flow

```text
athlete action
  → domain/service rule
  → one coordinated store transaction
  → sessions / availability / Blueprint / resources / notifications / activity
  → versioned local persistence
```

Booking, cancellation, rescheduling, resource completion, recap publishing, and Blueprint changes update every relevant consumer from one state transition. UI components never maintain competing fixture arrays.

## Time and hydration

All contextual session states read `virtualNowISO`, not scattered calls to the system clock. Fixtures are generated at store initialization, while an app-level hydration gate keeps server and client markup deterministic and rehydrates saved browser state before rendering the athlete experience. Display formatting uses `America/Toronto`.

## Production replacement seams

Availability and payment already sit behind interfaces. The same pattern can be extended to booking, Blueprint, resource, and notification API repositories while preserving domain models and view behavior. Real payment and personal data must remain server-side and must never be persisted in this client store.

## Privacy and security

The demo has no secrets, authentication, customer database, uploaded media, financial form fields, or third-party analytics. Public facility names are used only as text search targets. Production requires authenticated and authorized API access, input validation, audit trails, protected media, consent/guardian rules, secure payment integration, and a documented retention policy.
