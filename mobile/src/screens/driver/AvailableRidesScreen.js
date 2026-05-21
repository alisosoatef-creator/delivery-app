import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, LoadingState, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { acceptRide, fetchAvailableRides } from "../../services/driverApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function AvailableRidesScreen() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const session = { ...state.session, token: state.token, driverId: state.currentUser?.driverId, phone: state.currentUser?.phone };

  function load() {
    setStatus("loading");
    fetchAvailableRides(session)
      .then(setRides)
      .catch((requestError) => setError(requestError.message || "تعذر تحميل الرحلات."))
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  async function accept(rideId) {
    setError("");
    try {
      await acceptRide(rideId, session);
      dispatch({ type: "toast", message: "تم قبول الرحلة." });
      load();
    } catch (requestError) {
      setError(requestError.message || "تعذر قبول الرحلة.");
    }
  }

  return (
    <ScreenContainer title="الرحلات المتاحة" subtitle="تعرض رحلات searching للكابتن النشط.">
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? <EmptyState title="لا توجد رحلات متاحة" message="أنشئ رحلة من الويب أو شاشة الزبون ثم حدّث القائمة." /> : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id}>
          <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{ride.pickup} ← {ride.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>{ride.city || ride.cityId} · {ride.price || ride.fareIls || 0} ₪</Text>
          <MobileButton title="قبول الرحلة" onPress={() => accept(ride.id)} />
        </MobileCard>
      ))}
      <MobileButton title="تحديث الطلبات" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}
