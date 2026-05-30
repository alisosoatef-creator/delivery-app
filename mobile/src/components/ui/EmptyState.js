import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";
import { MobileButton } from "./MobileButton";

export function EmptyState({ title = "لا توجد بيانات", message = "", actionTitle, onAction }) {
  return (
    <View style={styles.box}>
      <View style={styles.indicator} />
      <Text selectable style={styles.title}>{title}</Text>
      {message ? <Text selectable style={styles.message}>{message}</Text> : null}
      {actionTitle && onAction ? <MobileButton title={actionTitle} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: depth.hairline,
    gap: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.044)",
    alignItems: "flex-end",
    boxShadow: shadows.soft
  },
  indicator: {
    width: 34,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    boxShadow: shadows.glow
  },
  title: { color: colors.text, fontWeight: "900", textAlign: "right", fontSize: 15.5, writingDirection: "rtl" },
  message: { color: colors.muted, lineHeight: 20, textAlign: "right", fontSize: 12.5, writingDirection: "rtl" }
});
