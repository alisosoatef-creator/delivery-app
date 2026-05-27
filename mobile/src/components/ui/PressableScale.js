import { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { motion } from "../../utils/mobileTheme";

export function PressableScale({
  children,
  onPress,
  style,
  pressedStyle,
  disabled = false,
  scale = motion.pressScale,
  accessibilityLabel,
  accessibilityRole = "button"
}) {
  const value = useRef(new Animated.Value(1)).current;

  function animate(toValue) {
    Animated.spring(value, {
      toValue,
      useNativeDriver: true,
      friction: motion.springFriction,
      tension: 160
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale: value }] }}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => !disabled && animate(scale)}
        onPressOut={() => !disabled && animate(1)}
        style={({ pressed }) => [style, pressed && !disabled && pressedStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
