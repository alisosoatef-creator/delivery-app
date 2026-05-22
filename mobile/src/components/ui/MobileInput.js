import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

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
  label: { color: colors.textSoft, fontSize: 12, fontWeight: "700", textAlign: "right" },
  input: {
    minHeight: 48,
    borderRadius: radii.sm,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    color: colors.text,
    backgroundColor: "rgba(3, 7, 18, 0.54)",
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: "600"
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.sm,
    lineHeight: 22
  },
  focused: {
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(6, 11, 24, 0.78)"
  }
});
