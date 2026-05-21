import { useState } from "react";
import { Text } from "react-native";
import { MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { registerCustomer } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function RegisterScreen() {
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

  return (
    <ScreenContainer title="حساب زبون جديد" subtitle="OTP الحالي للتطوير فقط: 1234. لا يتم تسجيل الدخول قبل التحقق.">
      <MobileCard>
        <MobileInput label="الاسم الكامل" value={form.fullName} onChangeText={(value) => update("fullName", value)} />
        <MobileInput label="رقم الهاتف" value={form.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" />
        <MobileInput label="المدينة" value={form.city} onChangeText={(value) => update("city", value)} placeholder="nablus" />
        <MobileInput label="العمر" value={form.age} onChangeText={(value) => update("age", value)} keyboardType="numeric" />
        <MobileInput label="تاريخ الميلاد" value={form.birthDate} onChangeText={(value) => update("birthDate", value)} placeholder="1996-01-01" />
        <MobileInput label="كلمة السر" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry />
        <MobileInput label="تأكيد كلمة السر" value={form.confirmPassword} onChangeText={(value) => update("confirmPassword", value)} secureTextEntry />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري إنشاء الحساب..." : "إنشاء الحساب"} onPress={submit} disabled={status === "loading"} />
        <MobileButton title="رجوع إلى الدخول" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}
