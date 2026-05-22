import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../../utils/mobileTheme";

export function ScreenContainer({ title, subtitle, eyebrow, children, footer, compact = false }) {
  return (
    <ScrollView style={styles.root} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={[styles.header, compact && styles.headerCompact]}>
        {eyebrow ? <Text selectable style={styles.eyebrow}>{eyebrow}</Text> : null}
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 112 },
  glowOne: {
    position: "absolute",
    top: -70,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(231, 195, 111, 0.13)"
  },
  glowTwo: {
    position: "absolute",
    top: 110,
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(97, 231, 255, 0.08)"
  },
  header: {
    gap: spacing.xs,
    alignItems: "flex-end",
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)",
    boxShadow: shadows.soft
  },
  headerCompact: {
    padding: spacing.md,
    borderRadius: radii.lg
  },
  eyebrow: { color: colors.gold, fontSize: typography.caption, fontWeight: "900", textAlign: "right" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "900", textAlign: "right", letterSpacing: 0 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 23, textAlign: "right" },
  footer: { paddingTop: spacing.md }
});
