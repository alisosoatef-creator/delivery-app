import { useState } from "react";
import { Text } from "react-native";
import { MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { loginCustomer } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function LoginScreen() {
  const { dispatch } = useMobileApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setStatus("loading");
    try {
      const payload = await loginCustomer({ identifier, password });
      dispatch({
        type: "login",
        token: payload.token,
        role: payload.user?.role || "customer",
        user: payload.user,
        session: { ...payload.user, token: payload.token },
        toast: "تم تسجيل الدخول."
      });
    } catch (requestError) {
      setError(requestError.message || "تعذر تسجيل الدخول.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <ScreenContainer title="تسجيل الدخول" subtitle="ادخل كزبون باستخدام رقم الهاتف أو الاسم بعد تفعيل OTP.">
      <MobileCard>
        <MobileInput label="الاسم أو رقم الهاتف" value={identifier} onChangeText={setIdentifier} placeholder="+970..." />
        <MobileInput label="كلمة السر" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري الدخول..." : "دخول الزبون"} onPress={submit} disabled={status === "loading"} />
        <MobileButton title="إنشاء حساب جديد" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "register" })} />
        <MobileButton title="مدخل الكابتن للتطوير" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "dev-login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}
