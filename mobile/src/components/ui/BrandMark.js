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
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    boxShadow: shadows.glow
  },
  logoCompact: { width: 32, height: 32, borderRadius: radii.xs },
  logoText: { color: "#031315", fontSize: 22, fontWeight: "900" },
  logoTextCompact: { fontSize: 17 },
  copy: { alignItems: "flex-end", gap: 1 },
  copyCenter: { alignItems: "center" },
  name: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "right" },
  nameCompact: { fontSize: 17 },
  tagline: { color: colors.muted, fontSize: 11.5, fontWeight: "700", textAlign: "right" }
});
