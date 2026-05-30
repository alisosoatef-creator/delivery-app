export const colors = {
  background: "#040308",
  backgroundAlt: "#090611",
  graphite: "#12101a",
  ink: "#020105",
  surface: "rgba(14, 12, 23, 0.96)",
  surfaceStrong: "#17131f",
  surfaceSoft: "rgba(24, 20, 34, 0.92)",
  surfaceGlass: "rgba(255, 255, 255, 0.065)",
  elevated: "rgba(31, 25, 45, 0.94)",
  border: "rgba(255, 255, 255, 0.09)",
  borderStrong: "rgba(145, 116, 255, 0.42)",
  text: "#fbf9ff",
  textSoft: "#e6def8",
  muted: "#aa9ebc",
  mutedStrong: "#74697f",
  primary: "#a682ff",
  primaryDeep: "#5c3bd6",
  cyan: "#76d9ff",
  blue: "#7687ff",
  violet: "#c5a6ff",
  magenta: "#ff6bd3",
  indigo: "#6b62ff",
  accent: "#f6c36f",
  accentSoft: "#ffe3ad",
  gold: "#f6c36f",
  goldDeep: "#7d5928",
  amber: "#f6c36f",
  green: "#42e79d",
  greenDeep: "#0d7751",
  red: "#ff687a",
  redDeep: "#742632",
  black: "#020305",
  white: "#ffffff"
};

export const gradients = {
  app: ["#040308", "#0a0712", "#11091d"],
  hero: ["rgba(166, 130, 255, 0.2)", "rgba(255, 107, 211, 0.08)", "rgba(118, 135, 255, 0.1)"],
  primary: ["#a682ff", "#ff6bd3"],
  gold: ["#ffe3ad", "#f6c36f"],
  danger: ["#ff8f9d", "#d84c5c"],
  driver: ["rgba(166, 130, 255, 0.14)", "rgba(66, 231, 157, 0.1)"]
};

export const radii = {
  xs: 10,
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
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  xxl: 38
};

export const typography = {
  hero: 31,
  display: 26,
  title: 21,
  section: 16,
  body: 14,
  caption: 11
};

export const shadows = {
  soft: "0 12px 28px rgba(0, 0, 0, 0.32)",
  lift: "0 22px 54px rgba(0, 0, 0, 0.48)",
  glow: "0 18px 44px rgba(166, 130, 255, 0.16)",
  glowStrong: "0 26px 62px rgba(166, 130, 255, 0.25)",
  accentGlow: "0 18px 42px rgba(246, 195, 111, 0.17)",
  dangerGlow: "0 18px 42px rgba(255, 104, 122, 0.14)"
};

export const depth = {
  hairline: "rgba(255, 255, 255, 0.07)",
  glassLine: "rgba(255, 255, 255, 0.15)",
  violetLine: "rgba(166, 130, 255, 0.3)",
  magentaLine: "rgba(255, 107, 211, 0.2)",
  amberLine: "rgba(246, 195, 111, 0.28)",
  greenLine: "rgba(66, 231, 157, 0.24)"
};

export const nav = {
  dock: "rgba(8, 6, 13, 0.94)",
  dockBorder: "rgba(255, 255, 255, 0.12)",
  active: "rgba(166, 130, 255, 0.18)",
  activeLine: "#c5a6ff"
};

export const card = {
  hero: "rgba(166, 130, 255, 0.1)",
  action: "rgba(246, 195, 111, 0.11)",
  compact: "rgba(255, 255, 255, 0.045)",
  glass: "rgba(255, 255, 255, 0.072)",
  command: "rgba(15, 12, 24, 0.98)"
};

export const button = {
  primary: "#a682ff",
  accent: "#f6c36f",
  secondary: "rgba(255, 255, 255, 0.075)"
};

export const chip = {
  idle: "rgba(255, 255, 255, 0.06)",
  active: "rgba(166, 130, 255, 0.18)"
};

export const badge = {
  info: "rgba(166, 130, 255, 0.15)",
  success: "rgba(66, 231, 157, 0.14)",
  warning: "rgba(246, 195, 111, 0.15)",
  danger: "rgba(255, 104, 122, 0.14)"
};

export const map = {
  frame: "rgba(8, 7, 13, 0.98)",
  overlay: "rgba(5, 4, 10, 0.78)",
  route: "#c5a6ff",
  driver: "#f6c36f"
};

export const motion = {
  pressScale: 0.965,
  fast: 130,
  normal: 220,
  springFriction: 7
};

export const layout = {
  screenPadding: spacing.md,
  bottomNavHeight: 58,
  screenBottomPadding: 124
};

export const brand = {
  appName: "وصل",
  tagline: "تنقل ذكي في الضفة الغربية"
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
