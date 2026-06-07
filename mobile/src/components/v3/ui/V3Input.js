import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { v3Alpha, v3Colors, v3Layout, v3Radius, v3Shadows, v3Spacing } from "../../../theme/v3";
import { V3Text } from "./V3Text";

export function V3Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  leading,
  trailing,
  error,
  style,
  inputStyle
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      {label ? <V3Text variant="label" tone="soft">{label}</V3Text> : null}
      <View style={[styles.shell, focused && styles.focused, error && styles.error, multiline && styles.multilineShell]}>
        {trailing ? <View style={styles.slot}>{trailing}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={v3Colors.textFaint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlign="right"
          textAlignVertical={multiline ? "top" : "center"}
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
        />
        {leading ? <View style={styles.slot}>{leading}</View> : null}
      </View>
      {error ? <V3Text variant="caption" tone="danger">{error}</V3Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: v3Spacing.xs,
    alignSelf: "stretch"
  },
  shell: {
    minHeight: v3Layout.controlHeight,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.input,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: v3Spacing.md,
    gap: v3Spacing.xs
  },
  focused: {
    borderColor: v3Colors.borderStrong,
    backgroundColor: v3Colors.inputFocused,
    boxShadow: v3Shadows.purple
  },
  error: {
    borderColor: "rgba(255, 97, 116, 0.48)",
    backgroundColor: "rgba(255, 97, 116, 0.08)"
  },
  multilineShell: {
    alignItems: "flex-start",
    minHeight: 116,
    paddingTop: v3Spacing.sm
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: v3Colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    writingDirection: "rtl",
    paddingVertical: 0
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 0
  },
  slot: {
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.whiteSoft,
    borderRadius: v3Radius.pill,
    paddingHorizontal: v3Spacing.xs,
    minHeight: 28
  }
});
