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
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    alignItems: "flex-end"
  },
  orb: {
    width: 34,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  title: { color: colors.text, fontWeight: "900", textAlign: "right", fontSize: 15.5 },
  message: { color: colors.muted, lineHeight: 20, textAlign: "right", fontSize: 12.5 }
});
