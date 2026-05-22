import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchCustomerRides } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

export function MyRidesScreen() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    fetchCustomerRides({ phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token })
      .then((items) => {
        setRides(items);
        const active = items.find(isActiveRide);
        if (active) dispatch({ type: "setActiveRide", ride: active, status: "idle" });
      })
      .catch((requestError) => {
        setRides([]);
        setError(requestError.message || "تعذر تحميل الرحلات.");
      })
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  function continueRide(ride) {
    dispatch({ type: "setCurrentRide", ride, area: "customer", screen: "ride-status" });
  }

  return (
    <ScreenContainer title="رحلاتي" subtitle="سجل رحلات الزبون من Backend. الرحلات النشطة يمكن متابعتها مباشرة.">
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? <EmptyState title="لا توجد رحلات بعد" message="اطلب رحلة من شاشة طلب الرحلة." /> : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id}>
          <MobileBadge label={statusLabel(ride.status)} tone={ride.status === "completed" ? "success" : ride.status === "cancelled" ? "danger" : "warning"} />
          <Text selectable style={{ color: colors.text, fontWeight: "800" }}>{ride.pickup} ← {ride.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>{ride.price || ride.fareIls || 0} ₪ · {ride.paymentMethod || "cash"}</Text>
          {isActiveRide(ride) ? <MobileButton title="متابعة" onPress={() => continueRide(ride)} /> : null}
        </MobileCard>
      ))}
      <MobileButton title="تحديث الرحلات" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}
