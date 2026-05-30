import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function MobileInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  style
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      {label ? <Text selectable style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedStrong}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlign="right"
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, focused && styles.focused, multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.textSoft, fontSize: 12, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  input: {
    minHeight: 50,
    borderRadius: radii.lg,
    borderColor: depth.hairline,
    borderWidth: 1,
    color: colors.text,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    paddingHorizontal: spacing.md,
    fontSize: 13.5,
    fontWeight: "700",
    writingDirection: "rtl"
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.sm,
    lineHeight: 22
  },
  focused: {
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(18, 13, 30, 0.96)",
    boxShadow: shadows.glow
  }
});
