import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, layout, spacing, typography } from "../../utils/mobileTheme";

export function ScreenContainer({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  compact = false,
  showHeader = true,
  contentStyle
}) {
  return (
    <ScrollView
      style={styles.root}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, compact && styles.contentCompact, contentStyle]}
    >
      <View style={styles.topGlow} />
      {showHeader ? (
        <View style={[styles.header, compact && styles.headerCompact]}>
          {eyebrow ? <Text selectable style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text selectable style={styles.title}>{title}</Text>
          {subtitle ? <Text selectable style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: layout.screenPadding,
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: layout.screenBottomPadding
  },
  contentCompact: {
    gap: spacing.sm,
    paddingTop: spacing.md
  },
  topGlow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(49, 228, 214, 0.08)"
  },
  header: {
    gap: spacing.xxs,
    alignItems: "flex-end",
    paddingVertical: spacing.xs
  },
  headerCompact: {
    paddingVertical: spacing.xxs
  },
  eyebrow: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", textAlign: "right" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "800", textAlign: "right", letterSpacing: 0 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" },
  footer: { paddingTop: spacing.sm }
});
