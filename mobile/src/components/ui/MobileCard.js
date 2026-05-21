import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function MobileCard({ children, tone = "default", style }) {
  return <View style={[styles.card, tone === "soft" && styles.soft, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm
  },
  soft: {
    backgroundColor: colors.surfaceSoft
  }
});
