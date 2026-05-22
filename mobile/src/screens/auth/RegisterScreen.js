import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { registerCustomer } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, spacing } from "../../utils/mobileTheme";

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
    <ScreenContainer
      eyebrow="حساب زبون"
      title="انضم للتجربة"
      subtitle="أنشئ حسابك ثم فعّله برمز OTP التجريبي. لن يتم تسجيل الدخول قبل التحقق."
    >
      <MobileCard tone="gold">
        <View style={styles.heroLine} />
        <Text selectable style={styles.heroText}>بيانات واضحة، تحقق بسيط، ثم تجربة طلب رحلة كاملة.</Text>
        <MobileBadge label="OTP Dev Mode: 1234" tone="warning" />
      </MobileCard>

      <MobileCard>
        <SectionHeader title="بيانات الحساب" subtitle="اكتب معلوماتك الأساسية كما ستظهر للكابتن والدعم." />
        <MobileInput label="الاسم الكامل" value={form.fullName} onChangeText={(value) => update("fullName", value)} />
        <MobileInput label="رقم الهاتف" value={form.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" />
        <MobileInput label="المدينة" value={form.city} onChangeText={(value) => update("city", value)} placeholder="nablus" />
        <View style={styles.row}>
          <View style={styles.flex}><MobileInput label="العمر" value={form.age} onChangeText={(value) => update("age", value)} keyboardType="numeric" /></View>
          <View style={styles.flex}><MobileInput label="تاريخ الميلاد" value={form.birthDate} onChangeText={(value) => update("birthDate", value)} placeholder="1996-01-01" /></View>
        </View>
        <MobileInput label="كلمة السر" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry />
        <MobileInput label="تأكيد كلمة السر" value={form.confirmPassword} onChangeText={(value) => update("confirmPassword", value)} secureTextEntry />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري إنشاء الحساب..." : "إنشاء الحساب"} onPress={submit} disabled={status === "loading"} />
        <MobileButton title="رجوع إلى الدخول" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroLine: { width: 70, height: 6, borderRadius: 999, backgroundColor: colors.gold, alignSelf: "flex-end" },
  heroText: { color: colors.text, fontSize: 20, lineHeight: 30, fontWeight: "900", textAlign: "right" },
  row: { flexDirection: "row-reverse", gap: spacing.sm },
  flex: { flex: 1 },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
