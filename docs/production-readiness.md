# Production Readiness Checklist

This project is prepared for local production-readiness review only. It is not deployed and still has development-only systems.

## Data And Database
- [ ] Move from SQLite to PostgreSQL, for example Supabase, Neon, managed PostgreSQL, or a self-managed database.
- [ ] Add versioned database migrations.
- [ ] Add backups and restore drills.
- [ ] Add database access policies and least-privilege credentials.

## Authentication And Authorization
- [ ] Replace dev tokens with production JWT or secure server-side sessions.
- [ ] Add token expiration, refresh, revocation, and secure logout.
- [ ] Disable `AdminDevLogin` and `DriverDevLogin` in production.
- [ ] Protect all Admin, Driver, Customer, and Support APIs with authenticated identity.
- [ ] Scope admin roles to `owner`, `admin`, and `support`.
- [ ] Add audit logs for admin actions.

## Network And Hosting
- [ ] Enable HTTPS everywhere.
- [ ] Configure production CORS with exact frontend origins.
- [ ] Configure secure headers at the edge and backend.
- [ ] Configure domain and DNS.
- [ ] Configure reverse proxy or platform routing for `/api` and `/socket.io`.

## OTP And Messaging
- [ ] Replace fixed OTP `1234` with an SMS OTP provider.
- [ ] Add OTP expiry, retry limits, and abuse monitoring.
- [ ] Keep OTP provider credentials in environment secrets only.

## Payments
- [ ] Replace VISA placeholder with a real payment gateway.
- [ ] Never store CVV or full card numbers.
- [ ] Add webhook verification.
- [ ] Add refunds, failed payment handling, and reconciliation.
- [ ] Review wallet/accounting logic with finance requirements.

## Maps, Routing, And GPS
- [ ] Replace OSRM public demo with production routing, such as self-hosted OSRM, GraphHopper, Mapbox, or another approved provider.
- [ ] Add route failure monitoring and fallback behavior.
- [ ] Define location retention rules and privacy policy coverage.

## Realtime
- [ ] Add Socket.IO authentication.
- [ ] Verify ride/customer/driver/admin room membership server-side.
- [ ] Add connection monitoring and reconnect strategy.
- [ ] Decide whether to persist live location history.

## Operations
- [ ] Add structured logging.
- [ ] Add monitoring and alerting.
- [ ] Add error tracking.
- [ ] Add rate limiting backed by durable storage.
- [ ] Add CI checks for build, static check, and API smoke tests.
- [ ] Add deployment runbooks and rollback steps.

## Legal And Product
- [ ] Add privacy policy.
- [ ] Add terms of service.
- [ ] Add data deletion and support policies.
- [ ] Review local transport/payment compliance before launch.
