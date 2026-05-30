import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function StatCard({ label, value, hint, tone = "gold" }) {
  return (
    <View style={[styles.card, tone === "blue" && styles.blue, tone === "green" && styles.green, tone === "warning" && styles.warning]}>
      <Text selectable numberOfLines={1} ellipsizeMode="tail" style={styles.label}>{label}</Text>
      <Text selectable numberOfLines={1} ellipsizeMode="tail" style={styles.value}>{value}</Text>
      {hint ? <Text selectable numberOfLines={2} ellipsizeMode="tail" style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 104,
    minHeight: 88,
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: "rgba(246, 195, 111, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(246, 195, 111, 0.25)",
    boxShadow: shadows.soft,
    gap: 3
  },
  blue: {
    backgroundColor: "rgba(118, 135, 255, 0.11)",
    borderColor: "rgba(118, 135, 255, 0.24)"
  },
  green: {
    backgroundColor: "rgba(66, 231, 157, 0.12)",
    borderColor: "rgba(66, 231, 157, 0.26)"
  },
  warning: {
    backgroundColor: "rgba(255, 104, 122, 0.1)",
    borderColor: "rgba(255, 104, 122, 0.25)"
  },
  label: { color: colors.muted, fontSize: 11.5, lineHeight: 15, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  value: { color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 15, textAlign: "right", writingDirection: "rtl" }
});
