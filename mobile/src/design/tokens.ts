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

export const accents = {
  primary: [colors.violet, colors.blue, colors.cyan] as const,
  cyan: colors.cyan,
  blue: colors.blue,
  violet: colors.violet
} as const;

export const gradients = {
  app: [colors.background, "#09111F", "#101426"] as const,
  primary: accents.primary,
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

export const glass = {
  default: {
    blurIntensity: 30,
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  strong: {
    blurIntensity: 38,
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.borderStrong
  },
  subtle: {
    blurIntensity: 22,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(147, 177, 255, 0.12)"
  }
} as const;

export const shadows = {
  card: "0 14px 38px rgba(0, 0, 0, 0.34)",
  floating: "0 18px 48px rgba(0, 0, 0, 0.42)",
  glowCyan: "0 0 16px rgba(0, 229, 255, 0.78)"
} as const;

export const touchTargets = {
  minimum: 44,
  comfortable: 52,
  navItem: 56
} as const;

export const mapStyle = {
  background: ["#101A2D", "#07101F"] as const,
  road: "rgba(92, 126, 255, 0.42)",
  route: colors.cyan,
  routeGlow: "rgba(0, 229, 255, 0.78)",
  markerSurface: "rgba(13, 19, 32, 0.82)"
} as const;

export const rtl = {
  textAlign: "right" as const,
  writingDirection: "rtl" as const
} as const;

export const waselVisualDirection = {
  theme: "luxury-futuristic-rtl",
  currency: "شيكل",
  background: ["deep navy", "graphite"] as const,
  required: [
    "glassmorphism",
    "map-first",
    "compact floating bottom nav",
    "Arabic RTL",
    "premium clean cards",
    "cyan blue violet accents"
  ] as const,
  forbidden: [
    "ride types",
    "heavy neon borders",
    "random blobs",
    "old prototype look",
    "backend coupling in mock phase"
  ] as const
} as const;
