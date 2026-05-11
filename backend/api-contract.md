# Backend API Contract

## Auth

- `POST /auth/request-otp`
  - Body: `{ "phone": "+970599000000", "role": "customer" | "driver" }`
  - Response: `{ "requestId": "otp_123", "expiresInSeconds": 120 }`

- `POST /auth/verify-otp`
  - Body: `{ "requestId": "otp_123", "code": "1234" }`
  - Response: `{ "token": "jwt", "user": { "id": "u_1", "role": "customer" } }`

## Customer Rides

- `POST /rides/quote`
  - Body: `{ "city": "Nablus", "pickup": { "lat": 32.22, "lng": 35.26 }, "dropoff": { "lat": 32.21, "lng": 35.29 } }`
  - Response: `{ "distanceKm": 5.8, "etaMinutes": 7, "fareIls": 24 }`

- `POST /rides`
  - Body: `{ "quoteId": "q_1", "paymentMethod": "cash" | "wallet" }`
  - Response: `{ "rideId": "r_1", "status": "searching" }`

- `GET /rides/:rideId`
  - Response includes customer, driver, vehicle, route, fare, status, and timestamps.

- `POST /rides/:rideId/cancel`
  - Body: `{ "reason": "driver_too_far" }`

## Driver

- `POST /drivers/status`
  - Body: `{ "online": true, "location": { "lat": 32.22, "lng": 35.26 } }`

- `GET /drivers/requests`
  - Response: nearby ride requests ordered by distance and score.

- `POST /drivers/rides/:rideId/accept`
  - Response: assigned ride details.

- `POST /drivers/rides/:rideId/status`
  - Body: `{ "status": "accepted" | "arriving" | "picked_up" | "completed" }`

## Wallet

- `GET /wallet`
  - Response: `{ "balanceIls": 82, "transactions": [] }`

- `POST /wallet/top-up`
  - Body: `{ "amountIls": 50, "method": "cash_agent" }`

## Ratings

- `POST /ratings`
  - Body: `{ "rideId": "r_1", "rating": 5, "comment": "ممتاز" }`

## Notifications

- `GET /notifications`
  - Response: unread and recent notifications.

- `POST /notifications/read`
  - Body: `{ "ids": ["n_1", "n_2"] }`

## Admin

- `GET /admin/overview`
  - Response: active rides, online drivers, revenue, complaints, city demand.

- `GET /admin/rides`
  - Query: `city`, `status`, `from`, `to`

- `GET /admin/drivers`
  - Query: `city`, `online`, `verified`

## Realtime Events

Use WebSocket or Socket.IO channels:

- `driver.location.updated`
- `ride.status.changed`
- `ride.driver.matched`
- `ride.cancelled`
- `notification.created`
- `admin.metrics.updated`
