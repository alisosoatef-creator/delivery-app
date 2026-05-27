import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../utils/mobileTheme";

export function MobileCard({ children, tone = "default", style }) {
  return (
    <View
      style={[
        styles.card,
        tone === "soft" && styles.soft,
        tone === "gold" && styles.gold,
        tone === "danger" && styles.danger,
        tone === "flat" && styles.flat,
        tone === "hero" && styles.hero,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    boxShadow: shadows.soft
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  gold: {
    backgroundColor: "rgba(42, 218, 206, 0.085)",
    borderColor: colors.borderStrong,
    boxShadow: shadows.glow
  },
  danger: {
    backgroundColor: "rgba(255, 111, 124, 0.11)",
    borderColor: "rgba(255, 111, 124, 0.36)"
  },
  flat: {
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    backgroundColor: "rgba(255, 255, 255, 0.038)"
  },
  hero: {
    backgroundColor: "rgba(41, 213, 201, 0.085)",
    borderColor: "rgba(41, 213, 201, 0.24)",
    boxShadow: shadows.glow
  }
});
