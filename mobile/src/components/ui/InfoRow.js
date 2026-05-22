import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../utils/mobileTheme";

export function InfoRow({ label, value, accent = false }) {
  return (
    <View style={styles.row}>
      <Text selectable style={styles.value}>{value ?? "-"}</Text>
      <Text selectable style={[styles.label, accent && styles.accent]}>{label}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.065)"
  },
  label: { color: colors.muted, fontWeight: "800", textAlign: "right" },
  accent: { color: colors.gold },
  value: { color: colors.text, fontWeight: "900", textAlign: "left", flexShrink: 1 }
});
