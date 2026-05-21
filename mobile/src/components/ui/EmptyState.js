import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../utils/mobileTheme";

export function EmptyState({ title = "لا توجد بيانات", message = "" }) {
  return (
    <View style={styles.box}>
      <Text selectable style={styles.title}>{title}</Text>
      {message ? <Text selectable style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  title: { color: colors.text, fontWeight: "800", textAlign: "left" },
  message: { color: colors.muted, lineHeight: 22, textAlign: "left" }
});
