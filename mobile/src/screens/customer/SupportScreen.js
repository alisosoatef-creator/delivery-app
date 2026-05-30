import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChoiceChip, EmptyState, InfoRow, LoadingState, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { createSupportTicket, fetchMySupportTickets } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage } from "../../utils/errorUtils";
import { colors, depth, radii, spacing } from "../../utils/mobileTheme";

const issueTypes = [
  { value: "ride_issue", label: "مشكلة في الرحلة" },
  { value: "payment_issue", label: "مشكلة في الدفع" },
  { value: "captain_issue", label: "مشكلة مع كابتن" },
  { value: "account_issue", label: "مشكلة في الحساب" },
  { value: "note", label: "ملاحظة" }
];

function statusTone(status) {
  return status === "closed" ? "success" : "warning";
}

function statusLabel(status) {
  return status === "closed" ? "مغلقة" : "مفتوحة";
}

export function SupportScreen() {
  const { state } = useMobileApp();
  const [type, setType] = useState("ride_issue");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone };

  function loadTickets() {
    setLoading(true);
    fetchMySupportTickets(session)
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }

  useEffect(loadTickets, [state.currentUser?.phone, state.token]);

  async function submit() {
    setError("");
    setSuccess("");
    if (!message.trim()) return;
    try {
      const selectedType = issueTypes.find((item) => item.value === type);
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "customer", type: selectedType?.label || type, message: message.trim() }, session);
      setMessage("");
      setSuccess("تم إرسال تذكرة الدعم بنجاح.");
      loadTickets();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر إرسال التذكرة."));
    }
  }

  return (
    <ScreenContainer eyebrow="مركز المساعدة" title="الدعم" subtitle="اختر نوع المشكلة ثم أرسل تفاصيل مختصرة وواضحة.">
      <MobileCard tone="command" style={styles.formCard}>
        <SectionHeader title="كيف نساعدك؟" subtitle="قسم الطلب ليسهل المتابعة من لوحة الإدارة." />
        <View style={styles.chips}>
          {issueTypes.map((item) => (
            <ChoiceChip key={item.value} label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
          ))}
        </View>
        <MobileInput label="رسالتك" value={message} onChangeText={setMessage} placeholder="اكتب تفاصيل المشكلة" multiline style={styles.messageInput} />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        {success ? <Text selectable style={styles.success}>{success}</Text> : null}
        <MobileButton title="إرسال تذكرة" onPress={submit} disabled={!message.trim()} />
      </MobileCard>

      <MobileCard tone="glass">
        <SectionHeader title="تذاكري السابقة" subtitle="متابعة حالة طلبات الدعم من هنا." />
        {loading ? <LoadingState message="جاري تحميل التذاكر..." /> : null}
        {!loading && !tickets.length ? <EmptyState title="لا توجد تذاكر بعد" message="عند إرسال أول تذكرة ستظهر هنا." /> : null}
        {!loading && tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <MobileBadge label={statusLabel(ticket.status)} tone={statusTone(ticket.status)} />
              <Text selectable style={styles.ticketTitle}>{ticket.type || "طلب دعم"}</Text>
            </View>
            <Text selectable style={styles.ticketMessage} numberOfLines={2}>{ticket.message}</Text>
            <InfoRow label="الحالة" value={statusLabel(ticket.status)} />
          </View>
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.sm, borderColor: depth.violetLine },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", writingDirection: "rtl" },
  success: { color: colors.green, textAlign: "right", fontWeight: "800", writingDirection: "rtl" },
  messageInput: { minHeight: 96 },
  ticket: { padding: spacing.sm, borderRadius: radii.lg, borderWidth: 1, borderColor: depth.hairline, backgroundColor: "rgba(255,255,255,0.04)", gap: spacing.xs },
  ticketHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  ticketTitle: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  ticketMessage: { color: colors.muted, lineHeight: 22, textAlign: "right", writingDirection: "rtl" }
});
