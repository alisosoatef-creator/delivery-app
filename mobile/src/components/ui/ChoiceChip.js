import { StyleSheet, Text, View } from "react-native";
import { chip, colors, depth, radii, spacing } from "../../utils/mobileTheme";
import { PressableScale } from "./PressableScale";

export function ChoiceChip({ label, selected, onPress }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      pressedStyle={styles.pressed}
    >
      <View style={[styles.signal, selected && styles.signalActive]} />
      <Text selectable={false} numberOfLines={1} ellipsizeMode="tail" style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    minHeight: 36,
    minWidth: 74,
    maxWidth: "100%",
    flexShrink: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: chip.idle,
    borderWidth: 1,
    borderColor: depth.hairline
  },
  selected: { backgroundColor: chip.active, borderColor: depth.violetLine },
  pressed: { opacity: 0.9 },
  signal: { width: 5, height: 5, borderRadius: radii.pill, backgroundColor: colors.mutedStrong },
  signalActive: { width: 16, backgroundColor: colors.primary, boxShadow: "0 0 13px rgba(166, 130, 255, 0.56)" },
  label: { color: colors.textSoft, fontWeight: "900", fontSize: 12.5, lineHeight: 16, textAlign: "right", writingDirection: "rtl", flexShrink: 1 },
  selectedLabel: { color: colors.text }
});
