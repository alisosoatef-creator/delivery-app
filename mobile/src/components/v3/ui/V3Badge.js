import { StyleSheet, Text, View } from "react-native";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../../theme/v3";
import { V3Text } from "./V3Text";

export function V3Badge({ label, tone = "neutral", icon, style }) {
  return (
    <View style={[styles.badge, styles[tone] || styles.neutral, style]}>
      {icon ? <Text selectable={false} style={[styles.icon, tone === "dark" && styles.darkIcon]}>{icon}</Text> : null}
      <V3Text variant="caption" tone={tone === "dark" ? "primary" : "soft"} numberOfLines={1} style={styles.label}>
        {label}
      </V3Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 26,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    paddingHorizontal: v3Spacing.xs,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.xxs,
    alignSelf: "flex-start"
  },
  neutral: {
    backgroundColor: v3Alpha.whiteWash,
    borderColor: v3Colors.border
  },
  primary: {
    backgroundColor: v3Alpha.purpleWash,
    borderColor: v3Colors.border
  },
  blue: {
    backgroundColor: v3Alpha.blueWash,
    borderColor: v3Colors.border
  },
  success: {
    backgroundColor: "rgba(69, 224, 164, 0.1)",
    borderColor: "rgba(69, 224, 164, 0.24)"
  },
  warning: {
    backgroundColor: "rgba(248, 199, 109, 0.1)",
    borderColor: "rgba(248, 199, 109, 0.24)"
  },
  danger: {
    backgroundColor: "rgba(255, 97, 116, 0.1)",
    borderColor: "rgba(255, 97, 116, 0.24)"
  },
  dark: {
    backgroundColor: v3Colors.black,
    borderColor: v3Colors.border
  },
  icon: {
    color: v3Colors.purpleLight,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900"
  },
  darkIcon: {
    color: v3Colors.electricBlue
  },
  label: {
    flexShrink: 1
  }
});
