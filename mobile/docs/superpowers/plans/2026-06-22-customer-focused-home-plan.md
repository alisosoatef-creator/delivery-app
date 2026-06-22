# Customer Focused Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the customer landing screen into one compact readiness surface with one dominant ride-request action.

**Architecture:** Keep the existing `CustomerHomeScreen` state and booking flow. Refine only `CustomerBookingLauncher`, focused hero copy, and their styles so no navigation or data behavior changes.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Reanimated motion primitives, Jest, Testing Library.

---

### Task 1: Focused Home Contract

**Files:**

- Modify: `mobile/src/screens/__tests__/customer-home-screen.test.tsx`

- [ ] Add an initial-state test for `customer-focused-home`, `customer-home-ready-status`, one `بدء طلب رحلة` action, and absence of the duplicated launcher title.
- [ ] Run the focused Jest test and confirm it fails because the new focused surface and status are missing.

### Task 2: Compact Launcher

**Files:**

- Modify: `mobile/src/screens/customer-home-screen.tsx`

- [ ] Replace the launcher icon/title/paragraph stack with a compact readiness row.
- [ ] Keep the existing booking action and flow callback.
- [ ] Shorten focused hero supporting copy.
- [ ] Reduce launcher height and spacing while increasing the primary button touch area.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Regression Verification

**Files:**

- Verify all changed files inside `mobile/`.

- [ ] Run `npm.cmd --prefix mobile run check`.
- [ ] Run Prettier check on changed phase files.
- [ ] Run `npm.cmd --prefix mobile test -- --runInBand --silent`.
- [ ] Run `git diff --check -- mobile`, `git status --short`, and `git diff --stat -- mobile`.
- [ ] Report results without committing or pushing.
