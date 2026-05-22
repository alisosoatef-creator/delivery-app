import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function StatCard({ label, value, hint, tone = "gold" }) {
  return (
    <View style={[styles.card, tone === "blue" && styles.blue, tone === "green" && styles.green]}>
      <Text selectable style={styles.label}>{label}</Text>
      <Text selectable style={styles.value}>{value}</Text>
      {hint ? <Text selectable style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 136,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(231, 195, 111, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(231, 195, 111, 0.3)",
    gap: spacing.xs
  },
  blue: {
    backgroundColor: "rgba(127, 176, 255, 0.12)",
    borderColor: "rgba(127, 176, 255, 0.28)"
  },
  green: {
    backgroundColor: "rgba(67, 230, 162, 0.1)",
    borderColor: "rgba(67, 230, 162, 0.26)"
  },
  label: { color: colors.muted, fontSize: 12, fontWeight: "800", textAlign: "right" },
  value: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" },
  hint: { color: colors.muted, fontSize: 12, textAlign: "right" }
});
