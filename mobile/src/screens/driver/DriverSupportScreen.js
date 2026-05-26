import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChoiceChip, EmptyState, InfoRow, LoadingState, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { createSupportTicket, fetchMySupportTickets } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage } from "../../utils/errorUtils";
import { colors, spacing } from "../../utils/mobileTheme";

const issueTypes = [
  { value: "ride_issue", label: "مشكلة في رحلة" },
  { value: "earnings_issue", label: "مشكلة في الأرباح" },
  { value: "gps_issue", label: "مشكلة في التتبع" },
  { value: "account_issue", label: "مشكلة في الحساب" }
];

function statusTone(status) {
  return status === "closed" ? "success" : "warning";
}

function statusLabel(status) {
  return status === "closed" ? "مغلقة" : "مفتوحة";
}

export function DriverSupportScreen() {
  const { state } = useMobileApp();
  const [type, setType] = useState("ride_issue");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = { token: state.token, role: "driver", phone: state.currentUser?.phone };

  function loadTickets() {
    if (!session.phone) return;
    setLoading(true);
    setError("");
    fetchMySupportTickets(session)
      .then(setTickets)
      .catch((requestError) => setError(apiErrorMessage(requestError, "تعذر تحميل تذاكر الدعم.")))
      .finally(() => setLoading(false));
  }

  useEffect(loadTickets, [state.token, state.currentUser?.phone]);

  async function submit() {
    if (!message.trim()) return;
    setError("");
    setSuccess("");
    try {
      const selectedType = issueTypes.find((item) => item.value === type);
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "driver", type: selectedType?.label || type, message: message.trim() }, session);
      setMessage("");
      setSuccess("تم إرسال طلب الدعم بنجاح.");
      loadTickets();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر إرسال طلب الدعم."));
    }
  }

  return (
    <ScreenContainer eyebrow="دعم الكابتن" title="مركز المساعدة" subtitle="أرسل مشكلة مرتبطة بالرحلات أو الأرباح أو حسابك، وسيتابعها فريق الإدارة.">
      <MobileCard tone="gold" style={styles.formCard}>
        <View style={styles.formHeader}>
          <MobileBadge label="مخصص للكباتن" tone="info" />
          <Text selectable style={styles.formTitle}>ما الذي تحتاجه؟</Text>
        </View>
        <View style={styles.chips}>
          {issueTypes.map((item) => (
            <ChoiceChip key={item.value} label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
          ))}
        </View>
        <MobileInput label="رسالة الدعم" value={message} onChangeText={setMessage} placeholder="اكتب التفاصيل باختصار ووضوح" multiline />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        {success ? <Text selectable style={styles.success}>{success}</Text> : null}
        <MobileButton title="إرسال الطلب" onPress={submit} disabled={!message.trim()} />
      </MobileCard>

      <MobileCard tone="flat">
        <SectionHeader title="تذاكري السابقة" subtitle="متابعة مختصرة لطلبات الدعم الخاصة بك." />
        {loading ? <LoadingState message="جاري تحميل التذاكر..." /> : null}
        {!loading && tickets.length === 0 ? <EmptyState title="لا توجد تذاكر دعم" message="عند إرسال طلب جديد سيظهر هنا." /> : null}
        {!loading && tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <MobileBadge label={statusLabel(ticket.status)} tone={statusTone(ticket.status)} />
              <Text selectable style={styles.ticketTitle}>{ticket.type || "طلب دعم"}</Text>
            </View>
            <Text selectable style={styles.ticketMessage} numberOfLines={2}>{ticket.message}</Text>
            <InfoRow label="التاريخ" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("ar") : "-"} />
          </View>
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md },
  formHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  formTitle: { color: colors.text, fontWeight: "900", textAlign: "right", fontSize: 16 },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" },
  success: { color: colors.green, textAlign: "right", fontWeight: "800" },
  ticket: { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  ticketHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  ticketTitle: { color: colors.text, fontWeight: "900", textAlign: "right" },
  ticketMessage: { color: colors.muted, textAlign: "right", lineHeight: 21, fontWeight: "700" }
});
