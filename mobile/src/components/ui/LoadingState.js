import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../utils/mobileTheme";

export function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator color={colors.gold} />
      <Text selectable style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.sm },
  text: { color: colors.muted }
});
