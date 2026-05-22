import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { EmptyState, InfoRow, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { acceptRide, fetchAvailableRides } from "../../services/driverApi";
import { connectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money } from "../../utils/mobileTheme";

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
        dispatch({ type: "patch", patch: { availableRides: items, connectionMessage: "" } });
      })
      .catch((requestError) => {
        setError(apiErrorMessage(requestError, "تعذر تحميل الرحلات المتاحة."));
        dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
      })
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    if (!session.driverId) return undefined;
    connectMobileSocket(session, {
      onConnectionChange: (connected, statusName) => {
        const nextStatus = statusName || (connected ? "connected" : "disconnected");
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
      setError(apiErrorMessage(requestError, "تعذر قبول الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    }
  }

  return (
    <ScreenContainer eyebrow="طلبات جديدة" title="الرحلات المتاحة" subtitle="تظهر رحلات searching هنا تلقائيًا عند وصول طلبات جديدة.">
      <MobileCard tone="gold">
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "تحديث يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <Text selectable style={styles.muted}>إذا لم تظهر الرحلة فورًا استخدم زر تحديث الطلبات كخيار احتياطي.</Text>
      </MobileCard>
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? (
        <EmptyState title="لا توجد رحلات متاحة" message="عند طلب رحلة من الزبون ستظهر هنا تلقائيًا أو بعد التحديث." actionTitle="تحديث الطلبات" onAction={load} />
      ) : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id} tone="soft">
          <SectionHeader title={ride.destination || "وجهة جديدة"} subtitle={`${ride.pickup} ← ${ride.destination}`} />
          <InfoRow label="المدينة" value={ride.city || ride.cityId || "-"} />
          <InfoRow label="السعر" value={money(ride.price || ride.fareIls)} />
          <InfoRow label="المسافة" value={km(ride.routeDistanceKm || ride.distanceKm)} />
          <InfoRow label="الدفع" value={ride.paymentMethod || "cash"} />
          <MobileButton title="قبول الرحلة" onPress={() => accept(ride.id)} />
        </MobileCard>
      ))}
      <MobileButton title="تحديث الطلبات" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, lineHeight: 22, textAlign: "right", fontWeight: "800" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
