import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

const steps = [
  ["searching", "جاري البحث"],
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
        <View style={styles.cancelledLine} />
        <Text selectable style={styles.cancelledText}>تم إلغاء الرحلة</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.rail} />
      <View style={[styles.progress, { width: `${Math.max(10, ((activeIndex + 1) / steps.length) * 100)}%` }]} />
      {steps.map(([key, label], index) => {
        const active = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <View key={key} style={styles.step}>
            <View style={[styles.dot, active && styles.dotActive, current && styles.dotCurrent]} />
            <Text selectable style={[styles.label, active && styles.labelActive, current && styles.labelCurrent]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    overflow: "hidden"
  },
  rail: {
    position: "absolute",
    right: spacing.lg,
    left: spacing.lg,
    top: 18,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.11)"
  },
  progress: {
    position: "absolute",
    right: spacing.lg,
    top: 18,
    height: 2,
    backgroundColor: colors.primary,
    boxShadow: shadows.glow
  },
  step: { alignItems: "center", gap: 6, flex: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: depth.hairline
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: { width: 15, height: 15, boxShadow: "0 0 18px rgba(154, 105, 255, 0.62)" },
  label: { color: colors.mutedStrong, fontSize: 8.5, fontWeight: "800", textAlign: "center" },
  labelActive: { color: colors.textSoft },
  labelCurrent: { color: colors.text },
  cancelled: {
    borderRadius: radii.lg,
    padding: spacing.sm,
    backgroundColor: "rgba(255, 100, 117, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 100, 117, 0.3)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  cancelledLine: { width: 24, height: 4, borderRadius: radii.pill, backgroundColor: colors.red },
  cancelledText: { color: colors.text, fontWeight: "900", textAlign: "center" }
});
