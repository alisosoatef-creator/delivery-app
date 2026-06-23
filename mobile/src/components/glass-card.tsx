import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { glass, gradients, radii } from "@/design/tokens";

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: keyof typeof glass;
}>;

export function GlassCard({ children, style, testID, variant = "default" }: GlassCardProps) {
  const glassToken = glass[variant];
  const surfaceGradient = variant === "floating" ? gradients.floating : gradients.card;
  const highlightGradient = [glassToken.highlightColor, "rgba(255, 255, 255, 0)"] as const;

  return (
    <BlurView
      intensity={glassToken.blurIntensity}
      tint="dark"
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: glassToken.backgroundColor,
          borderColor: glassToken.borderColor,
          boxShadow: glassToken.shadow
        },
        style
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={surfaceGradient}
        style={StyleSheet.absoluteFill}
        testID={testID ? `${testID}-surface` : undefined}
      />
      <LinearGradient
        pointerEvents="none"
        colors={highlightGradient}
        style={styles.highlight}
        testID={testID ? `${testID}-highlight` : undefined}
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: radii.md
  },
  highlight: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "48%"
  }
});
