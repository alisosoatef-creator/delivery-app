import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../utils/mobileTheme";

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
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)"
  },
  success: { backgroundColor: "rgba(67, 230, 162, 0.13)", borderColor: "rgba(67, 230, 162, 0.34)" },
  warning: { backgroundColor: "rgba(231, 195, 111, 0.14)", borderColor: "rgba(231, 195, 111, 0.36)" },
  danger: { backgroundColor: "rgba(255, 111, 124, 0.13)", borderColor: "rgba(255, 111, 124, 0.36)" },
  info: { backgroundColor: "rgba(127, 176, 255, 0.13)", borderColor: "rgba(127, 176, 255, 0.34)" },
  label: { color: colors.text, fontSize: 12, fontWeight: "900", letterSpacing: 0, textAlign: "center" }
});
