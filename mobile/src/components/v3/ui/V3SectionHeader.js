import { Pressable, StyleSheet, View } from "react-native";
import { v3Colors, v3Spacing } from "../../../theme/v3";
import { V3Text } from "./V3Text";

export function V3SectionHeader({ title, subtitle, actionLabel, onAction, meta, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        {meta ? <V3Text variant="caption" tone="blue" numberOfLines={1}>{meta}</V3Text> : null}
        <V3Text variant="subtitle" tone="primary" numberOfLines={2}>{title}</V3Text>
        {subtitle ? <V3Text variant="caption" tone="muted" numberOfLines={3}>{subtitle}</V3Text> : null}
      </View>
      {actionLabel ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.action}>
          <V3Text variant="label" tone="accent" align="center" numberOfLines={1}>{actionLabel}</V3Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md,
    alignSelf: "stretch"
  },
  copy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  action: {
    borderBottomWidth: 1,
    borderBottomColor: v3Colors.borderStrong,
    paddingBottom: 2
  }
});
