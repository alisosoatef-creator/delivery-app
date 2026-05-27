export const colors = {
  background: "#06090c",
  backgroundAlt: "#0a0f13",
  graphite: "#10161b",
  surface: "rgba(14, 21, 26, 0.96)",
  surfaceStrong: "#111a20",
  surfaceSoft: "rgba(20, 30, 36, 0.88)",
  surfaceGlass: "rgba(255, 255, 255, 0.052)",
  border: "rgba(255, 255, 255, 0.085)",
  borderStrong: "rgba(42, 218, 206, 0.28)",
  text: "#f7fbfb",
  textSoft: "#d5e0e2",
  muted: "#8c9aa0",
  mutedStrong: "#5e6b71",
  primary: "#2adace",
  primaryDeep: "#087b76",
  accent: "#ddb062",
  accentSoft: "#f1d59c",
  gold: "#ddb062",
  goldDeep: "#80623a",
  amber: "#ddb062",
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
  app: ["#06090c", "#0a1014", "#0f181d"],
  primary: ["#2adace", "#5fa9ff"],
  gold: ["#f1d59c", "#ddb062"],
  danger: ["#ff8a95", "#d84c5c"]
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 19,
  xl: 24,
  pill: 999
};

export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 9,
  md: 13,
  lg: 18,
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
  soft: "0 10px 24px rgba(0, 0, 0, 0.28)",
  lift: "0 14px 34px rgba(0, 0, 0, 0.36)",
  glow: "0 14px 32px rgba(42, 218, 206, 0.105)",
  accentGlow: "0 14px 32px rgba(221, 176, 98, 0.11)"
};

export const layout = {
  screenPadding: spacing.md,
  bottomNavHeight: 54,
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
