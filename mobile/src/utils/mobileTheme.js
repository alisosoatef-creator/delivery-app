export const colors = {
  background: "#05030b",
  backgroundAlt: "#0c0716",
  graphite: "#100b1b",
  ink: "#030207",
  surface: "rgba(14, 10, 24, 0.94)",
  surfaceStrong: "#130d21",
  surfaceSoft: "rgba(22, 15, 36, 0.9)",
  surfaceGlass: "rgba(255, 255, 255, 0.07)",
  elevated: "rgba(28, 18, 47, 0.92)",
  border: "rgba(255, 255, 255, 0.088)",
  borderStrong: "rgba(154, 105, 255, 0.38)",
  text: "#fbf8ff",
  textSoft: "#e4dcff",
  muted: "#a79bbd",
  mutedStrong: "#746985",
  primary: "#9a69ff",
  primaryDeep: "#5934b8",
  cyan: "#74d6ff",
  blue: "#6d7dff",
  violet: "#bd8cff",
  magenta: "#ff5bc8",
  indigo: "#635bff",
  accent: "#f3b86a",
  accentSoft: "#ffe0aa",
  gold: "#f3b86a",
  goldDeep: "#7e592d",
  amber: "#f3b86a",
  green: "#44e39d",
  greenDeep: "#0e7951",
  red: "#ff6475",
  redDeep: "#742632",
  black: "#010305"
};

export const gradients = {
  app: ["#05030b", "#0b0614", "#120a22"],
  hero: ["rgba(154, 105, 255, 0.22)", "rgba(255, 91, 200, 0.10)", "rgba(99, 91, 255, 0.12)"],
  primary: ["#9a69ff", "#ff5bc8"],
  gold: ["#ffe0aa", "#f3b86a"],
  danger: ["#ff8a98", "#d84c5c"],
  driver: ["rgba(154, 105, 255, 0.17)", "rgba(68, 227, 157, 0.09)"]
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
  glow: "0 18px 46px rgba(154, 105, 255, 0.18)",
  glowStrong: "0 24px 58px rgba(154, 105, 255, 0.28)",
  accentGlow: "0 18px 42px rgba(243, 184, 106, 0.16)",
  dangerGlow: "0 18px 42px rgba(255, 100, 117, 0.14)"
};

export const depth = {
  hairline: "rgba(255, 255, 255, 0.06)",
  glassLine: "rgba(255, 255, 255, 0.14)",
  violetLine: "rgba(154, 105, 255, 0.28)",
  magentaLine: "rgba(255, 91, 200, 0.22)",
  amberLine: "rgba(243, 184, 106, 0.25)"
};

export const nav = {
  dock: "rgba(6, 4, 12, 0.9)",
  dockBorder: "rgba(255, 255, 255, 0.12)",
  active: "rgba(154, 105, 255, 0.17)",
  activeLine: "#bd8cff"
};

export const card = {
  hero: "rgba(154, 105, 255, 0.105)",
  action: "rgba(243, 184, 106, 0.105)",
  compact: "rgba(255, 255, 255, 0.045)",
  glass: "rgba(255, 255, 255, 0.074)"
};

export const button = {
  primary: "#9a69ff",
  accent: "#f3b86a",
  secondary: "rgba(255, 255, 255, 0.075)"
};

export const chip = {
  idle: "rgba(255, 255, 255, 0.055)",
  active: "rgba(154, 105, 255, 0.18)"
};

export const badge = {
  info: "rgba(154, 105, 255, 0.15)",
  success: "rgba(68, 227, 157, 0.14)",
  warning: "rgba(243, 184, 106, 0.15)",
  danger: "rgba(255, 100, 117, 0.14)"
};

export const map = {
  frame: "rgba(9, 5, 17, 0.96)",
  overlay: "rgba(6, 3, 13, 0.76)",
  route: "#bd8cff",
  driver: "#f3b86a"
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
