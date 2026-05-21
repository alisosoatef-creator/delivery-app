import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../../utils/mobileTheme";

export function MobileInput({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = "default" }) {
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
        textAlign="right"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.muted, fontSize: 13, fontWeight: "700", textAlign: "left" },
  input: {
    minHeight: 52,
    borderRadius: radii.sm,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    backgroundColor: "#0b1118",
    paddingHorizontal: spacing.md,
    fontSize: 15
  }
});
