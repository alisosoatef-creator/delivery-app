# Wasel Premium Balanced Polish Design

## Goal

Upgrade the existing mock mobile experience into a cohesive premium product while preserving the approved Wasel identity, current flows, Arabic RTL behavior, Expo Go compatibility, and mock-only architecture.

## Approved Direction

The approved visual direction is `B - Premium Balanced`.

This direction combines:

- Deep navy and graphite surfaces.
- Clearly layered frosted glass without making every surface glow.
- Cyan, blue, and violet accents used for hierarchy rather than decoration.
- Strong primary actions with restrained depth and light.
- Compact floating navigation with a calm active state.
- Premium map surfaces with a readable route and limited glow.
- Clean RTL typography, spacing, and information density.

The result must feel luxurious and futuristic while remaining calm, practical, and easy to scan.

## Design Principles

### 1. Controlled Depth

- Use three intentional elevation levels: base surface, card, and floating surface.
- Standard cards use soft depth and a low-contrast border.
- Strong cards use a slightly brighter top edge and deeper surface.
- Floating navigation and critical overlays use the strongest shadow.
- Do not place decorative glow around every card.

### 2. Precise Glass

- Keep `default`, `strong`, and `subtle` glass variants.
- Give every variant a distinct background, border, blur, and shadow purpose.
- Add a restrained internal highlight to strong glass.
- Keep subtle glass quiet enough for secondary information.
- Preserve readable contrast when blur support varies on Android.

### 3. Focused Accent Use

- Cyan indicates active location, routes, realtime, and selected navigation.
- Blue supports primary action depth and operational states.
- Violet identifies premium or secondary emphasis.
- Green remains reserved for success, readiness, and safety.
- Avoid full neon borders and broad cyan outlines.

### 4. Clear Action Hierarchy

- Primary buttons are the strongest interactive element.
- Primary buttons use the approved violet-to-blue-to-cyan gradient.
- Secondary buttons use a quiet glass surface and clear border.
- Disabled and pressed states remain readable.
- Important actions may use light haptic feedback, but routine controls stay restrained.

### 5. Calm Information Density

- Keep page headings and primary decisions visually dominant.
- Reduce unnecessary competing borders inside cards.
- Use compact labels and stronger values for metrics.
- Maintain predictable vertical rhythm between sections.
- Do not add new cards merely for decoration.

## Shared Visual System

### Color And Surface Tokens

The design system will receive semantic surface tokens instead of scattered one-off values:

- App background layers.
- Default, strong, subtle, and floating glass surfaces.
- Soft and strong borders.
- Internal top highlights.
- Primary, floating, map, and active-control shadows.

Existing Wasel colors remain the source palette.

### Radius System

- Small controls: compact radius.
- Buttons and compact panels: medium radius.
- Primary cards and map surfaces: large radius.
- Pills only for statuses, filters, and compact badges.

Cards must remain professional and should not become overly rounded.

### Spacing Rhythm

- Keep the existing spacing scale.
- Standard card padding uses one consistent value.
- Dense cards use the compact spacing value.
- Section gaps follow a predictable compact or standard rhythm.
- Floating navigation remains visually separated from page content.

### Typography

- Preserve Arabic RTL alignment and current font family.
- Page titles remain strong but not oversized.
- Section titles use compact premium hierarchy.
- Labels remain muted and values remain high contrast.
- Numeric values continue using tabular figures where useful.
- Letter spacing remains zero.

## Component Polish

### GlassCard

- Retain the existing API and variants.
- Add variant-specific shadows and internal highlights.
- Use continuous curves where supported.
- Keep pointer events disabled for decorative gradient layers.
- Avoid changing layout behavior or card ownership.

### PremiumButton

- Strengthen primary button depth and edge definition.
- Add a restrained top highlight.
- Improve the secondary button surface.
- Preserve motion, accessibility, hit targets, and current labels.
- Keep text on one line where possible with safe scaling.

### MotionPressable

- Preserve the current fast press response.
- Keep reduced-motion support.
- Avoid bounce-heavy or slow animations.
- Use opacity and scale subtly enough to maintain a production feel.

### Floating Bottom Navigation

- Use the strongest floating glass treatment.
- Reduce the active state to a clean cyan-blue surface.
- Keep inactive labels readable but quiet.
- Maintain compact sizing and flexible narrow-screen behavior.
- Do not add a moving oversized background or heavy neon outline.

## Screen Treatment

### Welcome And Authentication

- Refine the brand mark, promise card, form card, and primary action hierarchy.
- Keep the first viewport calm and centered.
- Avoid adding marketing sections or extra explanatory content.

### Customer Experience

- Make the focused ride launcher the visual anchor.
- Keep `اطلب رحلة` as the strongest control.
- Polish booking steps with consistent selected states, metrics, and review surfaces.
- Keep payment, search, tracking, trips, and profile visually related.

### Captain Experience

- Make the nearest request card the visual anchor.
- Keep fare, route, ETA, and actions immediately scannable.
- Polish details, active trip, earnings, and profile without restoring removed dashboard clutter.

### Maps

- Retain the dark map-first presentation.
- Clarify road hierarchy and route contrast.
- Use one controlled route glow.
- Improve marker surfaces and status overlays.
- Avoid decorative map noise or multiple competing glows.

## Motion

- Keep motion durations short and consistent.
- Use entrance motion only for meaningful state transitions.
- Preserve reduced-motion behavior.
- Avoid continuous decorative animation.
- The visual system must remain smooth on common Android devices before targeting high-refresh displays.

## Accessibility And Responsiveness

- Preserve the phase 34 responsive layout contract.
- Preserve the phase 35 roles, live regions, radio states, checkbox states, map descriptions, and touch targets.
- Maintain readable contrast for muted text and secondary controls.
- Keep important text visible on 320px-wide Android screens.

## Performance Constraints

- Do not introduce Skia, Lottie, new native dependencies, or custom builds.
- Keep Expo SDK 54 and Expo Go compatibility.
- Prefer token and shared-component changes over repeated screen-specific effects.
- Do not add expensive animated blur or continuous shadow animation.
- Retain memoized map components.

## Testing

Tests must verify:

- The approved premium tokens exist.
- Glass variants retain distinct visual contracts.
- Primary and secondary buttons use the intended hierarchy.
- Customer and captain floating navigation use the shared floating treatment.
- Existing accessibility, responsive, motion, customer, captain, and app-entry tests remain green.
- TypeScript, ESLint, Prettier, and Jest all pass.

## Out Of Scope

- API integration.
- Real maps or GPS.
- New navigation architecture.
- New app flows or screens.
- Payment provider integration.
- New visual libraries or native dependencies.
- Pixel-perfect recreation of the reference image.
- Heavy neon borders, random blobs, and decorative clutter.

## Success Criteria

The completed polish should make every screen feel like one production product:

- Stronger depth without visual noise.
- Clearer primary actions.
- More consistent cards and controls.
- Better map readability.
- Cleaner floating navigation.
- Smooth, restrained interactions.
- No regressions in flow, accessibility, responsiveness, or Expo Go support.
