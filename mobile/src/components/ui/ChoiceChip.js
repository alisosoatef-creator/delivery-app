import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function ChoiceChip({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text selectable={false} style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  label: { color: colors.text, fontWeight: "900", fontSize: 13 },
  selectedLabel: { color: "#161006" }
});
