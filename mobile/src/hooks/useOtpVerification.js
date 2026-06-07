import { useState } from "react";
import { verifyOtp } from "../services/authApi";
import { useMobileApp } from "../store/mobileStore";

export function useOtpVerification() {
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

  return {
    pendingPhone: state.pendingPhone,
    code,
    setCode,
    status,
    error,
    submit
  };
}
