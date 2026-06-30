# Wasel Mobile API Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the Wasel mobile mock-first app for a clean backend handoff by defining the exact API contracts, realtime events, validation schemas, and replacement points for current mock data.

**Architecture:** Keep the current mobile UI and mock flows unchanged while introducing contract-first TypeScript modules and tests inside `mobile/`. The future API layer should sit between screens/state and backend services, so screens keep consuming normalized ride, profile, payment, support, and realtime shapes.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Jest, Testing Library, Zod, TanStack Query, Zustand/mock state, Expo Go-compatible networking.

---

## Current Mock Sources

| Area | Current source | Future API owner |
| --- | --- | --- |
| Customer home/profile/search/payment/support | `mobile/src/mock/customer-home.ts` | Customer profile, saved places, pricing, support, payment-summary endpoints |
| Captain home/requests/profile/earnings | `mobile/src/mock/captain-home.ts` | Captain profile, availability, requests, earnings endpoints |
| Ride request lifecycle | `mobile/src/state/mock-ride-requests.ts` | Ride request REST commands plus realtime ride events |
| Customer trip visual state | `mobile/src/state/mock-trip-flow.ts` | Local UI state derived from ride status events |
| Realtime feed | `mobile/src/realtime/mock-realtime.ts` | WebSocket or socket.io event contract |
| Auth/session mock | `mobile/src/state/mock-app-session.ts` | OTP/login/session endpoints |

## Contract Boundaries

1. Screens must not call `fetch` or `axios` directly.
2. API schemas must live in `mobile/src/api/contracts/`.
3. API clients must live in `mobile/src/api/client/`.
4. Query hooks must live in `mobile/src/api/hooks/`.
5. Mock data remains available behind adapters until backend responses match the contract.
6. No real API URL, token storage, maps, GPS, payments, or notifications are added in this plan execution.

---

### Task 1: Shared API Result Contract

**Files:**
- Create: `mobile/src/api/contracts/common.ts`
- Create: `mobile/src/api/contracts/__tests__/common.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { apiErrorSchema, apiMetaSchema, apiSuccessSchema } from "../common";

describe("common API contracts", () => {
  it("validates success, error, and pagination metadata", () => {
    expect(apiSuccessSchema.parse({ data: { id: "x" } })).toEqual({ data: { id: "x" } });
    expect(
      apiErrorSchema.parse({
        error: { code: "VALIDATION_ERROR", message: "البيانات غير مكتملة" }
      })
    ).toEqual({
      error: { code: "VALIDATION_ERROR", message: "البيانات غير مكتملة" }
    });
    expect(
      apiMetaSchema.parse({
        page: 1,
        pageSize: 20,
        total: 42
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      total: 42
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd --prefix mobile test -- common.test.ts --runInBand`

Expected: FAIL because `mobile/src/api/contracts/common.ts` does not exist.

- [ ] **Step 3: Add the shared schemas**

```ts
import { z } from "zod";

export const apiMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative()
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1)
  })
});

export const apiSuccessSchema = z.object({
  data: z.unknown()
});

export type ApiMeta = z.infer<typeof apiMetaSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess = z.infer<typeof apiSuccessSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd --prefix mobile test -- common.test.ts --runInBand`

Expected: PASS.

---

### Task 2: Customer Contract

**Files:**
- Create: `mobile/src/api/contracts/customer.ts`
- Create: `mobile/src/api/contracts/__tests__/customer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { customerHomeMock } from "@/mock/customer-home";
import {
  customerDestinationSchema,
  customerPaymentSummarySchema,
  customerProfileSchema,
  customerSupportActionSchema
} from "../customer";

describe("customer API contracts", () => {
  it("accepts the current customer mock profile, payment, support, and destinations", () => {
    expect(customerProfileSchema.parse(customerHomeMock.profile)).toEqual(customerHomeMock.profile);
    expect(customerPaymentSummarySchema.parse(customerHomeMock.profilePaymentSummary)).toEqual(
      customerHomeMock.profilePaymentSummary
    );
    expect(customerSupportActionSchema.parse(customerHomeMock.profileSupport.actions[1])).toEqual(
      customerHomeMock.profileSupport.actions[1]
    );
    expect(customerDestinationSchema.parse(customerHomeMock.savedPlaces[0])).toMatchObject({
      area: "زواتا",
      distance: "0.0 كم",
      label: "المنزل",
      price: "25 شيكل"
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd --prefix mobile test -- customer.test.ts --runInBand`

Expected: FAIL because `mobile/src/api/contracts/customer.ts` does not exist.

- [ ] **Step 3: Add the schemas**

```ts
import { z } from "zod";

export const customerProfileSchema = z.object({
  city: z.string().min(1),
  defaultPayment: z.string().min(1),
  homeArea: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  rating: z.string().min(1),
  title: z.string().min(1)
});

export const customerPaymentSummarySchema = z.object({
  method: z.string().min(1),
  monthlySpend: z.string().min(1),
  status: z.string().min(1)
});

export const customerSupportActionSchema = z.object({
  detail: z.string().min(1),
  label: z.enum(["محادثة الدعم", "الإبلاغ عن مشكلة", "اتصال سريع"]),
  priority: z.string().min(1),
  response: z.string().min(1)
});

export const customerDestinationSchema = z.object({
  area: z.string().min(1),
  detail: z.string().min(1),
  distance: z.string().min(1),
  label: z.string().min(1),
  price: z.string().min(1)
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type CustomerPaymentSummary = z.infer<typeof customerPaymentSummarySchema>;
export type CustomerSupportAction = z.infer<typeof customerSupportActionSchema>;
export type CustomerDestination = z.infer<typeof customerDestinationSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd --prefix mobile test -- customer.test.ts --runInBand`

Expected: PASS.

---

### Task 3: Captain And Ride Request Contract

**Files:**
- Create: `mobile/src/api/contracts/rides.ts`
- Create: `mobile/src/api/contracts/__tests__/rides.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { captainHomeMock } from "@/mock/captain-home";
import { captainAvailableRequestSchema, rideStatusSchema } from "../rides";

describe("ride API contracts", () => {
  it("accepts the current captain request mock and ride statuses", () => {
    expect(captainAvailableRequestSchema.parse(captainHomeMock.availableRequests[0])).toEqual(
      captainHomeMock.availableRequests[0]
    );
    expect(rideStatusSchema.parse("pickup")).toBe("pickup");
    expect(rideStatusSchema.parse("arrived")).toBe("arrived");
    expect(rideStatusSchema.parse("driving")).toBe("driving");
    expect(rideStatusSchema.parse("completed")).toBe("completed");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd --prefix mobile test -- rides.test.ts --runInBand`

Expected: FAIL because `mobile/src/api/contracts/rides.ts` does not exist.

- [ ] **Step 3: Add the schemas**

```ts
import { z } from "zod";

export const rideStatusSchema = z.enum(["pickup", "arrived", "driving", "completed"]);

export const captainAvailableRequestSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  destinationArea: z.string().min(1),
  destinationDetail: z.string().min(1),
  distance: z.string().min(1),
  etaToPickup: z.string().min(1),
  id: z.string().min(1),
  paymentMethod: z.string().min(1),
  pickup: z.string().min(1),
  price: z.string().min(1),
  serviceLabel: z.string().min(1)
});

export type RideStatus = z.infer<typeof rideStatusSchema>;
export type CaptainAvailableRequestContract = z.infer<typeof captainAvailableRequestSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd --prefix mobile test -- rides.test.ts --runInBand`

Expected: PASS.

---

### Task 4: Realtime Event Contract

**Files:**
- Create: `mobile/src/api/contracts/realtime.ts`
- Create: `mobile/src/api/contracts/__tests__/realtime.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { createInitialMockRealtimeState } from "@/realtime/mock-realtime";
import { mockRealtimeConnectionStatusSchema, mockRealtimeEventKindSchema } from "../realtime";

describe("realtime API contracts", () => {
  it("documents every current realtime event kind and connection state", () => {
    expect(mockRealtimeConnectionStatusSchema.parse(createInitialMockRealtimeState().connectionStatus)).toBe(
      "connected"
    );
    expect(mockRealtimeEventKindSchema.options).toEqual([
      "captain-arrived",
      "captain-request-declined",
      "captain-request-accepted",
      "customer-feedback-submitted",
      "customer-request-created",
      "trip-completed",
      "trip-started"
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd --prefix mobile test -- realtime.test.ts --runInBand`

Expected: FAIL because `mobile/src/api/contracts/realtime.ts` does not exist.

- [ ] **Step 3: Add the schemas**

```ts
import { z } from "zod";

export const mockRealtimeConnectionStatusSchema = z.enum(["connected", "offline", "syncing"]);

export const mockRealtimeEventKindSchema = z.enum([
  "captain-arrived",
  "captain-request-declined",
  "captain-request-accepted",
  "customer-feedback-submitted",
  "customer-request-created",
  "trip-completed",
  "trip-started"
]);

export const mockRealtimeEventSchema = z.object({
  audience: z.enum(["both", "captain", "customer"]),
  detail: z.string().min(1),
  id: z.string().min(1),
  kind: mockRealtimeEventKindSchema,
  requestId: z.string().min(1),
  sequence: z.number().int().positive(),
  status: z.literal("delivered"),
  title: z.string().min(1)
});

export type RealtimeConnectionStatusContract = z.infer<typeof mockRealtimeConnectionStatusSchema>;
export type RealtimeEventKindContract = z.infer<typeof mockRealtimeEventKindSchema>;
export type RealtimeEventContract = z.infer<typeof mockRealtimeEventSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd --prefix mobile test -- realtime.test.ts --runInBand`

Expected: PASS.

---

### Task 5: API Endpoint Matrix Document

**Files:**
- Create: `mobile/docs/api/mobile-api-contract.md`

- [ ] **Step 1: Add the endpoint matrix**

```md
# Wasel Mobile API Contract

## Auth

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| POST | `/auth/customer/otp/request` | `{ "phone": "+970590004321" }` | `{ "data": { "otpRequestId": "otp_123", "expiresInSeconds": 120 } }` |
| POST | `/auth/customer/otp/verify` | `{ "otpRequestId": "otp_123", "code": "123456" }` | `{ "data": { "accessToken": "token", "refreshToken": "refresh", "customerId": "customer_1" } }` |
| POST | `/auth/captain/otp/request` | `{ "phone": "+970595551212" }` | `{ "data": { "otpRequestId": "otp_456", "expiresInSeconds": 120 } }` |
| POST | `/auth/captain/otp/verify` | `{ "otpRequestId": "otp_456", "code": "123456" }` | `{ "data": { "accessToken": "token", "refreshToken": "refresh", "captainId": "captain_1" } }` |

## Customer

| Method | Path | Response |
| --- | --- | --- |
| GET | `/customers/me` | `CustomerProfile` |
| GET | `/customers/me/payment-summary` | `CustomerPaymentSummary` |
| GET | `/customers/me/saved-places` | `CustomerDestination[]` |
| GET | `/customers/me/support-options` | `CustomerSupportAction[]` |

## Rides

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| POST | `/rides` | `CreateRideRequest` | `CaptainAvailableRequestContract` |
| GET | `/rides/current` | none | `RideDetail` |
| POST | `/rides/:rideId/cancel` | `{ "reason": "customer_cancelled" }` | `{ "data": { "rideId": "request-live-customer", "status": "cancelled" } }` |
| POST | `/rides/:rideId/feedback` | `{ "rating": 5, "note": "كابتن محترف" }` | `{ "data": { "rideId": "request-live-customer", "stored": true } }` |

## Captain

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/captains/me` | none | `CaptainProfile` |
| PATCH | `/captains/me/availability` | `{ "online": true }` | `{ "data": { "online": true } }` |
| GET | `/captains/me/requests` | none | `CaptainAvailableRequestContract[]` |
| POST | `/captains/me/requests/:requestId/accept` | none | `RideDetail` |
| POST | `/captains/me/requests/:requestId/decline` | `{ "reason": "busy" }` | `{ "data": { "requestId": "request-001", "declined": true } }` |
| PATCH | `/captains/me/rides/:rideId/status` | `{ "status": "arrived" }` | `RideDetail` |

## Realtime

| Event | Direction | Payload |
| --- | --- | --- |
| `customer-request-created` | server to captain/customer | `RealtimeEventContract` |
| `captain-request-accepted` | server to captain/customer | `RealtimeEventContract` |
| `captain-request-declined` | server to customer | `RealtimeEventContract` |
| `captain-arrived` | server to customer | `RealtimeEventContract` |
| `trip-started` | server to captain/customer | `RealtimeEventContract` |
| `trip-completed` | server to captain/customer | `RealtimeEventContract` |
| `customer-feedback-submitted` | server to captain | `RealtimeEventContract` |
```

- [ ] **Step 2: Verify the document has concrete paths**

Run: `rg -n "/auth|/rides|/captains|customer-request-created" mobile/docs/api/mobile-api-contract.md`

Expected: The command prints matching endpoint and event lines.

---

### Task 6: Adapter Skeleton Without Real Network

**Files:**
- Create: `mobile/src/api/client/mock-api-adapter.ts`
- Create: `mobile/src/api/client/__tests__/mock-api-adapter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { getMockCustomerProfile, getMockSupportActions } from "../mock-api-adapter";

describe("mock API adapter", () => {
  it("returns normalized mock data through API-shaped functions", async () => {
    await expect(getMockCustomerProfile()).resolves.toMatchObject({
      city: "نابلس",
      name: "علي محمد"
    });
    await expect(getMockSupportActions()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "الإبلاغ عن مشكلة",
          priority: "عالية"
        })
      ])
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd --prefix mobile test -- mock-api-adapter.test.ts --runInBand`

Expected: FAIL because the adapter file does not exist.

- [ ] **Step 3: Add the mock adapter**

```ts
import { customerHomeMock } from "@/mock/customer-home";

export async function getMockCustomerProfile() {
  return customerHomeMock.profile;
}

export async function getMockSupportActions() {
  return customerHomeMock.profileSupport.actions;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd --prefix mobile test -- mock-api-adapter.test.ts --runInBand`

Expected: PASS.

---

### Task 7: Final Verification

**Files:**
- Verify all changed files inside `mobile/`.

- [ ] Run `npm.cmd --prefix mobile run lint`.
- [ ] Run `npm.cmd --prefix mobile run check`.
- [ ] Run `npm.cmd --prefix mobile test`.
- [ ] Run `rg -n "fetch\\(|axios|baseURL|WebSocket|socket.io" mobile/src` and confirm no real network calls were introduced.
- [ ] Run `git status --short`.
- [ ] Run `git diff --stat`.
- [ ] Report changed files and risks without committing or pushing.

---

## Execution Notes

- Keep Expo Go compatibility through the contract phase.
- Keep all real API URLs out of the code until the user approves API connection work.
- Keep mock data available until backend responses match the schemas.
- Do not touch backend, web, admin, database, or API server code while executing this mobile plan.
- Do not commit from Codex; the user will save and commit.
