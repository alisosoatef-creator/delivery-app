import { StyleSheet, Text, View } from "react-native";
import { brand, colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function BrandMark({ compact = false, align = "right", title, subtitle }) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, align === "center" && styles.center]}>
      <View style={[styles.logo, compact && styles.logoCompact]}>
        <View style={styles.logoGlow} />
        <Text selectable={false} style={[styles.logoText, compact && styles.logoTextCompact]}>و</Text>
      </View>
      <View style={[styles.copy, align === "center" && styles.copyCenter]}>
        <View style={styles.nameRow}>
          <Text selectable style={[styles.name, compact && styles.nameCompact]}>{title || brand.appName}</Text>
          <View style={styles.signal} />
        </View>
        {!compact ? <Text selectable style={styles.tagline}>{subtitle || brand.tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  wrapCompact: { gap: spacing.xs },
  center: { justifyContent: "center" },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(154, 105, 255, 0.16)",
    borderWidth: 1,
    borderColor: depth.violetLine,
    overflow: "hidden",
    boxShadow: shadows.glowStrong
  },
  logoGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 91, 200, 0.12)",
    transform: [{ translateX: -18 }, { translateY: -16 }]
  },
  logoCompact: { width: 34, height: 34, borderRadius: radii.md },
  logoText: { color: colors.text, fontSize: 25, fontWeight: "900" },
  logoTextCompact: { fontSize: 18 },
  copy: { alignItems: "flex-end", gap: 2 },
  copyCenter: { alignItems: "center" },
  nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs },
  name: { color: colors.text, fontSize: 25, fontWeight: "900", textAlign: "right", letterSpacing: 0 },
  nameCompact: { fontSize: 18 },
  signal: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.primary, boxShadow: "0 0 14px rgba(154, 105, 255, 0.62)" },
  tagline: { color: colors.textSoft, fontSize: 11.5, fontWeight: "700", textAlign: "right" }
});
