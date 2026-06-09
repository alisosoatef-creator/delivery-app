import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { glass, gradients, radii, shadows } from "@/design/tokens";

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: "default" | "strong" | "subtle";
}>;

export function GlassCard({ children, style, testID, variant = "default" }: GlassCardProps) {
  const glassToken = glass[variant];

  return (
    <BlurView
      intensity={glassToken.blurIntensity}
      tint="dark"
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: glassToken.backgroundColor,
          borderColor: glassToken.borderColor
        },
        style
      ]}
    >
      <LinearGradient pointerEvents="none" colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: radii.md,
    boxShadow: shadows.card
  }
});
