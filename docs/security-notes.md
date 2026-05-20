# Security Notes

## Hardened In This Phase
- Added backend security helpers for dev-session parsing, soft role checks, CORS/security headers, and in-memory rate limiting.
- Added backend validation helpers for required fields, phone shape, numeric ranges, allowed roles, account statuses, ride statuses, support statuses, and payment methods.
- Frontend API requests now attach the current development token and role with `Authorization` and `X-Dev-Role` headers when a session exists.
- Socket.IO now receives the current development token/role in the handshake and has soft room/event checks for customer, driver, admin, and ride rooms.
- Admin and driver development login screens are still development-only and show a visible Development Only warning.
- Logout clears the local development session token.
- Sensitive payment data remains placeholder-only: CVV is not stored, full card numbers are not returned, and only card metadata such as `last4` is kept.
- Backend auth responses and public user shaping must not expose `passwordHash`.

## Dev-Only Behavior
- Tokens are development tokens, not production sessions.
- `AdminDevLogin` and `DriverDevLogin` are only available through `import.meta.env.DEV`.
- Admin, driver, and customer API protections run in soft mode during development to keep local workflows and smoke tests stable.
- Socket.IO room protection is soft during development and must be replaced with real membership checks before production.
- Rate limiting is in-memory and resets when the backend restarts.
- VISA and wallet flows are placeholders and do not process real money.

## Production TODO
- Replace development tokens with signed JWT or secure server-side sessions with expiration and revocation.
- Serve the app and API over HTTPS only.
- Lock CORS to exact production origins and remove wildcard fallback.
- Add complete Admin API protection with scoped permissions for `owner`, `admin`, and `support`.
- Add Driver and Customer API authorization based on authenticated user identity, not phone query parameters.
- Add Socket.IO authentication and per-room membership checks for ride, customer, driver, and admin channels.
- Move rate limiting to a durable/distributed store if the API runs on more than one process.
- Add production secrets and environment management.
- Integrate a real Payment gateway before enabling card payments.
- Move production data to PostgreSQL or another managed database with migrations.
- Add backups, audit logging, error logging, and monitoring.
