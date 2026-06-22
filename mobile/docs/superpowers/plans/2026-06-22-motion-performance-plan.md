# Wasel Motion And Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing mock mobile experience feel faster and more tactile without changing its flow or visual direction.

**Architecture:** Add two focused motion primitives: a UI-thread pressable for tactile controls and a reduced-motion-aware entrance surface. Reuse them in primary actions and customer/captain bottom navigation, then memoize the two route-map components with explicit prop comparators.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19, Reanimated 4, Expo Haptics, Jest, Testing Library.

---

### Task 1: Motion Primitives

**Files:**

- Create: `mobile/src/components/motion-pressable.tsx`
- Create: `mobile/src/components/motion-surface.tsx`
- Create: `mobile/src/components/__tests__/motion-components.test.tsx`

- [ ] Write tests for press callbacks, optional haptics, and reduced-motion duration selection.
- [ ] Run `npm.cmd --prefix mobile test -- --runInBand src/components/__tests__/motion-components.test.tsx` and verify failure because the components do not exist.
- [ ] Implement `MotionPressable` with Reanimated shared values and transform/opacity animations.
- [ ] Implement `MotionSurface` with short entering motion disabled when reduced motion is requested.
- [ ] Re-run the focused component tests and verify they pass.

### Task 2: Shared Actions And Navigation

**Files:**

- Modify: `mobile/src/components/premium-button.tsx`
- Modify: `mobile/src/screens/customer-home-screen.tsx`
- Modify: `mobile/src/screens/captain-home-screen.tsx`
- Modify: `mobile/src/design/__tests__/design-system.test.tsx`
- Modify: `mobile/src/screens/__tests__/customer-home-screen.test.tsx`
- Modify: `mobile/src/screens/__tests__/captain-home-screen.test.tsx`

- [ ] Add failing assertions that primary actions and both bottom navigations use the shared motion control.
- [ ] Replace the visual-only pressed styles with `MotionPressable`.
- [ ] Use short selection haptics on tab changes and light impact only on explicitly important actions.
- [ ] Replace the customer-local entrance helper with the reduced-motion-aware shared `MotionSurface`.
- [ ] Re-run customer, captain, and design-system tests.

### Task 3: Route Map Render Isolation

**Files:**

- Modify: `mobile/src/components/mock-route-map.tsx`
- Modify: `mobile/src/components/captain-route-map.tsx`
- Create: `mobile/src/components/__tests__/route-map-performance.test.ts`

- [ ] Add failing comparator tests for equal and changed route-map props.
- [ ] Add explicit prop comparators and wrap both maps with `React.memo`.
- [ ] Re-run the focused route-map performance tests.

### Task 4: Verification

**Files:**

- Verify all modified files inside `mobile/`.

- [ ] Run `npm.cmd --prefix mobile run check`.
- [ ] Run Prettier check on all changed mobile TypeScript files.
- [ ] Run `npm.cmd --prefix mobile test -- --runInBand --silent`.
- [ ] Run `git diff --check -- mobile`, `git status --short`, and `git diff --stat -- mobile`.
- [ ] Report results without committing or pushing.
