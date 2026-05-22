export const colors = {
  background: "#05070c",
  backgroundAlt: "#090d16",
  surface: "rgba(17, 23, 34, 0.92)",
  surfaceStrong: "#101827",
  surfaceSoft: "rgba(26, 35, 51, 0.82)",
  surfaceGlass: "rgba(255, 255, 255, 0.082)",
  border: "rgba(255, 255, 255, 0.115)",
  borderStrong: "rgba(245, 210, 128, 0.44)",
  text: "#fff9ed",
  textSoft: "#e6eef8",
  muted: "#9ca9bd",
  mutedStrong: "#6f7b90",
  gold: "#f0c76f",
  goldDeep: "#9f7131",
  amber: "#ffbc55",
  green: "#48ebb0",
  greenDeep: "#168b62",
  red: "#ff6f7c",
  redDeep: "#6d2630",
  blue: "#7fb0ff",
  cyan: "#61e7ff",
  violet: "#b894ff",
  black: "#020305"
};

export const gradients = {
  app: ["#05070c", "#0b1220", "#172036"],
  gold: ["#fff0bd", "#f0c76f", "#a66f2f"],
  ocean: ["#61e7ff", "#7fb0ff", "#6c63ff"],
  danger: ["#ff8a95", "#d84c5c"]
};

export const radii = {
  xs: 10,
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32
};

export const typography = {
  hero: 36,
  title: 26,
  section: 19,
  body: 15,
  caption: 12
};

export const shadows = {
  soft: "0 18px 42px rgba(0, 0, 0, 0.38)",
  lift: "0 22px 52px rgba(0, 0, 0, 0.46)",
  glow: "0 22px 54px rgba(240, 199, 111, 0.18)",
  blueGlow: "0 20px 48px rgba(127, 176, 255, 0.15)"
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
