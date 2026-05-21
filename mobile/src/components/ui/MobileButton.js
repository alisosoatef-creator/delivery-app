import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function MobileButton({ title, onPress, variant = "primary", disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gold
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  danger: {
    backgroundColor: "rgba(255, 107, 107, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.42)"
  },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { color: "#12100b", fontWeight: "800", fontSize: 15 },
  secondaryLabel: { color: colors.text }
});
