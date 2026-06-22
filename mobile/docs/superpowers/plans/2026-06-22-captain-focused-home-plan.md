# Captain Focused Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crowded captain dashboard with one nearest-request decision surface and an on-demand details view.

**Architecture:** Keep the current screen state, mock request store, and active-trip screen. Change only the home/request presentation so compact and detailed request states are mutually exclusive, and scope realtime panels to the requests tab.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, shared Reanimated motion controls, Jest, Testing Library.

---

### Task 1: Focused Captain Contract

**Files:**

- Modify: `mobile/src/screens/__tests__/captain-home-screen.test.tsx`

- [ ] Add a test for `captain-focused-home`, `captain-nearest-request-card`, hidden duplicate panels, and one details action.
- [ ] Add a test proving realtime is absent on home and visible in the requests tab.
- [ ] Run the focused tests and verify they fail because the new surfaces do not exist.

### Task 2: Compact Request And Details

**Files:**

- Modify: `mobile/src/screens/captain-home-screen.tsx`

- [ ] Remove home-only operations and earnings summary surfaces.
- [ ] Render a compact route and decision metrics in the nearest-request card.
- [ ] Keep accept, decline, and contact actions.
- [ ] Replace the compact card with the existing full preview state when details are opened.
- [ ] Consolidate service, note, payment, fare, distance, and ETA into the details view without duplicate panels.
- [ ] Re-run the focused tests and verify they pass.

### Task 3: Realtime Placement And Regression

**Files:**

- Modify: `mobile/src/screens/captain-home-screen.tsx`
- Modify: `mobile/src/screens/__tests__/captain-home-screen.test.tsx`

- [ ] Render realtime status and activity only for the requests tab.
- [ ] Update existing dashboard assertions to the focused home contract.
- [ ] Run the full captain screen test suite.

### Task 4: Verification

**Files:**

- Verify all changed files inside `mobile/`.

- [ ] Run `npm.cmd --prefix mobile run check`.
- [ ] Run Prettier check on changed phase files.
- [ ] Run `npm.cmd --prefix mobile test -- --runInBand --silent`.
- [ ] Run `git diff --check -- mobile`, `git status --short`, and `git diff --stat -- mobile`.
- [ ] Report results without committing or pushing.
