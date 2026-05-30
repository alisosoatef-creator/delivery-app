import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 120, useNativeDriver: true })
    ]).start();
  }, [fade, slide]);

  return (
    <ScrollView
      style={styles.root}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        compact && styles.contentCompact,
        { paddingTop: Math.max(spacing.md, insets.top + spacing.xs) },
        contentStyle
      ]}
    >
      <View pointerEvents="none" style={styles.stageLayer} />
      <View pointerEvents="none" style={styles.stageLineTop} />
      <View pointerEvents="none" style={styles.stageLineMid} />
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: spacing.sm }}>
        {showHeader ? (
          <View style={[styles.header, styles[`${variant}Header`], compact && styles.headerCompact]}>
            <View style={styles.brandRow}>
              <BrandMark compact />
              {eyebrow ? <Text selectable style={styles.eyebrow}>{eyebrow}</Text> : null}
            </View>
            {title ? <Text selectable style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text selectable numberOfLines={3} style={styles.subtitle}>{subtitle}</Text> : null}
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
    paddingBottom: layout.screenBottomPadding
  },
  contentCompact: { gap: spacing.sm },
  stageLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 210,
    backgroundColor: "rgba(166, 130, 255, 0.035)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.045)"
  },
  stageLineTop: {
    position: "absolute",
    top: 78,
    right: layout.screenPadding,
    left: layout.screenPadding,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  stageLineMid: {
    position: "absolute",
    top: 138,
    right: layout.screenPadding,
    left: layout.screenPadding,
    height: 1,
    backgroundColor: "rgba(166, 130, 255, 0.06)"
  },
  header: {
    gap: spacing.xs,
    alignItems: "flex-end",
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    boxShadow: shadows.soft
  },
  pageHeader: {},
  homeHeader: { borderColor: depth.violetLine, backgroundColor: "rgba(166, 130, 255, 0.07)" },
  trackingHeader: { borderColor: depth.amberLine, backgroundColor: "rgba(246, 195, 111, 0.055)" },
  driverHeader: { borderColor: depth.greenLine, backgroundColor: "rgba(66, 231, 157, 0.05)" },
  headerCompact: { paddingVertical: spacing.sm },
  brandRow: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  eyebrow: { color: colors.primary, fontSize: typography.caption, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "900", textAlign: "right", letterSpacing: 0, writingDirection: "rtl" },
  subtitle: { color: colors.muted, fontSize: 12.5, lineHeight: 19, textAlign: "right", writingDirection: "rtl" },
  footer: { paddingTop: spacing.sm }
});
