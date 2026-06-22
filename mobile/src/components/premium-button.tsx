import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { MotionPressable, type MotionFeedback } from "@/components/motion-pressable";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";

type PremiumButtonVariant = "primary" | "secondary";

type PremiumButtonProps = PropsWithChildren<{
  accessibilityLabel: string;
  feedback?: MotionFeedback;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: PremiumButtonVariant;
}>;

export function PremiumButton({
  accessibilityLabel,
  children,
  feedback = "none",
  label,
  onPress,
  style,
  variant = "primary"
}: PremiumButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      feedback={feedback}
      onPress={onPress}
      style={[styles.button, isPrimary ? styles.primary : styles.secondary, style]}
      testID="premium-motion-button"
    >
      {isPrimary ? (
        <LinearGradient
          pointerEvents="none"
          colors={gradients.primary}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </MotionPressable>
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
