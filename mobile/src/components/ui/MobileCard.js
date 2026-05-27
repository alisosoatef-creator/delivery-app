import { StyleSheet, View } from "react-native";
import { card, colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";
import { PressableScale } from "./PressableScale";

export function MobileCard({ children, tone = "default", style, onPress, compact = false }) {
  const cardStyle = [
    styles.card,
    compact && styles.compact,
    tone === "soft" && styles.soft,
    tone === "gold" && styles.gold,
    tone === "danger" && styles.danger,
    tone === "flat" && styles.flat,
    tone === "hero" && styles.hero,
    tone === "action" && styles.action,
    tone === "glass" && styles.glass,
    style
  ];

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={cardStyle} pressedStyle={styles.pressed}>
        {children}
      </PressableScale>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: depth.hairline,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    boxShadow: shadows.soft,
    overflow: "hidden"
  },
  compact: { padding: spacing.sm, borderRadius: radii.md },
  soft: { backgroundColor: colors.surfaceSoft, borderColor: depth.glassLine },
  gold: { backgroundColor: "rgba(37, 241, 225, 0.09)", borderColor: depth.tealLine, boxShadow: shadows.glow },
  danger: { backgroundColor: "rgba(255, 100, 117, 0.11)", borderColor: "rgba(255, 100, 117, 0.36)", boxShadow: shadows.dangerGlow },
  flat: { boxShadow: "0 0 0 rgba(0, 0, 0, 0)", backgroundColor: card.compact, borderColor: depth.hairline },
  hero: { backgroundColor: card.hero, borderColor: depth.tealLine, boxShadow: shadows.glow },
  action: { backgroundColor: card.action, borderColor: depth.amberLine, boxShadow: shadows.accentGlow },
  glass: { backgroundColor: card.glass, borderColor: depth.glassLine, boxShadow: shadows.lift },
  pressed: { opacity: 0.92 }
});
