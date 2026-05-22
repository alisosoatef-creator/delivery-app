import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { createSupportTicket, fetchMySupportTickets } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function SupportScreen() {
  const { state } = useMobileApp();
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone };

  function loadTickets() {
    fetchMySupportTickets(session).then(setTickets).catch(() => setTickets([]));
  }

  useEffect(loadTickets, [state.currentUser?.phone, state.token]);

  async function submit() {
    setError("");
    setSuccess("");
    if (!message.trim()) return;
    try {
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "customer", type: "ride_issue", message }, session);
      setMessage("");
      setSuccess("تم إرسال تذكرة الدعم بنجاح.");
      loadTickets();
    } catch (requestError) {
      setError(requestError.message || "تعذر إرسال التذكرة.");
    }
  }

  return (
    <ScreenContainer eyebrow="مركز المساعدة" title="الدعم" subtitle="أرسل تذكرة محفوظة في النظام وسيتم التعامل معها من لوحة الإدارة.">
      <MobileCard tone="gold">
        <SectionHeader title="كيف نساعدك؟" subtitle="اكتب المشكلة بوضوح، ويمكنك متابعة حالة التذكرة هنا." />
        <MobileInput label="رسالتك" value={message} onChangeText={setMessage} placeholder="اكتب تفاصيل المشكلة" multiline />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        {success ? <Text selectable style={styles.success}>{success}</Text> : null}
        <MobileButton title="إرسال تذكرة" onPress={submit} disabled={!message.trim()} />
      </MobileCard>

      <MobileCard>
        <SectionHeader title="تذاكري السابقة" subtitle="حالة كل تذكرة تظهر مباشرة من الـ Backend." />
        {!tickets.length ? <EmptyState title="لا توجد تذاكر بعد" message="عند إرسال أول تذكرة ستظهر هنا." /> : null}
        {tickets.map((ticket) => (
          <MobileCard key={ticket.id} tone="flat">
            <MobileBadge label={ticket.status || "open"} tone={ticket.status === "closed" ? "success" : "warning"} />
            <InfoRow label="النوع" value={ticket.type} />
            <Text selectable style={styles.ticketMessage}>{ticket.message}</Text>
          </MobileCard>
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.red, textAlign: "right", fontWeight: "800" },
  success: { color: colors.green, textAlign: "right", fontWeight: "800" },
  ticketMessage: { color: colors.muted, lineHeight: 22, textAlign: "right" }
});
