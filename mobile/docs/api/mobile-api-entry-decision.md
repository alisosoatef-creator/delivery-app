# Wasel Mobile API Entry Decision

Date: 2026-07-05

## Decision

Wasel mobile is ready to enter staged API integration, starting with Auth/session only.

Do not connect rides, realtime, maps, GPS, payments, or notifications before the Auth/session phase is stable and verified.

## Approved First API Phase

Phase 1 should be:

1. Auth/session API client scaffolding
2. Customer OTP request contract
3. Customer OTP verify contract
4. Captain OTP request contract
5. Captain OTP verify contract
6. Session state bridge with the existing mock flow
7. Mock fallback preserved until real backend responses are confirmed

## Entry Conditions

Start real API work only when these are confirmed:

- Backend base URL for mobile development.
- Whether the backend currently exposes the auth paths listed in `mobile/docs/api/mobile-api-contract.md`.
- Token shape: access token, refresh token, expiry, and user role.
- Storage decision for tokens: secure storage later, temporary mock/session bridge first if needed.
- Error format aligned with `mobile/src/api/contracts/common.ts`.
- Android Expo Go remains supported during the first API phase.

## Non-Negotiable Rules

- Work only inside `mobile/`.
- Do not touch backend, web, admin, database, or API server code from the mobile phase.
- Do not remove mock data yet.
- Do not let screens call raw `fetch`, `axios`, sockets, or storage directly.
- Keep API code under `mobile/src/api/client/`.
- Keep validation under `mobile/src/api/contracts/`.
- Add hooks under `mobile/src/api/hooks/` only when a screen is ready to consume live data.
- Keep current visual design and app flow unchanged during Auth/session integration.

## First Implementation Shape

Recommended mobile folders for the first API phase:

```text
mobile/src/api/client/
mobile/src/api/contracts/
mobile/src/api/hooks/
mobile/src/api/session/
```

Recommended first files:

```text
mobile/src/api/contracts/auth.ts
mobile/src/api/contracts/__tests__/auth.test.ts
mobile/src/api/client/api-config.ts
mobile/src/api/client/auth-client.ts
mobile/src/api/client/__tests__/auth-client.test.ts
mobile/src/api/session/auth-session.ts
mobile/src/api/session/__tests__/auth-session.test.ts
```

## Auth Endpoints To Start With

| Role | Action | Method | Path |
| --- | --- | --- | --- |
| Customer | Request OTP | POST | `/auth/customer/otp/request` |
| Customer | Verify OTP | POST | `/auth/customer/otp/verify` |
| Captain | Request OTP | POST | `/auth/captain/otp/request` |
| Captain | Verify OTP | POST | `/auth/captain/otp/verify` |

## Stop Conditions

Pause API work and return to planning if:

- Backend response shape differs from the mobile contract.
- Token format is not agreed.
- Expo Go compatibility breaks.
- Auth integration forces UI rewrites.
- The mock fallback cannot stay available.

## Verification Required After First API Phase

Run:

```bash
npm.cmd --prefix mobile run lint
npm.cmd --prefix mobile run check
npm.cmd --prefix mobile test
git status --short --untracked-files=all
git diff --stat
```

Also manually verify:

- Customer login path still works with mock fallback.
- Captain login path still works with mock fallback.
- Current customer and captain screens still open.
- No visual regression in RTL layout.

## Recommended Next Step

Start API Phase 1 with auth contracts and session scaffolding only.

Do not connect ride requests, captain requests, realtime, payment, maps, or GPS until Auth/session is finished and verified.
