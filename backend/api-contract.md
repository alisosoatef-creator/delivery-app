# Backend API Contract

Routes below are currently backed by the local SQLite development database. There is still no external service or production database in this phase.

## Bootstrap

- `GET /api/bootstrap`
  - Returns: `cities`, `drivers`, `pricingRules`, `settings`, `admin`

- `GET /api/events`
  - Server-sent events stream used by the frontend.

## Auth

- `POST /api/auth/request-otp`
  - Body: `{ "phone": "+970599000000", "role": "customer" }`
  - Returns demo OTP request data.

- `POST /api/auth/register`
  - Body: `{ "fullName": "Name", "phone": "+970...", "password": "demo", "cityId": "nablus" }`
  - Stores an unverified customer in SQLite and returns an OTP request.

- `POST /api/auth/verify-otp`
  - Body: `{ "requestId": "otp_...", "code": "1234" }`
  - Demo OTP is always `1234`.

- `POST /api/auth/login`
  - Body: `{ "identifier": "phone or name", "password": "demo" }`
  - Requires a verified SQLite user.

- `POST /api/auth/logout`
  - Placeholder endpoint returning `{ "ok": true }`.

## Captain Applications

- `POST /api/captain-applications`
- `GET /api/admin/captain-applications`
- `PATCH /api/admin/captain-applications/:id/approve`
- `PATCH /api/admin/captain-applications/:id/reject`

Approving a captain application changes its status to `approved` and creates a local SQLite driver. It does not log the captain in.

## Admin

- `GET /api/admin/customers`
- `PATCH /api/admin/customers/:id/status`
- `GET /api/admin/drivers`
- `PATCH /api/admin/drivers/:id/status`
- `GET /api/admin/rides`
- `GET /api/admin/support/tickets`
- `PATCH /api/admin/support/tickets/:id/status`
- `GET /api/admin/pricing`
- `PATCH /api/admin/pricing/:cityId`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/dashboard`
- `GET /api/admin/overview`

Admin writes are persisted in SQLite for development. API authorization is still a development TODO.

## Rides

- `GET /api/rides`
- `POST /api/rides/quote`
- `POST /api/rides`
- `GET /api/customer/rides`
- `GET /api/customer/rides/:id`
- `PATCH /api/rides/:id/status`
- `POST /api/rides/:id/status`
- `PATCH /api/rides/:id/accept`

`POST /api/rides/:id/status` remains supported for the current frontend.
New customer rides start with `status = "searching"` and do not include captain details before a driver accepts the ride.
`PATCH /api/rides/:id/accept` is a development placeholder for the next driver phase and assigns a driver without logging anyone in.

## Support

- `POST /api/support/tickets`
- `GET /api/admin/support/tickets`
- `PATCH /api/admin/support/tickets/:id/status`

## Driver Compatibility

- `POST /api/drivers/status`
- `GET /api/drivers/requests`

These routes remain for the current driver-facing mock flow.
