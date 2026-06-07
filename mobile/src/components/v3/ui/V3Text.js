import { StyleSheet, Text } from "react-native";
import { v3Colors, v3Typography } from "../../../theme/v3";

export function V3Text({
  children,
  variant = "body",
  tone = "primary",
  align = "right",
  weight,
  selectable = false,
  numberOfLines,
  style
}) {
  return (
    <Text
      selectable={selectable}
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      style={[
        styles.base,
        variantStyles[variant] || variantStyles.body,
        toneStyles[tone] || toneStyles.primary,
        alignStyles[align] || alignStyles.right,
        weight ? { fontWeight: weight } : null,
        style
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    writingDirection: "rtl",
    includeFontPadding: false
  }
});

const variantStyles = StyleSheet.create({
  title: v3Typography.title,
  subtitle: v3Typography.subtitle,
  body: v3Typography.body,
  caption: v3Typography.caption,
  label: v3Typography.label
});

const toneStyles = StyleSheet.create({
  primary: { color: v3Colors.text },
  soft: { color: v3Colors.textSoft },
  muted: { color: v3Colors.textMuted },
  faint: { color: v3Colors.textFaint },
  accent: { color: v3Colors.purpleLight },
  blue: { color: v3Colors.electricBlue },
  success: { color: v3Colors.success },
  warning: { color: v3Colors.warning },
  danger: { color: v3Colors.danger },
  inverse: { color: v3Colors.black }
});

const alignStyles = StyleSheet.create({
  right: { textAlign: "right" },
  center: { textAlign: "center" },
  left: { textAlign: "left" }
});
