import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { acceptRide, fetchAvailableRides } from "../../services/driverApi";
import { connectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";

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
    <ScreenContainer title="طلبات الرحلات" subtitle={socketStatus === "connected" ? "الطلبات الجديدة تظهر مباشرة." : "يمكنك التحديث يدويًا عند الحاجة."} compact>
      <View style={styles.statusLine}>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <MobileButton title="تحديث" compact variant="secondary" onPress={load} />
      </View>
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? (
        <EmptyState title="لا توجد طلبات الآن" message="عند طلب رحلة من زبون ستظهر هنا." actionTitle="تحديث" onAction={load} />
      ) : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id} tone="flat" style={styles.request}>
          <View style={styles.route}>
            <Text selectable style={styles.destination}>{ride.destination || "وجهة جديدة"}</Text>
            <Text selectable numberOfLines={1} style={styles.path}>{ride.pickup} ← {ride.destination}</Text>
          </View>
          <View style={styles.details}>
            <Text selectable style={styles.detail}>{km(ride.routeDistanceKm || ride.distanceKm)}</Text>
            <Text selectable style={styles.detail}>{money(ride.price || ride.fareIls)}</Text>
            <Text selectable style={styles.detail}>{ride.paymentMethod || "cash"}</Text>
          </View>
          <MobileButton title="قبول" variant="accent" onPress={() => accept(ride.id)} />
        </MobileCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusLine: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  request: { gap: spacing.sm },
  route: { alignItems: "flex-end", gap: 3 },
  destination: { color: colors.text, fontSize: 17, fontWeight: "800", textAlign: "right" },
  path: { color: colors.muted, fontSize: 12, textAlign: "right" },
  details: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  detail: { color: colors.textSoft, fontSize: 12, fontWeight: "700", paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.055)" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
