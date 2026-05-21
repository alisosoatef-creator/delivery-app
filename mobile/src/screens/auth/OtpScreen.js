import { useState } from "react";
import { Text } from "react-native";
import { MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
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
    <ScreenContainer title="تأكيد OTP" subtitle={`أدخل الرمز التجريبي للرقم ${state.pendingPhone || "-"}.`}>
      <MobileCard>
        <MobileInput label="رمز OTP" value={code} onChangeText={setCode} keyboardType="number-pad" />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري التحقق..." : "تأكيد الحساب"} onPress={submit} disabled={status === "loading"} />
      </MobileCard>
    </ScreenContainer>
  );
}
