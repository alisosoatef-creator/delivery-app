import { StyleSheet, Text, View } from "react-native";
import { chip, colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";
import { PressableScale } from "./PressableScale";

export function ChoiceChip({ label, selected, onPress }) {
  return (
    <PressableScale
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      pressedStyle={styles.pressed}
    >
      <View style={[styles.signal, selected && styles.signalActive]} />
      <Text selectable={false} style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: chip.idle
  },
  selected: { backgroundColor: chip.active, borderColor: depth.violetLine, boxShadow: shadows.glow },
  pressed: { opacity: 0.9 },
  signal: { width: 5, height: 5, borderRadius: radii.pill, backgroundColor: colors.mutedStrong },
  signalActive: { width: 14, backgroundColor: colors.primary, boxShadow: "0 0 13px rgba(154, 105, 255, 0.56)" },
  label: { color: colors.textSoft, fontWeight: "900", fontSize: 12.5 },
  selectedLabel: { color: colors.text }
});
