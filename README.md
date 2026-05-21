# Wasel Local Ride Delivery App

Wasel is a local development prototype for a people-delivery / ride-request app covering customer, driver, and admin workflows.

## Stack
- Frontend: React + Vite
- Backend: Node.js
- Database: SQLite for local development
- Realtime: Socket.IO
- Maps: Leaflet + OpenStreetMap, with OSRM public demo routing for development

## Quick Start
1. Install dependencies:
   ```powershell
   npm.cmd install
   ```
2. Start the Backend:
   ```powershell
   npm.cmd run api
   ```
3. Start the Frontend in another terminal:
   ```powershell
   npm.cmd run dev
   ```
4. Open the Vite URL, usually `http://127.0.0.1:5173`.

## Checks
```powershell
npm.cmd run build
npm.cmd run check
npm.cmd run api:check
npm.cmd run verify
```

## Mobile Foundation
The Expo / React Native foundation lives in `mobile/`.

```powershell
npm.cmd run mobile:install
npm.cmd run mobile:start
npm.cmd run mobile:check
```

Set `EXPO_PUBLIC_API_BASE_URL` for mobile devices when needed. Android emulator usually uses `http://10.0.2.2:3001/api`; a real phone needs the computer LAN IP.

## Local Documentation
- Local development guide: `docs/local-development.md`
- QA checklist: `docs/qa-checklist.md`
- Security notes: `docs/security-notes.md`
- Production readiness checklist: `docs/production-readiness.md`
- Deployment planning notes: `docs/deployment-plan.md`

## Development Access
- Customer: register from the Auth screen, verify OTP with `1234`, then log in.
- Admin dev login: `/admin/dev-login`, development only, username `admin`, password `1234`.
- Driver dev login: `/driver/dev-login`, development only, requires an approved/active captain.

SQLite data is stored locally at `backend/dev.sqlite` by default and is ignored by Git.
