# Local Development

## Requirements
- Node.js with the built-in SQLite support used by this project.
- npm on Windows PowerShell or a compatible terminal.
- Internet access for OpenStreetMap tiles and the OSRM public demo routing endpoint.

## Install
```powershell
npm.cmd install
```

## Environment Files
- `.env.example` documents frontend and shared local variables.
- `backend/.env.example` documents backend variables.
- Do not commit real `.env` files or secrets.
- The backend does not require a `.env` file for local use; defaults are set in `backend/config.mjs`.

Useful variables:
- `PORT`: backend port, default `3001`.
- `VITE_API_BASE_URL`: frontend API base, default `/api`.
- `VITE_SOCKET_URL`: Socket.IO URL, default same origin `/`.
- `SQLITE_DB_PATH` or `WASEL_DB_PATH`: SQLite file path.
- `OTP_MODE=dev`: OTP is the development code `1234`.
- `PAYMENT_MODE=placeholder`: VISA is a placeholder and does not process money.
- `ROUTING_PROVIDER=osrm-public-demo`: routing uses the public OSRM demo service for development.

## Run Backend
```powershell
npm.cmd run api
```

The backend starts on `http://127.0.0.1:3001` or the configured `HOST`/`PORT`.

## Run Frontend
```powershell
npm.cmd run dev
```

Vite runs on `http://127.0.0.1:5173` and proxies `/api` and `/socket.io` to the backend.

## Database
- Default SQLite path: `backend/dev.sqlite`.
- Init/seed are automatic when the backend starts.
- Manual init:
  ```powershell
  npm.cmd run db:init
  ```
- Manual seed:
  ```powershell
  npm.cmd run db:seed
  ```
- To reset local development data, stop the backend and remove `backend/dev.sqlite`, `backend/dev.sqlite-shm`, and `backend/dev.sqlite-wal`; the backend will recreate them on next start.

## Test A Full Ride With Three Windows
1. Customer window: register, verify OTP `1234`, log in, choose city/pickup/destination, then request a ride.
2. Driver window: open `/driver/dev-login`, select an approved active captain, accept the available ride, and move statuses through the lifecycle.
3. Admin window: open `/admin/dev-login`, username `admin`, password `1234`, then watch dashboard, rides, payments, and support updates.

## Checks
```powershell
npm.cmd run build
npm.cmd run check
npm.cmd run api:check
npm.cmd run verify
```

## Development-Only Notes
- AdminDevLogin and DriverDevLogin are development-only.
- OTP is a fixed development code.
- SQLite is for local development, not production.
- VISA and wallet payments are placeholders.
- OSRM public demo routing is for development only.
- Socket.IO auth and Admin API protection need production-grade sessions before hosting.
