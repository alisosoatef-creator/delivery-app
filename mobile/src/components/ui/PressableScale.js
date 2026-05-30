import { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { motion } from "../../utils/mobileTheme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => !disabled && animate(scale)}
      onPressOut={() => !disabled && animate(1)}
      style={({ pressed }) => {
        const baseStyle = typeof style === "function" ? style({ pressed }) : style;
        return [
          baseStyle,
          { transform: [{ scale: value }] },
          pressed && !disabled && pressedStyle
        ];
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
