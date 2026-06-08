import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useOtpVerification } from "../../hooks/useOtpVerification";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function OtpScreen() {
  const { pendingPhone, code, setCode, status, error, submit } = useOtpVerification();

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="تأكيد الحساب"
        title="أدخل رمز التفعيل"
        subtitle={`أرسلنا رمز التفعيل للرقم ${pendingPhone || "-"}.`}
      />

      <V3Card tone="raised" contentStyle={styles.card}>
        <View style={styles.codePanel}>
          <V3Badge label="رمز تجريبي" tone="warning" />
          <V3Text selectable variant="title" align="center" style={styles.code}>1234</V3Text>
          <V3Text tone="muted" align="center">استخدم الرمز أعلاه لإكمال التفعيل في بيئة التطوير.</V3Text>
        </View>

        <V3Input
          label="رمز OTP"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        {error ? <V3Text selectable tone="danger">{error}</V3Text> : null}
        <V3Button
          title={status === "loading" ? "جاري التحقق..." : "تأكيد الحساب"}
          onPress={submit}
          loading={status === "loading"}
        />
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.sm
  },
  card: {
    gap: v3Spacing.sm
  },
  codePanel: {
    alignItems: "center",
    gap: v3Spacing.sm,
    padding: v3Spacing.md,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim
  },
  code: {
    color: v3Colors.purpleLight,
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ["tabular-nums"]
  }
});
