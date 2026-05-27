import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { button, colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";
import { PressableScale } from "./PressableScale";

export function MobileButton({ title, onPress, variant = "primary", disabled = false, compact = false, icon, loading = false, style }) {
  const blocked = disabled || loading;
  const solid = ["primary", "success", "accent"].includes(variant);

  return (
    <PressableScale
      accessibilityLabel={title}
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      style={[
        styles.button,
        compact && styles.compact,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        variant === "success" && styles.success,
        variant === "accent" && styles.accent,
        blocked && styles.disabled,
        style
      ]}
      pressedStyle={styles.pressed}
    >
      <View style={styles.content}>
        <View style={[styles.beam, solid && styles.beamSolid]} />
        {loading ? <ActivityIndicator color={solid ? colors.black : colors.primary} size="small" /> : null}
        {icon && !loading ? <Text selectable={false} style={[styles.icon, !solid && styles.secondaryLabel]}>{icon}</Text> : null}
        <Text style={[styles.label, !solid && styles.secondaryLabel]}>{title}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: button.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    boxShadow: shadows.glowStrong,
    overflow: "hidden"
  },
  compact: { minHeight: 36, paddingHorizontal: spacing.md },
  secondary: { backgroundColor: button.secondary, borderColor: depth.glassLine, boxShadow: shadows.soft },
  danger: { backgroundColor: "rgba(255, 100, 117, 0.16)", borderColor: "rgba(255, 100, 117, 0.42)", boxShadow: shadows.dangerGlow },
  ghost: { backgroundColor: "transparent", borderColor: depth.hairline, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
  success: { backgroundColor: colors.green, borderColor: "rgba(255, 255, 255, 0.16)", boxShadow: "0 18px 42px rgba(68, 227, 157, 0.18)" },
  accent: { backgroundColor: button.accent, borderColor: "rgba(255, 255, 255, 0.16)", boxShadow: shadows.accentGlow },
  disabled: { opacity: 0.46 },
  pressed: { opacity: 0.9 },
  content: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  beam: { position: "absolute", width: 88, height: 88, borderRadius: radii.pill, right: -54, backgroundColor: "rgba(255, 255, 255, 0.11)" },
  beamSolid: { backgroundColor: "rgba(255, 255, 255, 0.18)" },
  icon: { color: colors.black, fontWeight: "900", fontSize: 14 },
  label: { color: "#031315", fontWeight: "900", fontSize: 13.5, letterSpacing: 0, textAlign: "center" },
  secondaryLabel: { color: colors.text }
});
