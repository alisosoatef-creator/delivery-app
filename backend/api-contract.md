# Backend API Contract

Routes below are currently backed by the local SQLite development database. There is still no external service or production database in this phase.

## Bootstrap

- `GET /api/bootstrap`
  - Returns: `cities`, `drivers`, `pricingRules`, `settings`, `admin`

- `GET /api/places/search?city=nablus&q=جامعة`
  - Returns local/mock West Bank place suggestions: `label`, `city`, `lat`, `lng`, `category`.
  - Development fallback only. Production should use a policy-compliant search/routing provider or a curated places database.

- `GET /api/events`
  - Server-sent events stream used by the frontend.

## Realtime

Socket.IO runs on the same local backend server on `/socket.io`. It is development-only for now and keeps REST APIs as the source of truth.

Rooms currently supported:

- `join:customer` with `{ customerId, customerPhone }`
- `join:driver` with `{ driverId }`
- `join:admin`
- `join:ride` with `{ rideId }`

Events emitted by ride/admin actions:

- `ride:created`
- `ride:accepted`
- `ride:status-updated`
- `ride:cancelled`
- `ride:completed`
- `driver:online-status-updated`
- `driver:location-updated`
- `driver:location-unavailable`
- `support:ticket-created`
- `support:ticket-updated`
- `payment:created`
- `payment:updated`
- `wallet:updated`
- `admin:captain-application-created`
- `admin:captain-application-reviewed`

Driver live location is relayed through Socket.IO only and is not persisted in SQLite yet.

TODO: protect rooms with real authenticated tokens before production, replace broad admin/dev subscriptions with stricter authorization, and add location history retention only if operationally needed.

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
- `POST /api/rides/:id/pay`
- `GET /api/customer/rides`
- `GET /api/customer/rides/:id`
- `PATCH /api/rides/:id/status`
- `POST /api/rides/:id/status`
- `PATCH /api/rides/:id/accept`

`POST /api/rides/:id/status` remains supported for the current frontend.
New customer rides start with `status = "searching"` and do not include captain details before a driver accepts the ride.
`PATCH /api/rides/:id/accept` assigns an active approved driver only when the ride is still `searching`. It returns specific error codes such as `ride_not_searching`, `ride_already_accepted`, `driver_not_active`, and `driver_ride_mismatch` so the frontend can show actionable captain errors.

## Driver

- `GET /api/driver/dev-drivers`
- `POST /api/driver/dev-login`
- `GET /api/driver/available-rides`
- `GET /api/driver/my-rides`
- `PATCH /api/driver/rides/:id/status`

Driver development login is limited to active approved captains in the local database. The driver ride status endpoint enforces the current development lifecycle: `accepted -> driver_arriving -> arrived -> in_progress -> completed`.

## Payments and Wallet

- `GET /api/customer/wallet?phone=...&userId=...`
  - Returns a development wallet balance and local ledger entries.
- `GET /api/customer/payments?phone=...&userId=...`
  - Returns payment records for the current customer.
- `GET /api/customer/payment-methods?phone=...&userId=...`
  - Returns saved demo payment methods. Only `last4` is stored for VISA.
- `POST /api/customer/payment-methods`
  - Saves a VISA placeholder using `cardholderName`, `last4`, `brand`, and expiry fields. Full card number and CVV must not be stored.
- `DELETE /api/customer/payment-methods/:id`
  - Deletes a saved local placeholder method.
- `GET /api/admin/payments`
  - Returns SQLite payment records, wallet transactions, and summary totals.
- `GET /api/admin/wallet-transactions`
  - Returns all local wallet ledger transactions.
- `PATCH /api/admin/payments/:id/status`
  - Development-only manual payment status update.
- `GET /api/driver/earnings?driverId=...`
  - Returns captain earnings summary from completed paid rides.
- `GET /api/driver/wallet-transactions?driverId=...`
  - Returns captain wallet ledger entries.

Cash rides are marked `paid` when completed in this development build. VISA is a placeholder with provider `visa-placeholder`; no real payment gateway is called and no sensitive card data is persisted.

## Support

- `POST /api/support/tickets`
  - Body: `{ "name": "User", "phone": "+970...", "role": "customer|driver", "type": "ride_issue", "message": "...", "rideId": "ride_..." }`
  - Creates an `open` SQLite ticket and emits `support:ticket-created`.
- `GET /api/support/my-tickets?phone=...&role=customer|driver`
  - Returns tickets for the current local user phone and role.
- `GET /api/admin/support/tickets`
  - Returns all tickets for admin review.
- `PATCH /api/admin/support/tickets/:id/status`
  - Body: `{ "status": "open|closed" }`
  - Updates ticket state and emits `support:ticket-updated`.

## Driver Compatibility

- `POST /api/drivers/status`
- `GET /api/drivers/requests`

These routes remain for the current driver-facing mock flow.
