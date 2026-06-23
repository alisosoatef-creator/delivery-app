# Wasel Premium Balanced Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved `B - Premium Balanced` direction across the Wasel mock mobile app without changing flows, adding native dependencies, or reducing Expo Go compatibility.

**Architecture:** Start with semantic visual tokens, then update shared primitives before polishing individual screen families. Each phase preserves the responsive, accessibility, motion, and mock-state contracts already covered by Jest.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript, Expo Blur, Expo Linear Gradient, Reanimated 4, Jest, Testing Library, ESLint, Prettier.

---

### Task 1: Premium Semantic Tokens

**Files:**

- Modify: `mobile/src/design/tokens.ts`
- Modify: `mobile/src/design/__tests__/design-system.test.tsx`

- [x] **Step 1: Write the failing token contract**

Add assertions for the approved direction:

```tsx
expect(waselVisualDirection.polish).toBe("premium-balanced");
expect(glass.default.shadow).toBe(shadows.card);
expect(glass.strong.shadow).toBe(shadows.cardStrong);
expect(glass.subtle.shadow).toBe(shadows.cardSubtle);
expect(glass.floating.shadow).toBe(shadows.floating);
expect(glass.strong.highlightColor).toContain("rgba");
expect(gradients.buttonHighlight).toHaveLength(2);
expect(controlSurfaces.activeNavigation.backgroundColor).toContain("rgba");
expect(layoutRhythm.cardPadding).toBe(spacing.md);
```

- [x] **Step 2: Verify the test fails**

Run:

```powershell
npm.cmd --prefix mobile test -- --runInBand src/design/__tests__/design-system.test.tsx
```

Expected: failure because semantic premium tokens and the floating glass variant do not exist.

- [x] **Step 3: Add the semantic token layer**

Update `mobile/src/design/tokens.ts` with:

```ts
export const shadows = {
  cardSubtle: "0 8px 24px rgba(0, 0, 0, 0.2)",
  card: "0 14px 38px rgba(0, 0, 0, 0.34)",
  cardStrong: "0 18px 46px rgba(0, 0, 0, 0.4)",
  floating: "0 20px 54px rgba(0, 0, 0, 0.48)",
  primaryAction: "0 12px 30px rgba(60, 103, 255, 0.28)",
  activeControl: "0 8px 22px rgba(0, 173, 255, 0.14)",
  glowCyan: "0 0 16px rgba(0, 229, 255, 0.64)"
} as const;

export const controlSurfaces = {
  secondary: {
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    borderColor: "rgba(147, 177, 255, 0.2)"
  },
  activeNavigation: {
    backgroundColor: "rgba(0, 199, 235, 0.14)",
    borderColor: "rgba(0, 229, 255, 0.16)"
  }
} as const;

export const layoutRhythm = {
  cardPadding: spacing.md,
  denseCardPadding: spacing.sm,
  sectionGap: spacing.md,
  compactSectionGap: spacing.sm
} as const;
```

Give every glass variant a semantic `shadow` and `highlightColor`, and add a `floating` glass variant. Add `buttonHighlight` and `floating` gradients. Add `polish: "premium-balanced"` to `waselVisualDirection`.

- [x] **Step 4: Verify Task 1**

Run:

```powershell
npm.cmd --prefix mobile test -- --runInBand src/design/__tests__/design-system.test.tsx
npm.cmd --prefix mobile run check
npm.cmd --prefix mobile run lint
```

Expected: all commands pass.

### Task 2: Glass And Button Primitives

**Files:**

- Modify: `mobile/src/components/glass-card.tsx`
- Modify: `mobile/src/components/premium-button.tsx`
- Modify: `mobile/src/design/__tests__/design-system.test.tsx`

- [x] Add failing tests for variant-specific shadows, internal highlights, floating glass, and primary/secondary button hierarchy.
- [x] Update `GlassCard` to consume variant shadows and highlights without changing its public layout behavior.
- [x] Update `PremiumButton` with the primary-action shadow, top highlight, secondary control surface, and safe single-line label scaling.
- [x] Run the design-system and motion component tests.

### Task 3: Floating Navigation

**Files:**

- Modify: `mobile/src/screens/customer-home-screen.tsx`
- Modify: `mobile/src/screens/captain-home-screen.tsx`
- Modify: `mobile/src/screens/__tests__/customer-home-screen.test.tsx`
- Modify: `mobile/src/screens/__tests__/captain-home-screen.test.tsx`

- [x] Add failing assertions for the floating glass variant and shared active-navigation surface.
- [x] Apply the floating glass contract to both bottom navigations.
- [x] Preserve flexible narrow-screen sizing, tab roles, selection state, and labels.
- [x] Run both home screen suites.

### Task 4: Welcome And Authentication Polish

**Files:**

- Modify: `mobile/src/screens/welcome-screen.tsx`
- Modify: `mobile/src/components/auth-screen-kit.tsx`
- Modify: `mobile/src/screens/__tests__/welcome-screen.test.tsx`
- Modify: `mobile/src/components/__tests__/auth-screen-kit.test.tsx`

- [x] Add failing assertions for polished strong cards and primary action hierarchy.
- [x] Refine brand, promise, role, form, and note surfaces using semantic tokens.
- [x] Preserve first-viewport simplicity, RTL, input behavior, and existing actions.
- [x] Run welcome and authentication tests.

### Task 5: Customer Experience Polish

**Files:**

- Modify: `mobile/src/screens/customer-home-screen.tsx`
- Modify: `mobile/src/screens/__tests__/customer-home-screen.test.tsx`

- [x] Add focused tests for the ride launcher, selected options, booking review, tracking, trips, search, and profile surface hierarchy.
- [x] Replace repeated one-off visual values with semantic tokens where they improve consistency.
- [x] Keep the booking flow, mock data, accessibility roles, and responsive contract unchanged.
- [x] Run the complete customer screen suite.

### Task 6: Captain Experience Polish

**Files:**

- Modify: `mobile/src/screens/captain-home-screen.tsx`
- Modify: `mobile/src/screens/captain-active-trip-screen.tsx`
- Modify: `mobile/src/screens/__tests__/captain-home-screen.test.tsx`

- [x] Add focused tests for nearest-request, details, active-trip, earnings, and profile hierarchy.
- [x] Apply semantic card, control, selected-state, and status treatments.
- [x] Preserve the focused home, accept/decline flow, realtime placement, and trip progression.
- [x] Run the complete captain screen suite.

### Task 7: Map Surface Polish

**Files:**

- Modify: `mobile/src/components/mock-route-map.tsx`
- Modify: `mobile/src/components/captain-route-map.tsx`
- Modify: `mobile/src/components/__tests__/route-map-performance.test.ts`

- [ ] Add failing assertions for semantic map surface, route glow, marker surface, and memoized comparator behavior.
- [ ] Clarify road hierarchy, route contrast, marker depth, and overlays using existing primitives.
- [ ] Keep map components memoized and avoid continuous animation.
- [ ] Run route-map performance and customer/captain screen tests.

### Task 8: Full Visual Regression Gate

**Files:**

- Verify all phase files inside `mobile/`.

- [ ] Run `npm.cmd --prefix mobile run lint`.
- [ ] Run `npm.cmd --prefix mobile run check`.
- [ ] Run `npm.cmd --prefix mobile test -- --runInBand --silent`.
- [ ] Run Prettier on every phase file.
- [ ] Run `git diff --check -- mobile`, `git status --short`, and `git diff --stat -- mobile`.
- [ ] Verify the app in Expo Go on a physical Android device when available.
- [ ] Report results without committing or pushing.
