import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { createSupportTicket } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function DriverSupportScreen() {
  const { state } = useMobileApp();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = { token: state.token, role: "driver", phone: state.currentUser?.phone };

  async function submit() {
    setError("");
    setSuccess("");
    try {
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "driver", type: "gps_issue", message }, session);
      setMessage("");
      setSuccess("تم إرسال طلب الدعم.");
    } catch (requestError) {
      setError(requestError.message || "تعذر إرسال الدعم.");
    }
  }

  return (
    <ScreenContainer eyebrow="دعم الكابتن" title="مركز المساعدة" subtitle="أرسل مشكلة مرتبطة بالرحلات أو GPS أو الحساب.">
      <MobileCard tone="gold">
        <MobileBadge label="Driver Support" tone="info" />
        <SectionHeader title="احتجت مساعدة؟" subtitle="اكتب رسالتك وسيتم حفظها في Backend." />
        <MobileInput label="رسالة الدعم" value={message} onChangeText={setMessage} placeholder="اكتب تفاصيل المشكلة" multiline />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        {success ? <Text selectable style={styles.success}>{success}</Text> : null}
        <MobileButton title="إرسال" onPress={submit} disabled={!message.trim()} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.red, textAlign: "right", fontWeight: "800" },
  success: { color: colors.green, textAlign: "right", fontWeight: "800" }
});
