import { StyleSheet, Text, View } from "react-native";
import { brand, colors, radii, shadows, spacing } from "../../utils/mobileTheme";

export function BrandMark({ compact = false, align = "right" }) {
  return (
    <View style={[styles.wrap, align === "center" && styles.center]}>
      <View style={[styles.logo, compact && styles.logoCompact]}>
        <Text selectable={false} style={[styles.logoText, compact && styles.logoTextCompact]}>و</Text>
      </View>
      <View style={[styles.copy, align === "center" && styles.copyCenter]}>
        <Text selectable style={[styles.name, compact && styles.nameCompact]}>{brand.appName}</Text>
        {!compact ? <Text selectable style={styles.tagline}>{brand.tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  center: { justifyContent: "center" },
  logo: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    boxShadow: shadows.glow
  },
  logoCompact: { width: 36, height: 36, borderRadius: radii.sm },
  logoText: { color: "#031315", fontSize: 24, fontWeight: "900" },
  logoTextCompact: { fontSize: 19 },
  copy: { alignItems: "flex-end", gap: 1 },
  copyCenter: { alignItems: "center" },
  name: { color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "right" },
  nameCompact: { fontSize: 18 },
  tagline: { color: colors.muted, fontSize: 12, fontWeight: "600", textAlign: "right" }
});
