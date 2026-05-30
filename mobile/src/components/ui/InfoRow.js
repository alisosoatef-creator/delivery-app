import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, spacing } from "../../utils/mobileTheme";

export function InfoRow({ label, value, accent = false }) {
  return (
    <View style={styles.row}>
      <Text selectable numberOfLines={2} ellipsizeMode="tail" style={styles.value}>{value ?? "-"}</Text>
      <Text selectable numberOfLines={1} ellipsizeMode="tail" style={[styles.label, accent && styles.accent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    borderBottomWidth: 1,
    borderBottomColor: depth.hairline
  },
  label: { color: colors.muted, fontWeight: "800", textAlign: "right", writingDirection: "rtl", maxWidth: "42%" },
  accent: { color: colors.primary },
  value: { color: colors.text, fontWeight: "900", textAlign: "left", writingDirection: "rtl", flexShrink: 1, maxWidth: "58%" }
});
