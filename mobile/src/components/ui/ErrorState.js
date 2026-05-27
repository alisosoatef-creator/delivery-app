import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../utils/mobileTheme";
import { MobileButton } from "./MobileButton";

export function ErrorState({ title = "حدث خطأ", message = "تعذر تنفيذ الطلب الآن.", actionTitle, onAction }) {
  return (
    <View style={styles.box}>
      <View style={styles.line} />
      <Text selectable style={styles.title}>{title}</Text>
      <Text selectable style={styles.message}>{message}</Text>
      {actionTitle && onAction ? <MobileButton title={actionTitle} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 111, 124, 0.34)",
    backgroundColor: "rgba(255, 100, 117, 0.095)",
    gap: spacing.sm,
    alignItems: "flex-end",
    boxShadow: shadows.dangerGlow
  },
  line: { width: 56, height: 6, borderRadius: 999, backgroundColor: colors.red },
  title: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "right" },
  message: { color: colors.muted, lineHeight: 22, textAlign: "right", fontWeight: "800" }
});
