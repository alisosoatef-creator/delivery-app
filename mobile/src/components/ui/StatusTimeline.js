import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

const steps = [
  ["searching", "بحث"],
  ["accepted", "قبول"],
  ["driver_arriving", "بالطريق"],
  ["arrived", "وصل"],
  ["in_progress", "بدأت"],
  ["completed", "انتهت"]
];

const order = steps.map(([status]) => status);

export function StatusTimeline({ status }) {
  const activeIndex = Math.max(order.indexOf(status), status === "cancelled" ? 0 : -1);
  if (status === "cancelled") {
    return (
      <View style={styles.cancelled}>
        <Text selectable style={styles.cancelledText}>تم إلغاء الرحلة</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {steps.map(([key, label], index) => {
        const active = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <View key={key} style={styles.step}>
            <View style={[styles.dot, active && styles.dotActive, current && styles.dotCurrent]} />
            <Text selectable style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingVertical: spacing.xs
  },
  step: { alignItems: "center", gap: 5, flex: 1 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: colors.border
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: { width: 13, height: 13, boxShadow: "0 0 16px rgba(49, 228, 214, 0.48)" },
  label: { color: colors.mutedStrong, fontSize: 9, fontWeight: "700", textAlign: "center" },
  labelActive: { color: colors.text },
  cancelled: {
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: "rgba(255, 111, 124, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 111, 124, 0.3)"
  },
  cancelledText: { color: colors.text, fontWeight: "800", textAlign: "center" }
});
