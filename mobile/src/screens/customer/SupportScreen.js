import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useSupportTickets } from "../../hooks/useSupportTickets";
import { v3Alpha, v3Radius, v3Spacing } from "../../theme/v3";

export function SupportScreen() {
  const { type, setType, message, setMessage, tickets, loading, error, success, issueTypes, submit, statusTone, statusLabel } = useSupportTickets({ role: "customer" });

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="مركز المساعدة"
        title="كيف نساعدك؟"
        subtitle="اختر نوع المشكلة واكتب التفاصيل بوضوح."
      />

      <V3Card tone="raised" contentStyle={styles.formCard}>
        <V3SectionHeader title="تذكرة جديدة" subtitle="رسالة مختصرة وواضحة تكفي للمتابعة." />

        <View style={styles.chips}>
          {issueTypes.map((item) => (
            <V3Button
              key={item.value}
              title={item.label}
              size="sm"
              fullWidth={false}
              variant={type === item.value ? "primary" : "ghost"}
              onPress={() => setType(item.value)}
              style={styles.chipButton}
            />
          ))}
        </View>

        <V3Input
          label="رسالتك"
          value={message}
          onChangeText={setMessage}
          placeholder="اكتب تفاصيل المشكلة"
          multiline
          style={styles.messageInput}
        />

        {error ? <V3Text selectable tone="danger">{error}</V3Text> : null}
        {success ? <V3Text selectable tone="success">{success}</V3Text> : null}

        <V3Button title="إرسال تذكرة" onPress={submit} disabled={!message.trim()} />
      </V3Card>

      <V3Card tone="raised" contentStyle={styles.historyCard}>
        <V3SectionHeader title="تذاكري السابقة" subtitle="متابعة حالة طلبات الدعم من هنا." />

        {loading ? <V3Text tone="muted">جاري تحميل التذاكر...</V3Text> : null}

        {!loading && !tickets.length ? (
          <View style={styles.emptyState}>
            <V3Badge label="لا توجد تذاكر" tone="blue" />
            <V3Text variant="subtitle">لا توجد تذاكر بعد</V3Text>
            <V3Text tone="muted">عند إرسال أول تذكرة ستظهر هنا.</V3Text>
          </View>
        ) : null}

        {!loading && tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <V3Badge label={statusLabel(ticket.status)} tone={statusTone(ticket.status)} />
              <V3Text variant="label" numberOfLines={1}>{ticket.type || "طلب دعم"}</V3Text>
            </View>
            <V3Text selectable tone="muted" numberOfLines={2}>{ticket.message}</V3Text>
            <View style={styles.ticketMeta}>
              <V3Text variant="caption" tone="faint">الحالة</V3Text>
              <V3Text variant="caption" tone="soft">{statusLabel(ticket.status)}</V3Text>
            </View>
          </View>
        ))}
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.sm
  },
  formCard: {
    gap: v3Spacing.sm
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  chipButton: {
    minWidth: 118,
    flexGrow: 1
  },
  messageInput: {
    minHeight: 96
  },
  historyCard: {
    gap: v3Spacing.sm
  },
  emptyState: {
    alignItems: "flex-end",
    gap: v3Spacing.xs,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm
  },
  ticket: {
    gap: v3Spacing.xs,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim
  },
  ticketHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  ticketMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: v3Spacing.sm,
    paddingTop: v3Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.07)"
  }
});
