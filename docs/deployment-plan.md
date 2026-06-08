# Future Deployment Plan

No deployment is performed in this phase. This document lists possible future options so the project can move from local development to production deliberately.

## Frontend Options
- Vercel: good fit for Vite frontend hosting and preview deployments.
- Netlify: good fit for static frontend hosting and preview deployments.
- Static hosting behind a CDN: possible after `npm.cmd run build`.

Decision later: compare cost, region, preview workflow, team access, and domain management.

## Backend Options
- Render: simple Node service hosting.
- Railway: simple Node service and environment management.
- VPS: maximum control, more operations responsibility.
- Container platform later if the app needs scaling.

The backend must expose REST APIs and Socket.IO on a stable HTTPS origin.

## Database Options
- Supabase PostgreSQL.
- Neon PostgreSQL.
- Managed PostgreSQL from a cloud provider.
- Self-hosted PostgreSQL on a VPS if operations capacity exists.

SQLite should remain local development only.

## Maps And Routing Options
- self-hosted OSRM for predictable routing costs and control.
- GraphHopper if route quality or hosting model fits better.
- Mapbox or another commercial provider later if budget and product requirements justify it.

OpenStreetMap tiles and OSRM public demo are development conveniences, not production guarantees.

## Realtime Options
- Keep Socket.IO on the Node backend for the first hosted version.
- Add Redis adapter if the backend needs multiple instances.
- Add authenticated Socket.IO rooms before public launch.

## Pre-Deployment Gate
Before choosing paid services or hosting:
- Finish `docs/production-readiness.md`.
- Run `npm.cmd run verify`.
- Review security notes.
- Decide expected traffic, budget, region, and support model.
