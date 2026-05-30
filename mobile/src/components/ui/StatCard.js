import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

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
    minWidth: 104,
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: "rgba(154, 105, 255, 0.11)",
    borderWidth: 1,
    borderColor: depth.violetLine,
    gap: 3,
    boxShadow: shadows.soft
  },
  blue: {
    backgroundColor: "rgba(111, 140, 255, 0.13)",
    borderColor: "rgba(111, 140, 255, 0.28)"
  },
  green: {
    backgroundColor: "rgba(68, 227, 157, 0.12)",
    borderColor: "rgba(68, 227, 157, 0.26)"
  },
  label: { color: colors.muted, fontSize: 11.5, fontWeight: "800", textAlign: "right" },
  value: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "right" },
  hint: { color: colors.muted, fontSize: 11, textAlign: "right" }
});
