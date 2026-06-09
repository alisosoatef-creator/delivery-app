import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { colors, gradients, radii } from "@/design/tokens";

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function GlassCard({ children, style, testID }: GlassCardProps) {
  return (
    <BlurView intensity={30} tint="dark" testID={testID} style={[styles.card, style]}>
      <LinearGradient pointerEvents="none" colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.34)"
  }
});
