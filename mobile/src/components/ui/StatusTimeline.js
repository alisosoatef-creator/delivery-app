import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

const steps = [
  ["searching", "البحث"],
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
  step: { alignItems: "center", gap: spacing.xs, flex: 1 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: colors.border
  },
  dotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotCurrent: { width: 16, height: 16, boxShadow: "0 0 18px rgba(240, 199, 111, 0.48)" },
  label: { color: colors.mutedStrong, fontSize: 10, fontWeight: "800", textAlign: "center" },
  labelActive: { color: colors.text },
  cancelled: {
    borderRadius: radii.lg,
    padding: spacing.sm,
    backgroundColor: "rgba(255, 111, 124, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 111, 124, 0.34)"
  },
  cancelledText: { color: colors.text, fontWeight: "900", textAlign: "center" }
});
