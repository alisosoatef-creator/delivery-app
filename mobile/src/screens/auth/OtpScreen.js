import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { BrandMark, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { verifyOtp } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

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
    <ScreenContainer
      eyebrow="تأكيد آمن"
      title="رمز التفعيل"
      subtitle={`أدخل الرمز التجريبي للرقم ${state.pendingPhone || "-"}.`}
    >
      <MobileCard tone="gold">
        <BrandMark compact />
        <MobileBadge label="Development OTP" tone="warning" />
        <Text selectable style={styles.code}>1234</Text>
        <Text selectable style={styles.hint}>هذا الرمز للتطوير فقط، وسيتم استبداله لاحقًا بخدمة OTP حقيقية.</Text>
      </MobileCard>
      <MobileCard>
        <SectionHeader title="تحقق الحساب" subtitle="بعد نجاح التحقق ستعود إلى شاشة الدخول." />
        <MobileInput label="رمز OTP" value={code} onChangeText={setCode} keyboardType="number-pad" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري التحقق..." : "تأكيد الحساب"} onPress={submit} loading={status === "loading"} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  code: { color: colors.text, fontSize: 42, fontWeight: "900", textAlign: "center", letterSpacing: 0 },
  hint: { color: colors.muted, textAlign: "center", lineHeight: 22 },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
