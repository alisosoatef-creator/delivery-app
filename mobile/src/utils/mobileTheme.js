export const colors = {
  background: "#05080b",
  backgroundAlt: "#091016",
  graphite: "#0e151b",
  surface: "rgba(12, 19, 25, 0.96)",
  surfaceStrong: "#0f1921",
  surfaceSoft: "rgba(18, 28, 36, 0.9)",
  surfaceGlass: "rgba(255, 255, 255, 0.058)",
  border: "rgba(255, 255, 255, 0.075)",
  borderStrong: "rgba(41, 213, 201, 0.25)",
  text: "#f7fbfb",
  textSoft: "#d9e5e7",
  muted: "#91a0a6",
  mutedStrong: "#65747b",
  primary: "#29d5c9",
  primaryDeep: "#08736f",
  accent: "#d8ad62",
  accentSoft: "#efd49a",
  gold: "#d8ad62",
  goldDeep: "#765b35",
  amber: "#d8ad62",
  green: "#42e79c",
  greenDeep: "#11764f",
  red: "#ff6f7c",
  redDeep: "#6d2630",
  blue: "#75a7ff",
  cyan: "#31e4d6",
  violet: "#a78bfa",
  black: "#020405"
};

export const gradients = {
  app: ["#05080b", "#081017", "#0e171e"],
  primary: ["#29d5c9", "#58a9ff"],
  gold: ["#efd49a", "#d8ad62"],
  danger: ["#ff8a95", "#d84c5c"]
};

export const radii = {
  xs: 8,
  sm: 13,
  md: 16,
  lg: 21,
  xl: 26,
  pill: 999
};

export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 10,
  md: 14,
  lg: 19,
  xl: 24
};

export const typography = {
  hero: 27,
  title: 21,
  section: 16,
  body: 14,
  caption: 11
};

export const shadows = {
  soft: "0 12px 26px rgba(0, 0, 0, 0.30)",
  lift: "0 18px 42px rgba(0, 0, 0, 0.38)",
  glow: "0 16px 34px rgba(41, 213, 201, 0.12)",
  accentGlow: "0 14px 32px rgba(216, 173, 98, 0.10)"
};

export const layout = {
  screenPadding: spacing.md,
  bottomNavHeight: 50,
  screenBottomPadding: 106
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
