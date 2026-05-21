import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../utils/mobileTheme";

export function MobileBadge({ label, tone = "neutral" }) {
  return (
    <View style={[styles.badge, tone === "success" && styles.success, tone === "warning" && styles.warning, tone === "danger" && styles.danger]}>
      <Text selectable style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#202938" },
  success: { backgroundColor: "rgba(61, 220, 151, 0.16)" },
  warning: { backgroundColor: "rgba(215, 181, 109, 0.18)" },
  danger: { backgroundColor: "rgba(255, 107, 107, 0.16)" },
  label: { color: colors.text, fontSize: 12, fontWeight: "800" }
});
