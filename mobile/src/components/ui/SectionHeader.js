import { StyleSheet, Text, View } from "react-native";
import { colors, depth, radii, spacing, typography } from "../../utils/mobileTheme";

export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        {eyebrow ? <Text selectable style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text selectable style={styles.title}>{title}</Text>
        {subtitle ? <Text selectable style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRightWidth: 3,
    borderRightColor: depth.violetLine,
    borderRadius: radii.sm
  },
  copy: { flex: 1, gap: spacing.xxs, alignItems: "flex-end" },
  eyebrow: { color: colors.primary, fontSize: typography.caption, fontWeight: "700", textAlign: "right" },
  title: { color: colors.text, fontSize: typography.section, fontWeight: "800", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "right" }
});
