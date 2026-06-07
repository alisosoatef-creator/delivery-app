import { useState } from "react";
import { registerCustomer } from "../services/authApi";
import { useMobileApp } from "../store/mobileStore";

export function useRegisterCustomer() {
  const { dispatch } = useMobileApp();
  const [form, setForm] = useState({ fullName: "", phone: "", city: "nablus", age: "", birthDate: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setError("");
    if (!form.fullName || !form.phone || !form.city || !form.age || !form.birthDate || !form.password) {
      setError("أكمل الحقول المطلوبة.");
      return;
    }
    if (Number(form.age) < 16 || Number(form.age) > 90) {
      setError("العمر غير منطقي.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("كلمتا السر غير متطابقتين.");
      return;
    }
    setStatus("loading");
    try {
      await registerCustomer({ ...form, age: Number(form.age) });
      dispatch({ type: "pendingPhone", phone: form.phone });
      dispatch({ type: "navigate", area: "auth", screen: "otp" });
    } catch (requestError) {
      setError(requestError.message || "تعذر إنشاء الحساب.");
    } finally {
      setStatus("idle");
    }
  }

  function goToLogin() {
    dispatch({ type: "navigate", area: "auth", screen: "login" });
  }

  return {
    form,
    update,
    status,
    error,
    submit,
    goToLogin
  };
}
