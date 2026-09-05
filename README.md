# PRO Goaltending - Athlete Product Demo

A mobile-first, fictional product concept for existing and repeat PRO Goaltending athletes. It demonstrates how training, coaching feedback, assigned review, booking, and the athlete's development Blueprint can remain connected between sessions.

This is not a recreation of the public marketing website and does not represent PRO's real schedule, pricing, customers, staff, or current availability.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate and build

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Deploy to Vercel

Import the repository into Vercel or run `vercel` from the project directory. The framework is detected as Next.js; no environment variables, database, or external services are required for this demo.

## Demo behavior

- The anonymous account is `ath_demo_001`; all athlete, coach, session, feedback, availability, and pricing data is fictional.
- Actions persist in the browser under the versioned `pro-demo-state-v1` local-storage key.
- The center navigation action opens the complete booking flow. Checkout uses a separated `MockPaymentGateway`; it accepts no card data and processes no payment.
- Resource playback is an abstract, predetermined coaching visualization - not uploaded video, AI analysis, athlete tracking, or biomechanics.
- Settings → Demo Control Center exposes lifecycle scenarios, a virtual Ottawa clock, fictional coach events, Presentation Mode, the product tour, and Reset Demo.
- Reset Demo restores the complete curated fixture state, including preferences and interrupted actions.

## Product routes

- `/` - context-aware Home
- `/training` and `/training/[sessionId]` - upcoming timeline, history, session actions, and recaps
- `/blueprint` and `/blueprint/[focusId]` - interactive crease, development focuses, and history
- `/library` and `/library/[resourceId]` - assigned work and persistent review progress
- `/book` - recommendation through confirmation
- `/notifications`, `/settings`, `/demo` - updates, preferences, and presentation controls

## Future production path

The domain types, recommendation/status rules, and service contracts are independent from page components. A production evolution would replace:

```text
local demo repository  → authenticated backend API
anonymous demo athlete → authorized athlete/guardian account
MockPaymentGateway     → secure server-side payment adapter
browser-only app       → shared backend plus web and React Native clients
```

Production work would also require authentication, authorization, age/guardian considerations, server-side validation, audit logging, payment-provider compliance, privacy/data-retention policies, and owned media delivery. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the current boundaries.
