import { Pressable, StyleSheet, Text } from "react-native";
import { v3Alpha, v3Colors, v3Layout, v3Radius, v3Shadows } from "../../../theme/v3";

export function V3IconButton({
  icon,
  label,
  onPress,
  tone = "default",
  size = v3Layout.iconButtonSize,
  disabled = false,
  style
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        styles[tone] || styles.default,
        { width: size, height: size, borderRadius: size / 2 },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {typeof icon === "string" ? <Text selectable={false} style={[styles.icon, tone === "primary" && styles.primaryIcon]}>{icon}</Text> : icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden"
  },
  default: {
    backgroundColor: v3Alpha.whiteWash,
    borderColor: v3Colors.border
  },
  primary: {
    backgroundColor: v3Alpha.purpleWash,
    borderColor: v3Colors.borderStrong,
    boxShadow: v3Shadows.purple
  },
  blue: {
    backgroundColor: v3Alpha.blueWash,
    borderColor: v3Colors.borderBlue,
    boxShadow: v3Shadows.blue
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: v3Colors.border
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }]
  },
  icon: {
    color: v3Colors.textSoft,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  primaryIcon: {
    color: v3Colors.purpleLight
  }
});
