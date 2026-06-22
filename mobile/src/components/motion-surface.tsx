import type { PropsWithChildren } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeOut, useReducedMotion } from "react-native-reanimated";

type MotionSurfaceProps = PropsWithChildren<{
  delay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function getMotionDuration(reducedMotion: boolean, duration: number) {
  return reducedMotion ? 0 : duration;
}

export function MotionSurface({ children, delay = 0, style, testID }: MotionSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const duration = getMotionDuration(reducedMotion, 220);

  return (
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInDown.duration(duration).delay(Math.min(Math.max(delay, 0), 100))
      }
      exiting={reducedMotion ? undefined : FadeOut.duration(140)}
      style={[styles.surface, style]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  surface: {
    width: "100%"
  }
});
