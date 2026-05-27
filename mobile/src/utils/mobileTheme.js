export const colors = {
  background: "#020508",
  backgroundAlt: "#071018",
  graphite: "#0a1118",
  ink: "#03070b",
  surface: "rgba(9, 17, 25, 0.94)",
  surfaceStrong: "#0c1720",
  surfaceSoft: "rgba(14, 25, 35, 0.9)",
  surfaceGlass: "rgba(255, 255, 255, 0.072)",
  elevated: "rgba(18, 31, 42, 0.92)",
  border: "rgba(255, 255, 255, 0.088)",
  borderStrong: "rgba(37, 241, 225, 0.34)",
  text: "#f8ffff",
  textSoft: "#d8f0f1",
  muted: "#8da0a8",
  mutedStrong: "#66767e",
  primary: "#25f1e1",
  primaryDeep: "#068580",
  cyan: "#59c7ff",
  blue: "#6f8cff",
  violet: "#9878ff",
  accent: "#f0b85f",
  accentSoft: "#ffe0a1",
  gold: "#f0b85f",
  goldDeep: "#7d5a2b",
  amber: "#f0b85f",
  green: "#44e39d",
  greenDeep: "#0e7951",
  red: "#ff6475",
  redDeep: "#742632",
  black: "#010305"
};

export const gradients = {
  app: ["#020508", "#061019", "#0b1720"],
  hero: ["rgba(37, 241, 225, 0.20)", "rgba(111, 140, 255, 0.12)", "rgba(240, 184, 95, 0.07)"],
  primary: ["#25f1e1", "#59c7ff"],
  gold: ["#ffe0a1", "#f0b85f"],
  danger: ["#ff8a98", "#d84c5c"],
  driver: ["rgba(37, 241, 225, 0.16)", "rgba(68, 227, 157, 0.10)"]
};

export const radii = {
  xs: 9,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 36,
  pill: 999
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 11,
  md: 15,
  lg: 21,
  xl: 28,
  xxl: 36
};

export const typography = {
  hero: 30,
  display: 25,
  title: 21,
  section: 16,
  body: 14,
  caption: 11
};

export const shadows = {
  soft: "0 12px 26px rgba(0, 0, 0, 0.32)",
  lift: "0 22px 52px rgba(0, 0, 0, 0.46)",
  glow: "0 18px 46px rgba(37, 241, 225, 0.16)",
  glowStrong: "0 24px 58px rgba(37, 241, 225, 0.24)",
  accentGlow: "0 18px 42px rgba(240, 184, 95, 0.16)",
  dangerGlow: "0 18px 42px rgba(255, 100, 117, 0.14)"
};

export const depth = {
  hairline: "rgba(255, 255, 255, 0.06)",
  glassLine: "rgba(255, 255, 255, 0.14)",
  tealLine: "rgba(37, 241, 225, 0.24)",
  amberLine: "rgba(240, 184, 95, 0.26)"
};

export const nav = {
  dock: "rgba(2, 6, 10, 0.88)",
  dockBorder: "rgba(255, 255, 255, 0.12)",
  active: "rgba(37, 241, 225, 0.16)",
  activeLine: "#25f1e1"
};

export const card = {
  hero: "rgba(37, 241, 225, 0.105)",
  action: "rgba(240, 184, 95, 0.105)",
  compact: "rgba(255, 255, 255, 0.045)",
  glass: "rgba(255, 255, 255, 0.074)"
};

export const button = {
  primary: "#25f1e1",
  accent: "#f0b85f",
  secondary: "rgba(255, 255, 255, 0.075)"
};

export const chip = {
  idle: "rgba(255, 255, 255, 0.055)",
  active: "rgba(37, 241, 225, 0.17)"
};

export const badge = {
  info: "rgba(37, 241, 225, 0.14)",
  success: "rgba(68, 227, 157, 0.14)",
  warning: "rgba(240, 184, 95, 0.15)",
  danger: "rgba(255, 100, 117, 0.14)"
};

export const map = {
  frame: "rgba(4, 10, 15, 0.96)",
  overlay: "rgba(3, 8, 12, 0.72)",
  route: "#25f1e1",
  driver: "#f0b85f"
};

export const motion = {
  pressScale: 0.965,
  fast: 130,
  normal: 220,
  springFriction: 7
};

export const layout = {
  screenPadding: spacing.md,
  bottomNavHeight: 48,
  screenBottomPadding: 112
};

export const brand = {
  appName: "وصل",
  tagline: "مشاوير ذكية في الضفة الغربية"
};

export function money(value) {
  const numeric = Number(value || 0);
  return `${Number.isFinite(numeric) ? numeric.toFixed(numeric % 1 ? 1 : 0) : "0"} ₪`;
}

export function km(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "-";
  return `${numeric.toFixed(numeric >= 10 ? 1 : 2)} كم`;
}
