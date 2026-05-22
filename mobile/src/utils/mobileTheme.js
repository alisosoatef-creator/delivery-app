export const colors = {
  background: "#06070b",
  backgroundAlt: "#0a0d14",
  surface: "rgba(17, 23, 34, 0.92)",
  surfaceStrong: "#121928",
  surfaceSoft: "rgba(26, 35, 51, 0.82)",
  surfaceGlass: "rgba(255, 255, 255, 0.075)",
  border: "rgba(255, 255, 255, 0.105)",
  borderStrong: "rgba(235, 203, 139, 0.38)",
  text: "#fff8ea",
  textSoft: "#dce4ef",
  muted: "#97a3b7",
  mutedStrong: "#6f7b90",
  gold: "#e7c36f",
  goldDeep: "#9f7131",
  amber: "#ffb44c",
  green: "#43e6a2",
  greenDeep: "#168b62",
  red: "#ff6f7c",
  redDeep: "#6d2630",
  blue: "#7fb0ff",
  cyan: "#61e7ff",
  violet: "#b894ff",
  black: "#020305"
};

export const gradients = {
  app: ["#06070b", "#0b1220", "#111827"],
  gold: ["#ffe6a1", "#d79d3d"],
  ocean: ["#3ed5ff", "#5e78ff"],
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
  hero: 34,
  title: 26,
  section: 19,
  body: 15,
  caption: 12
};

export const shadows = {
  soft: "0 14px 32px rgba(0, 0, 0, 0.32)",
  glow: "0 18px 46px rgba(231, 195, 111, 0.16)",
  blueGlow: "0 18px 42px rgba(127, 176, 255, 0.14)"
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
