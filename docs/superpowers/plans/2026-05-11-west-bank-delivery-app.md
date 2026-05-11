# West Bank Delivery App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished first version of a one-app delivery platform for customers, drivers, and admins in the West Bank.

**Architecture:** Create a dependency-free runnable `index.html` for the current environment, plus React/Vite scaffold files for the future app structure. Keep backend concerns documented in API and database files instead of pretending real services are wired.

**Tech Stack:** HTML, CSS, JavaScript, React scaffold, Node.js backend contract, SQL database schema.

---

### File Structure

- Create `index.html`: standalone interactive app with login, customer, driver, and admin views.
- Create `package.json`: React/Vite metadata for later installation.
- Create `src/main.jsx`: React entrypoint for the future project.
- Create `src/App.jsx`: React component scaffold mirroring the MVP app.
- Create `src/styles.css`: shared styling direction for React migration.
- Create `backend/api-contract.md`: REST and realtime event contract.
- Create `backend/schema.sql`: database tables for users, drivers, rides, wallets, ratings, notifications, and audit logs.
- Create `.gitignore`: ignore local generated files and dependencies.

### Task 1: Product Documentation

- [x] Create the design spec in `docs/superpowers/specs/2026-05-11-west-bank-delivery-app-design.md`.
- [x] Create this implementation plan in `docs/superpowers/plans/2026-05-11-west-bank-delivery-app.md`.

### Task 2: Standalone App

- [x] Create `index.html` with Arabic-first UI, role selection, OTP mock login, language toggle, city selector, customer booking, driver online mode, admin monitoring, wallet, notifications, ratings, and simulated map tracking.
- [x] Verify `index.html` has no external dependencies so it can open directly.

### Task 3: React Scaffold

- [x] Create `package.json`, `src/main.jsx`, `src/App.jsx`, and `src/styles.css`.
- [x] Keep scaffold focused and dependency-light so `npm install` can later turn it into a normal React/Vite app.

### Task 4: Backend Blueprint

- [x] Create `backend/api-contract.md` with auth, ride, driver, wallet, notification, admin, and realtime endpoints.
- [x] Create `backend/schema.sql` with normalized MVP tables and useful indexes.

### Task 5: Verification

- [x] Run a Node-based syntax and file check.
- [x] Inspect the app with a Node DOM simulation because local Chromium/Edge headless returned exit code 13 in this environment.
- [x] Report environment limitations honestly.

### Task 6: React + Node Upgrade

- [x] Move the original standalone prototype to `prototype.html`.
- [x] Convert `index.html` into a Vite React entrypoint.
- [x] Replace the placeholder React scaffold with a working customer, driver, and admin app in `src/App.jsx`.
- [x] Replace the placeholder styling with the production-style dark/gold app shell in `src/styles.css`.
- [x] Add `vite.config.js` with a `/api` proxy to the local backend.
- [x] Add `backend/server.mjs` and `backend/data.mjs` for OTP, bootstrap data, quote creation, ride creation, ride status updates, driver status, admin metrics, and realtime SSE events.
- [x] Add `scripts/check.mjs` for project structure and backend syntax checks.
- [x] Verify with `npm run check`, `npm run build`, and a live API flow against `http://127.0.0.1:3001`.
