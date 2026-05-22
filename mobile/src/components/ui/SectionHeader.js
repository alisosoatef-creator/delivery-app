import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../utils/mobileTheme";

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
    gap: spacing.sm
  },
  copy: { flex: 1, gap: spacing.xxs, alignItems: "flex-end" },
  eyebrow: { color: colors.gold, fontSize: typography.caption, fontWeight: "900", textAlign: "right" },
  title: { color: colors.text, fontSize: typography.section, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" }
});
