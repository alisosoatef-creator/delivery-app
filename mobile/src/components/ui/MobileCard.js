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
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    boxShadow: shadows.soft
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  gold: {
    backgroundColor: "rgba(231, 195, 111, 0.12)",
    borderColor: colors.borderStrong,
    boxShadow: shadows.glow
  },
  danger: {
    backgroundColor: "rgba(255, 111, 124, 0.11)",
    borderColor: "rgba(255, 111, 124, 0.36)"
  },
  flat: {
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  }
});
