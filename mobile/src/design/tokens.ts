export const colors = {
  background: "#070B14",
  graphite: "#0D1320",
  graphiteRaised: "#121A2B",
  surface: "rgba(16, 24, 41, 0.74)",
  surfaceStrong: "rgba(20, 31, 54, 0.88)",
  surfaceSoft: "rgba(255, 255, 255, 0.06)",
  border: "rgba(147, 177, 255, 0.18)",
  borderStrong: "rgba(92, 126, 255, 0.34)",
  text: "#F6F8FF",
  textSoft: "#C8D1EA",
  textMuted: "#8C99BA",
  cyan: "#00E5FF",
  blue: "#4D75FF",
  violet: "#8B5CF6",
  violetSoft: "#C7B7FF",
  success: "#33E7A8",
  warning: "#FFD166",
  danger: "#FF6B8A"
} as const;

export const gradients = {
  app: [colors.background, "#09111F", "#101426"] as const,
  primary: [colors.violet, colors.blue, colors.cyan] as const,
  cyanGlow: ["rgba(0, 229, 255, 0.34)", "rgba(0, 229, 255, 0)"] as const,
  card: ["rgba(22, 32, 56, 0.86)", "rgba(9, 14, 26, 0.78)"] as const
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  pill: 999
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
} as const;

export const typography = {
  title: 28,
  section: 18,
  body: 15,
  compact: 13,
  tiny: 11
} as const;
