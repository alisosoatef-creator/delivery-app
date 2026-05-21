import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { createSupportTicket, fetchMySupportTickets } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function SupportScreen() {
  const { state } = useMobileApp();
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone };

  function loadTickets() {
    fetchMySupportTickets(session).then(setTickets).catch(() => setTickets([]));
  }

  useEffect(loadTickets, [state.currentUser?.phone, state.token]);

  async function submit() {
    setError("");
    if (!message.trim()) return;
    try {
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "customer", type: "ride_issue", message }, session);
      setMessage("");
      loadTickets();
    } catch (requestError) {
      setError(requestError.message || "تعذر إرسال التذكرة.");
    }
  }

  return (
    <ScreenContainer title="الدعم" subtitle="أرسل تذكرة محفوظة في SQLite عبر Backend.">
      <MobileCard>
        <MobileInput label="رسالتك" value={message} onChangeText={setMessage} placeholder="اكتب تفاصيل المشكلة" />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title="إرسال تذكرة" onPress={submit} />
      </MobileCard>
      {!tickets.length ? <EmptyState title="لا توجد تذاكر بعد" /> : null}
      {tickets.map((ticket) => (
        <MobileCard key={ticket.id}>
          <Text selectable style={{ color: colors.text, fontWeight: "800" }}>{ticket.type}</Text>
          <Text selectable style={{ color: colors.muted }}>{ticket.message}</Text>
        </MobileCard>
      ))}
    </ScreenContainer>
  );
}
