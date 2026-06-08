import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { v3Alpha, v3Colors, v3Layout, v3Radius, v3Shadows, v3Spacing } from "../../../theme/v3";
import { V3Text } from "./V3Text";

export function V3Button({
  title,
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel
}) {
  const blocked = disabled || loading;
  const label = title || children;
  const solid = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof label === "string" ? label : title)}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant] || styles.primary,
        styles[size] || styles.md,
        fullWidth && styles.fullWidth,
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
        style
      ]}
    >
      <View pointerEvents="none" style={[styles.lightLine, solid && styles.lightLinePrimary]} />
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={solid ? v3Colors.white : v3Colors.purpleLight} size="small" /> : null}
        {icon && !loading ? (
          typeof icon === "string" ? (
            <Text selectable={false} style={[styles.icon, solid ? styles.iconSolid : styles.iconSoft]}>{icon}</Text>
          ) : (
            icon
          )
        ) : null}
        <V3Text
          variant="label"
          tone={solid ? "primary" : "soft"}
          align="center"
          numberOfLines={2}
          style={[styles.label, solid && styles.solidLabel, textStyle]}
        >
          {label}
        </V3Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: v3Layout.controlHeight,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  fullWidth: {
    alignSelf: "stretch"
  },
  md: {
    minHeight: v3Layout.controlHeight,
    paddingHorizontal: v3Spacing.lg
  },
  sm: {
    minHeight: v3Layout.compactControlHeight,
    paddingHorizontal: v3Spacing.md
  },
  primary: {
    backgroundColor: v3Colors.purple,
    borderColor: "rgba(255, 255, 255, 0.12)",
    boxShadow: v3Shadows.purple
  },
  secondary: {
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderColor: v3Colors.border,
    boxShadow: v3Shadows.none
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: v3Colors.border,
    boxShadow: v3Shadows.none
  },
  danger: {
    backgroundColor: "rgba(255, 97, 116, 0.13)",
    borderColor: "rgba(255, 97, 116, 0.36)",
    boxShadow: v3Shadows.soft
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    boxShadow: v3Shadows.pressed
  },
  content: {
    minWidth: 0,
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.xs
  },
  lightLine: {
    position: "absolute",
    top: 0,
    right: 22,
    left: 22,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  lightLinePrimary: {
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  icon: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
    textAlign: "center"
  },
  iconSolid: {
    color: v3Colors.white
  },
  iconSoft: {
    color: v3Colors.purpleLight
  },
  label: {
    flexShrink: 1
  },
  solidLabel: {
    color: v3Colors.white
  }
});
