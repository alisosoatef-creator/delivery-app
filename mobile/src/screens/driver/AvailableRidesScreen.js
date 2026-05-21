import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { acceptRide, fetchAvailableRides } from "../../services/driverApi";
import { connectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function AvailableRidesScreen() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState(state.availableRides || []);
  const [status, setStatus] = useState("loading");
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [error, setError] = useState("");
  const session = { ...state.session, token: state.token, role: "driver", driverId: state.currentUser?.driverId, phone: state.currentUser?.phone, userId: state.currentUser?.id };

  function load() {
    setStatus("loading");
    setError("");
    fetchAvailableRides(session)
      .then((items) => {
        setRides(items);
        dispatch({ type: "patch", patch: { availableRides: items } });
      })
      .catch((requestError) => setError(requestError.message || "تعذر تحميل الرحلات المتاحة."))
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    if (!session.driverId) return undefined;
    connectMobileSocket(session, {
      onConnectionChange: (connected) => {
        const nextStatus = connected ? "connected" : "offline";
        setSocketStatus(nextStatus);
        dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
      }
    });
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      if (eventName === "ride:created") load();
      if (eventName === "ride:accepted" || eventName === "ride:status-updated" || eventName === "ride:cancelled") load();
    });
    return unsubscribe;
  }, [session.driverId, session.phone, session.token]);

  async function accept(rideId) {
    setError("");
    try {
      const payload = await acceptRide(rideId, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "driver", screen: "current", toast: "تم قبول الرحلة." });
      load();
    } catch (requestError) {
      setError(requestError.message || "تعذر قبول الرحلة.");
    }
  }

  return (
    <ScreenContainer title="الرحلات المتاحة" subtitle="تصل الرحلات الجديدة تلقائيًا عند توفر الاتصال المباشر.">
      <MobileCard>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "تحديث يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <Text selectable style={{ color: colors.muted }}>إذا لم تظهر الرحلة فورًا استخدم زر تحديث الطلبات كخيار احتياطي.</Text>
      </MobileCard>
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? <EmptyState title="لا توجد رحلات متاحة" message="عند طلب رحلة من الزبون ستظهر هنا تلقائيًا أو بعد التحديث." /> : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id}>
          <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{ride.pickup} ← {ride.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>{ride.city || ride.cityId} · {ride.price || ride.fareIls || 0} ₪ · {ride.paymentMethod || "cash"}</Text>
          <MobileButton title="قبول الرحلة" onPress={() => accept(ride.id)} />
        </MobileCard>
      ))}
      <MobileButton title="تحديث الطلبات" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}
