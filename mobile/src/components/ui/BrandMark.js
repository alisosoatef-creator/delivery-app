import { StyleSheet, Text, View } from "react-native";
import { brand, colors, radii, shadows, spacing } from "../../utils/mobileTheme";

export function BrandMark({ compact = false, align = "right" }) {
  return (
    <View style={[styles.wrap, align === "center" && styles.center]}>
      <View style={styles.logo}>
        <Text selectable={false} style={styles.logoText}>و</Text>
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
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    boxShadow: shadows.glow
  },
  logoText: { color: "#161006", fontSize: 28, fontWeight: "900" },
  copy: { alignItems: "flex-end", gap: 2 },
  copyCenter: { alignItems: "center" },
  name: { color: colors.text, fontSize: 28, fontWeight: "900", textAlign: "right" },
  nameCompact: { fontSize: 20 },
  tagline: { color: colors.muted, fontSize: 12, fontWeight: "800", textAlign: "right" }
});
