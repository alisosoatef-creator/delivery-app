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
