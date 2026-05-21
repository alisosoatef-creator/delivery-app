import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchCustomerRides } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function MyRidesScreen() {
  const { state } = useMobileApp();
  const [rides, setRides] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchCustomerRides({ phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token })
      .then(setRides)
      .catch(() => setRides([]))
      .finally(() => setStatus("idle"));
  }, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  return (
    <ScreenContainer title="رحلاتي" subtitle="سجل رحلات الزبون من Backend.">
      {status === "loading" ? <LoadingState /> : null}
      {status !== "loading" && !rides.length ? <EmptyState title="لا توجد رحلات بعد" message="اطلب رحلة من شاشة طلب الرحلة." /> : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id}>
          <MobileBadge label={ride.status} tone={ride.status === "completed" ? "success" : "warning"} />
          <Text selectable style={{ color: colors.text, fontWeight: "800" }}>{ride.pickup} ← {ride.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>{ride.price || ride.fareIls || 0} ₪</Text>
        </MobileCard>
      ))}
    </ScreenContainer>
  );
}
