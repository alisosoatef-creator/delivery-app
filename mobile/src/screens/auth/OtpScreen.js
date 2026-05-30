import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { verifyOtp } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, depth, shadows, spacing } from "../../utils/mobileTheme";

export function OtpScreen() {
  const { state, dispatch } = useMobileApp();
  const [code, setCode] = useState("1234");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setStatus("loading");
    try {
      await verifyOtp({ phone: state.pendingPhone, code });
      dispatch({ type: "navigate", area: "auth", screen: "login" });
      dispatch({ type: "toast", message: "تم تفعيل الحساب. سجل الدخول الآن." });
    } catch (requestError) {
      setError(requestError.message || "رمز OTP غير صحيح.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <ScreenContainer title="تأكيد الحساب" subtitle={`أدخل رمز التفعيل للرقم ${state.pendingPhone || "-"}.`} compact>
      <MobileCard tone="glass" style={styles.card}>
        <MobileBadge label="OTP تجريبي" tone="warning" />
        <Text selectable style={styles.code}>1234</Text>
        <Text selectable style={styles.hint}>هذا الرمز للتطوير فقط وسيستبدل لاحقًا بخدمة OTP حقيقية.</Text>
        <MobileInput label="رمز OTP" value={code} onChangeText={setCode} keyboardType="number-pad" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري التحقق..." : "تأكيد الحساب"} onPress={submit} loading={status === "loading"} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, borderColor: depth.violetLine, boxShadow: shadows.glow },
  code: { color: colors.primary, fontSize: 36, fontWeight: "900", textAlign: "center" },
  hint: { color: colors.muted, textAlign: "center", lineHeight: 20, fontSize: 12 },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
