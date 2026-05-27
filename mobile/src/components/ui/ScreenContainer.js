import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, depth, layout, radii, shadows, spacing, typography } from "../../utils/mobileTheme";
import { BrandMark } from "./BrandMark";

export function ScreenContainer({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  compact = false,
  showHeader = true,
  contentStyle,
  variant = "page"
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 120, useNativeDriver: true })
    ]).start();
  }, [fade, slide]);

  return (
    <ScrollView
      style={styles.root}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, compact && styles.contentCompact, contentStyle]}
    >
      <View style={styles.backdrop} />
      <View style={styles.gridLineA} />
      <View style={styles.gridLineB} />
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: spacing.sm }}>
        {showHeader ? (
          <View style={[styles.header, styles[`${variant}Header`], compact && styles.headerCompact]}>
            <View style={styles.brandRow}>
              <BrandMark compact />
              {eyebrow ? <Text selectable style={styles.eyebrow}>{eyebrow}</Text> : null}
            </View>
            {title ? <Text selectable style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text selectable numberOfLines={2} style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: layout.screenPadding,
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: layout.screenBottomPadding
  },
  contentCompact: { gap: spacing.sm, paddingTop: spacing.sm },
  backdrop: {
    position: "absolute",
    top: -70,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: radii.pill,
    backgroundColor: "rgba(37, 241, 225, 0.09)"
  },
  gridLineA: {
    position: "absolute",
    top: 82,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  gridLineB: {
    position: "absolute",
    top: 146,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(37, 241, 225, 0.035)"
  },
  header: {
    gap: spacing.xs,
    alignItems: "flex-end",
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    boxShadow: shadows.soft
  },
  pageHeader: {},
  homeHeader: { borderColor: depth.tealLine, backgroundColor: "rgba(37, 241, 225, 0.055)" },
  trackingHeader: { borderColor: depth.amberLine, backgroundColor: "rgba(240, 184, 95, 0.052)" },
  driverHeader: { borderColor: depth.tealLine, backgroundColor: "rgba(68, 227, 157, 0.05)" },
  headerCompact: { paddingVertical: spacing.sm },
  brandRow: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  eyebrow: { color: colors.primary, fontSize: typography.caption, fontWeight: "900", textAlign: "right" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "900", textAlign: "right", letterSpacing: 0 },
  subtitle: { color: colors.muted, fontSize: 12.5, lineHeight: 19, textAlign: "right" },
  footer: { paddingTop: spacing.sm }
});
