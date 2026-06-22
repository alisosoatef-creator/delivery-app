import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

export type MotionFeedback = "light" | "none" | "selection";

type MotionPressableProps = PropsWithChildren<
  Omit<PressableProps, "children" | "onPress" | "onPressIn" | "onPressOut" | "style"> & {
    feedback?: MotionFeedback;
    onPress?: (event: GestureResponderEvent) => void;
    onPressIn?: (event: GestureResponderEvent) => void;
    onPressOut?: (event: GestureResponderEvent) => void;
    pressedScale?: number;
    style?: StyleProp<ViewStyle>;
  }
>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const defaultTouchHitSlop = { bottom: 8, left: 8, right: 8, top: 8 };

export function MotionPressable({
  accessibilityRole,
  accessibilityState,
  accessible,
  children,
  disabled,
  feedback = "none",
  hitSlop,
  onPress,
  onPressIn,
  onPressOut,
  pressedScale = 0.975,
  style,
  ...pressableProps
}: MotionPressableProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  function handlePressIn(event: GestureResponderEvent) {
    if (!disabled) {
      const duration = reducedMotion ? 0 : 80;
      scale.value = withTiming(reducedMotion ? 1 : pressedScale, { duration });
      opacity.value = withTiming(reducedMotion ? 1 : 0.9, { duration });
    }

    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    const duration = reducedMotion ? 0 : 130;
    scale.value = withTiming(1, { duration });
    opacity.value = withTiming(1, { duration });
    onPressOut?.(event);
  }

  function handlePress(event: GestureResponderEvent) {
    triggerMotionFeedback(feedback);
    onPress?.(event);
  }

  return (
    <AnimatedPressable
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={disabled ? { ...accessibilityState, disabled: true } : accessibilityState}
      accessible={accessible ?? true}
      disabled={disabled}
      hitSlop={hitSlop ?? defaultTouchHitSlop}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

function triggerMotionFeedback(feedback: MotionFeedback) {
  if (feedback === "selection") {
    void Haptics.selectionAsync().catch(() => undefined);
  }

  if (feedback === "light") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }
}
