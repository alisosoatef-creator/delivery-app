import { useState } from "react";
import { Text } from "react-native";
import { MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { createSupportTicket } from "../../services/supportApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function DriverSupportScreen() {
  const { state } = useMobileApp();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const session = { token: state.token, role: "driver", phone: state.currentUser?.phone };

  async function submit() {
    try {
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: "driver", type: "gps_issue", message }, session);
      setMessage("");
    } catch (requestError) {
      setError(requestError.message || "تعذر إرسال الدعم.");
    }
  }

  return (
    <ScreenContainer title="دعم الكابتن" subtitle="تذكرة دعم محفوظة في Backend.">
      <MobileCard>
        <MobileInput label="رسالة الدعم" value={message} onChangeText={setMessage} />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title="إرسال" onPress={submit} disabled={!message.trim()} />
      </MobileCard>
    </ScreenContainer>
  );
}
