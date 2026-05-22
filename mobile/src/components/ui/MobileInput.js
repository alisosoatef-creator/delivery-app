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
  return (
    <View style={styles.field}>
      <Text selectable style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#667080"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign="right"
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.textSoft, fontSize: 13, fontWeight: "800", textAlign: "right" },
  input: {
    minHeight: 52,
    borderRadius: radii.md,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    color: colors.text,
    backgroundColor: "rgba(3, 7, 18, 0.54)",
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontWeight: "700"
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.sm,
    lineHeight: 22
  }
});
