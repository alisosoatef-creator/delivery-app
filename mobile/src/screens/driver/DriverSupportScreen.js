import { StyleSheet, Text, View } from "react-native";
import { ChoiceChip, EmptyState, InfoRow, LoadingState, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { useSupportTickets } from "../../hooks/useSupportTickets";
import { colors, depth, radii, spacing } from "../../utils/mobileTheme";

export function DriverSupportScreen() {
  const { type, setType, message, setMessage, tickets, loading, error, success, issueTypes, submit, statusTone, statusLabel } = useSupportTickets({ role: "driver" });

  return (
    <ScreenContainer eyebrow="دعم الكابتن" title="مركز المساعدة" subtitle="أرسل المشكلة وسيتابعها فريق الإدارة.">
      <MobileCard tone="command" style={styles.formCard}>
        <View style={styles.formHeader}>
          <MobileBadge label="مخصص للكباتن" tone="info" />
          <Text selectable style={styles.formTitle}>ما الذي تحتاجه؟</Text>
        </View>
        <View style={styles.chips}>
          {issueTypes.map((item) => (
            <ChoiceChip key={item.value} label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
          ))}
        </View>
        <MobileInput label="رسالة الدعم" value={message} onChangeText={setMessage} placeholder="اكتب التفاصيل باختصار ووضوح" multiline style={styles.messageInput} />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        {success ? <Text selectable style={styles.success}>{success}</Text> : null}
        <MobileButton title="إرسال الطلب" onPress={submit} disabled={!message.trim()} />
      </MobileCard>

      <MobileCard tone="glass">
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
  formCard: { gap: spacing.sm, borderColor: depth.greenLine },
  formHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  formTitle: { color: colors.text, fontWeight: "900", textAlign: "right", fontSize: 15, writingDirection: "rtl" },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", writingDirection: "rtl" },
  success: { color: colors.green, textAlign: "right", fontWeight: "800", writingDirection: "rtl" },
  messageInput: { minHeight: 96 },
  ticket: { padding: spacing.sm, borderRadius: radii.lg, borderWidth: 1, borderColor: depth.hairline, backgroundColor: "rgba(255,255,255,0.04)", gap: spacing.xs },
  ticketHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  ticketTitle: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  ticketMessage: { color: colors.muted, textAlign: "right", lineHeight: 19, fontWeight: "700", fontSize: 12, writingDirection: "rtl" }
});
