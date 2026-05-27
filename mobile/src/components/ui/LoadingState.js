import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator color={colors.primary} />
      <Text selectable style={styles.text}>{message}</Text>
      <View style={styles.skeleton} />
      <View style={[styles.skeleton, styles.skeletonShort]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  text: { color: colors.muted, fontWeight: "800", textAlign: "center" },
  skeleton: {
    width: "88%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  skeletonShort: {
    width: "54%"
  }
});
