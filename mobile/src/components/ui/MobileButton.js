import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../utils/mobileTheme";

export function MobileButton({ title, onPress, variant = "primary", disabled = false, compact = false, icon, loading = false, style }) {
  const blocked = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={blocked ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        variant === "success" && styles.success,
        variant === "accent" && styles.accent,
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
        style
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={["primary", "success", "accent"].includes(variant) ? colors.black : colors.primary} size="small" /> : null}
        {icon && !loading ? <Text selectable={false} style={[styles.icon, variant !== "primary" && styles.secondaryLabel]}>{icon}</Text> : null}
        <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    boxShadow: shadows.glow
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: spacing.sm
  },
  secondary: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border
  },
  danger: {
    backgroundColor: "rgba(255, 111, 124, 0.16)",
    borderColor: "rgba(255, 111, 124, 0.45)",
    boxShadow: "0 14px 34px rgba(255, 111, 124, 0.12)"
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.08)",
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
  },
  success: {
    backgroundColor: colors.green,
    borderColor: "rgba(255, 255, 255, 0.14)",
    boxShadow: "0 18px 42px rgba(67, 230, 162, 0.16)"
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: "rgba(255, 255, 255, 0.14)",
    boxShadow: shadows.accentGlow
  },
  disabled: { opacity: 0.52 },
  pressed: { transform: [{ scale: 0.975 }], opacity: 0.88 },
  content: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs },
  icon: { color: colors.black, fontWeight: "900", fontSize: 14 },
  label: { color: "#031315", fontWeight: "900", fontSize: 13.5, letterSpacing: 0, textAlign: "center" },
  secondaryLabel: { color: colors.text }
});
