import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { loginCustomer } from "../../services/authApi";
import { saveMobileSession } from "../../services/sessionStorage";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, spacing } from "../../utils/mobileTheme";

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
      await saveMobileSession({
        token: payload.token,
        role: payload.user?.role || "customer",
        currentUser: payload.user,
        session: { ...payload.user, token: payload.token },
        phone: payload.user?.phone,
        userId: payload.user?.id
      });
      dispatch({
        type: "login",
        token: payload.token,
        role: payload.user?.role || "customer",
        user: payload.user,
        session: { ...payload.user, token: payload.token },
        toast: "تم تسجيل الدخول بنجاح."
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تسجيل الدخول."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <ScreenContainer
      eyebrow="وصل للمشاوير"
      title="رحلتك تبدأ بهدوء"
      subtitle="ادخل كزبون بعد تفعيل OTP، واطلب رحلتك مع تتبع مباشر للكابتن."
    >
      <MobileCard tone="gold" style={styles.hero}>
        <MobileBadge label="Premium Ride Experience" tone="warning" />
        <Text selectable style={styles.heroTitle}>تطبيق مشاوير داكن، سريع، ومصمم للتجربة الحقيقية.</Text>
        <View style={styles.heroStats}>
          <Text selectable style={styles.heroStat}>GPS مباشر</Text>
          <Text selectable style={styles.heroStat}>تحديث لحظي</Text>
          <Text selectable style={styles.heroStat}>دفع آمن تجريبي</Text>
        </View>
      </MobileCard>

      <MobileCard>
        <SectionHeader title="تسجيل الدخول" subtitle="استخدم الاسم أو رقم الهاتف وكلمة السر." />
        <MobileInput label="الاسم أو رقم الهاتف" value={identifier} onChangeText={setIdentifier} placeholder="+970..." />
        <MobileInput label="كلمة السر" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري الدخول..." : "دخول الزبون"} onPress={submit} disabled={status === "loading"} />
        <MobileButton title="إنشاء حساب جديد" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "register" })} />
        <MobileButton title="مدخل الكابتن للتطوير" variant="ghost" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "dev-login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: "hidden" },
  heroTitle: { color: colors.text, fontSize: 22, lineHeight: 32, fontWeight: "900", textAlign: "right" },
  heroStats: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  heroStat: {
    color: colors.text,
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontWeight: "900",
    fontSize: 12
  },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
