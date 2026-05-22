import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";
import { MobileButton } from "./MobileButton";

export function EmptyState({ title = "لا توجد بيانات", message = "", actionTitle, onAction }) {
  return (
    <View style={styles.box}>
      <View style={styles.orb} />
      <Text selectable style={styles.title}>{title}</Text>
      {message ? <Text selectable style={styles.message}>{message}</Text> : null}
      {actionTitle && onAction ? <MobileButton title={actionTitle} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    alignItems: "flex-end"
  },
  orb: {
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.gold
  },
  title: { color: colors.text, fontWeight: "900", textAlign: "right", fontSize: 17 },
  message: { color: colors.muted, lineHeight: 22, textAlign: "right" }
});
