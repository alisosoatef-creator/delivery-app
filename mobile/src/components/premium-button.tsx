import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, gradients, radii, spacing, typography } from "@/design/tokens";

type PremiumButtonVariant = "primary" | "secondary";

type PremiumButtonProps = PropsWithChildren<{
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: PremiumButtonVariant;
}>;

export function PremiumButton({
  accessibilityLabel,
  children,
  label,
  onPress,
  style,
  variant = "primary"
}: PremiumButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed ? styles.pressed : null,
        style
      ]}
    >
      {isPrimary ? (
        <LinearGradient pointerEvents="none" colors={gradients.primary} style={StyleSheet.absoluteFill} />
      ) : null}
      {children}
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    overflow: "hidden",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1
  },
  primary: {
    borderColor: "rgba(255, 255, 255, 0.24)"
  },
  secondary: {
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  label: {
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: typography.body,
    fontWeight: "900"
  },
  primaryLabel: {
    color: colors.text
  },
  secondaryLabel: {
    color: colors.textSoft
  }
});
