import { StyleSheet, Text, View } from "react-native";
import { badge, colors, depth, radii } from "../../utils/mobileTheme";

export function MobileBadge({ label, tone = "neutral" }) {
  return (
    <View
      style={[
        styles.badge,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "danger" && styles.danger,
        tone === "info" && styles.info
      ]}
    >
      <Text selectable style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: depth.hairline
  },
  success: { backgroundColor: badge.success, borderColor: "rgba(68, 227, 157, 0.34)" },
  warning: { backgroundColor: badge.warning, borderColor: "rgba(240, 184, 95, 0.36)" },
  danger: { backgroundColor: badge.danger, borderColor: "rgba(255, 100, 117, 0.36)" },
  info: { backgroundColor: badge.info, borderColor: "rgba(37, 241, 225, 0.32)" },
  label: { color: colors.text, fontSize: 11.5, fontWeight: "900", letterSpacing: 0, textAlign: "center" }
});
