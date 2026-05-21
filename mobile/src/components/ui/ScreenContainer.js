import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../utils/mobileTheme";

export function ScreenContainer({ title, subtitle, children, footer }) {
  return (
    <ScrollView style={styles.root} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text selectable style={styles.title}>{title}</Text>
        {subtitle ? <Text selectable style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  header: { gap: spacing.xs, alignItems: "flex-start" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "left" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: "left" },
  footer: { paddingTop: spacing.md }
});
