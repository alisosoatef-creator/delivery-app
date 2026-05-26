export const colors = {
  background: "#070a0d",
  backgroundAlt: "#0b1015",
  graphite: "#11171d",
  surface: "rgba(17, 23, 29, 0.96)",
  surfaceStrong: "#131b22",
  surfaceSoft: "rgba(25, 34, 42, 0.86)",
  surfaceGlass: "rgba(255, 255, 255, 0.065)",
  border: "rgba(255, 255, 255, 0.105)",
  borderStrong: "rgba(49, 228, 214, 0.34)",
  text: "#f7fbfb",
  textSoft: "#d7e1e4",
  muted: "#91a0a6",
  mutedStrong: "#647277",
  primary: "#31e4d6",
  primaryDeep: "#0b958e",
  accent: "#f2b84b",
  accentSoft: "#ffe0a3",
  gold: "#f2b84b",
  goldDeep: "#946226",
  amber: "#f2b84b",
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
  app: ["#070a0d", "#0b1015", "#101a20"],
  primary: ["#31e4d6", "#75a7ff"],
  gold: ["#ffe0a3", "#f2b84b"],
  danger: ["#ff8a95", "#d84c5c"]
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999
};

export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28
};

export const typography = {
  hero: 30,
  title: 23,
  section: 17,
  body: 14,
  caption: 11
};

export const shadows = {
  soft: "0 12px 28px rgba(0, 0, 0, 0.34)",
  lift: "0 18px 42px rgba(0, 0, 0, 0.42)",
  glow: "0 16px 38px rgba(49, 228, 214, 0.12)",
  accentGlow: "0 16px 38px rgba(242, 184, 75, 0.13)"
};

export const layout = {
  screenPadding: spacing.md,
  bottomNavHeight: 62,
  screenBottomPadding: 122
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
