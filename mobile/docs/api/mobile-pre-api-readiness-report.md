# Wasel Mobile Pre-API Readiness Report

Date: 2026-07-05

## Scope

This report covers the current mock-first Wasel mobile app inside `mobile/`.
It documents what is ready before real API work starts, which areas are still mock-only, and the safest order for backend integration.

No backend, web, admin, database, real API, real GPS, real maps, real payments, or real realtime connection is connected at this stage.

## Current Mobile Readiness

The app is ready for API planning and staged integration because the main mock experience, state layer, API contracts, and verification commands are in place.

Current covered app surfaces:

- Entry and welcome flow: `mobile/src/screens/app-entry-screen.tsx`, `mobile/src/screens/welcome-screen.tsx`
- Customer auth flow: `mobile/src/screens/customer-auth-screen.tsx`
- Customer app flow: `mobile/src/screens/customer-home-screen.tsx`
- Captain auth flow: `mobile/src/screens/captain-auth-screen.tsx`
- Captain home flow: `mobile/src/screens/captain-home-screen.tsx`
- Captain active trip flow: `mobile/src/screens/captain-active-trip-screen.tsx`

Current mock/state sources:

- Customer data and customer UI content: `mobile/src/mock/customer-home.ts`
- Captain profile and available requests: `mobile/src/mock/captain-home.ts`
- Ride request lifecycle: `mobile/src/state/mock-ride-requests.ts`
- Trip visual state: `mobile/src/state/mock-trip-flow.ts`
- Mock session flow: `mobile/src/state/mock-app-session.ts`
- Mock realtime feed: `mobile/src/realtime/mock-realtime.ts`

## API Contract Assets

Contract documentation:

- `mobile/docs/api/mobile-api-contract.md`

Contract schemas:

- `mobile/src/api/contracts/common.ts`
- `mobile/src/api/contracts/customer.ts`
- `mobile/src/api/contracts/rides.ts`
- `mobile/src/api/contracts/realtime.ts`

Mock API adapter:

- `mobile/src/api/client/mock-api-adapter.ts`

Contract tests:

- `mobile/src/api/contracts/__tests__/common.test.ts`
- `mobile/src/api/contracts/__tests__/customer.test.ts`
- `mobile/src/api/contracts/__tests__/rides.test.ts`
- `mobile/src/api/contracts/__tests__/realtime.test.ts`
- `mobile/src/api/client/__tests__/mock-api-adapter.test.ts`

## API Conversion Points

| Area | Current source | Future integration point |
| --- | --- | --- |
| Auth/session | `mobile/src/state/mock-app-session.ts` | OTP request, OTP verify, token refresh, logout |
| Customer profile | `mobile/src/mock/customer-home.ts` | `GET /customers/me` |
| Customer payment summary | `mobile/src/mock/customer-home.ts` | `GET /customers/me/payment-summary` |
| Saved places | `mobile/src/mock/customer-home.ts` | `GET /customers/me/saved-places` |
| Customer support actions | `mobile/src/mock/customer-home.ts` | `GET /customers/me/support-options` |
| Captain profile | `mobile/src/mock/captain-home.ts` | `GET /captains/me` |
| Captain availability | `mobile/src/mock/captain-home.ts` and UI state | `PATCH /captains/me/availability` |
| Available captain requests | `mobile/src/mock/captain-home.ts` | `GET /captains/me/requests` |
| Ride request creation | `mobile/src/state/mock-ride-requests.ts` | `POST /rides` |
| Ride status updates | `mobile/src/state/mock-trip-flow.ts` | `PATCH /captains/me/rides/:rideId/status` |
| Realtime trip feed | `mobile/src/realtime/mock-realtime.ts` | Realtime events listed in `mobile/docs/api/mobile-api-contract.md` |

## Integration Rules

Use these rules when real API work starts:

- Screens should not call `fetch`, `axios`, sockets, or raw storage directly.
- API client code should live under `mobile/src/api/client/`.
- Shared response and data validation should use the schemas in `mobile/src/api/contracts/`.
- Query hooks should live under `mobile/src/api/hooks/` when TanStack Query is introduced into screens.
- Mock data should remain available as fallback until backend responses match the contracts.
- Real API base URL, auth token storage, maps, GPS, payment provider, and notification behavior should be introduced in separate phases.

## Backend Requirements For First Integration

The backend should provide these API groups before mobile switches from mock to live data:

- Auth:
  - `POST /auth/customer/otp/request`
  - `POST /auth/customer/otp/verify`
  - `POST /auth/captain/otp/request`
  - `POST /auth/captain/otp/verify`
- Customer:
  - `GET /customers/me`
  - `GET /customers/me/payment-summary`
  - `GET /customers/me/saved-places`
  - `GET /customers/me/support-options`
- Rides:
  - `POST /rides`
  - `GET /rides/current`
  - `POST /rides/:rideId/cancel`
  - `POST /rides/:rideId/feedback`
- Captain:
  - `GET /captains/me`
  - `PATCH /captains/me/availability`
  - `GET /captains/me/requests`
  - `POST /captains/me/requests/:requestId/accept`
  - `POST /captains/me/requests/:requestId/decline`
  - `PATCH /captains/me/rides/:rideId/status`
- Realtime:
  - `customer-request-created`
  - `captain-request-accepted`
  - `captain-request-declined`
  - `captain-arrived`
  - `trip-started`
  - `trip-completed`
  - `customer-feedback-submitted`

## Mock-Only Areas

These areas are intentionally still mock-only:

- OTP authentication and session persistence
- Real customer and captain accounts
- Real ride request dispatch
- Real captain location and route updates
- Real maps and GPS
- Real socket connection
- Real payment card entry, card tokenization, and payment capture
- Push notifications
- Production monitoring

## Risks Before API Work

- Backend payloads may not match the current mobile Zod schemas.
- Realtime event ordering and delivery guarantees need backend agreement.
- Auth token storage strategy is not implemented in mobile yet.
- Real maps and GPS may require package and Expo Go compatibility decisions.
- Real card payments require a separate security and provider decision.
- Screens are still mock-first, so each integration phase should preserve the current visual polish while swapping data sources gradually.

## Recommended API Integration Order

1. Auth/session API
2. Customer profile, payment summary, saved places, and support options
3. Customer ride creation and current ride loading
4. Captain profile, availability, request list, accept, and decline
5. Ride status updates and active-trip synchronization
6. Realtime event connection
7. Payment provider decision and payment integration
8. Android physical device QA after live integration

## Verification Baseline

Before starting API integration, keep this baseline green:

```bash
npm.cmd --prefix mobile run lint
npm.cmd --prefix mobile run check
npm.cmd --prefix mobile test
rg -n "fetch\\(|axios|baseURL|WebSocket|socket.io" mobile/src
git status --short --untracked-files=all
git diff --stat
```

Expected baseline:

- Lint passes.
- TypeScript check passes.
- Jest passes.
- Network search has no matches before the approved API integration phase.
- Git status only contains intended mobile changes.

## Decision

Wasel mobile is ready to enter staged API integration after the user approves the first API phase and confirms the backend/auth strategy.
