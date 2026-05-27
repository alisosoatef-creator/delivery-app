import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BrandMark, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { loginCustomer } from "../../services/authApi";
import { saveMobileSession } from "../../services/sessionStorage";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, spacing } from "../../utils/mobileTheme";

export function LoginScreen() {
  const { dispatch } = useMobileApp();
  const isDev = typeof __DEV__ !== "undefined" && __DEV__;
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
      dispatch({ type: "login", token: payload.token, role: payload.user?.role || "customer", user: payload.user, session: { ...payload.user, token: payload.token }, toast: "تم تسجيل الدخول بنجاح." });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تسجيل الدخول."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <ScreenContainer showHeader={false}>
      <MobileCard tone="hero" style={styles.hero}>
        <BrandMark />
        <Text selectable style={styles.title}>مشوارك التالي يبدأ من هنا.</Text>
        <Text selectable style={styles.subtitle}>دخول سريع، طلب واضح، وتتبع مباشر للكابتن.</Text>
      </MobileCard>
      <MobileCard tone="flat" style={styles.form}>
        <MobileInput label="الاسم أو رقم الهاتف" value={identifier} onChangeText={setIdentifier} placeholder="+970..." />
        <MobileInput label="كلمة السر" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري الدخول..." : "دخول الزبون"} onPress={submit} loading={status === "loading"} />
        <View style={styles.links}>
          <MobileButton title="حساب جديد" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "register" })} />
          {isDev ? <MobileButton title="كابتن DEV" compact variant="ghost" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "dev-login" })} /> : null}
        </View>
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, alignItems: "flex-end", paddingVertical: spacing.lg },
  title: { color: colors.text, fontSize: 25, lineHeight: 32, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" },
  form: { gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.04)" },
  links: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
