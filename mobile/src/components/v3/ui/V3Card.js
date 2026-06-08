import { Pressable, StyleSheet, View } from "react-native";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../../theme/v3";

export function V3Card({ children, tone = "default", compact = false, onPress, style, contentStyle, accessibilityLabel }) {
  const cardStyle = [styles.card, styles[tone] || styles.default, compact && styles.compact, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        <View style={[styles.inner, compact && styles.compactInner, contentStyle]}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={[styles.inner, compact && styles.compactInner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    boxShadow: v3Shadows.soft
  },
  default: {
    backgroundColor: v3Colors.surface,
    borderColor: v3Colors.border
  },
  raised: {
    backgroundColor: v3Colors.surfaceRaised,
    borderColor: v3Colors.border
  },
  accent: {
    backgroundColor: v3Colors.surface,
    borderColor: v3Colors.border
  },
  blue: {
    backgroundColor: v3Colors.surface,
    borderColor: v3Colors.border
  },
  quiet: {
    backgroundColor: v3Alpha.whiteSoft,
    borderColor: v3Colors.border
  },
  compact: {
    borderRadius: v3Radius.md
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }]
  },
  inner: {
    gap: v3Spacing.sm,
    padding: v3Spacing.md
  },
  compactInner: {
    gap: v3Spacing.xs,
    padding: v3Spacing.sm
  }
});
