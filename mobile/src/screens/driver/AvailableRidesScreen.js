import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { acceptRide, fetchAvailableRides } from "../../services/driverApi";
import { connectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";
import { statusLabel } from "../../utils/rideStatus";

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "المحفظة";
  return "نقدًا";
}

export function AvailableRidesScreen() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState(state.availableRides || []);
  const [status, setStatus] = useState("loading");
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [error, setError] = useState("");
  const [dispatchMessage, setDispatchMessage] = useState("");
  const session = { ...state.session, token: state.token, role: "driver", driverId: state.currentUser?.driverId, phone: state.currentUser?.phone, userId: state.currentUser?.id };

  function load() {
    setStatus("loading");
    setError("");
    setDispatchMessage("");
    fetchAvailableRides(session)
      .then((payload) => {
        const items = Array.isArray(payload) ? payload : payload.rides || [];
        const nextDispatchMessage =
          !Array.isArray(payload) && payload.availableStatus && payload.availableStatus !== "ok"
            ? payload.dispatchReason || "لا توجد طلبات مناسبة لحالتك الحالية."
            : "";
        setRides(items);
        setDispatchMessage(nextDispatchMessage);
        dispatch({
          type: "patch",
          patch: {
            availableRides: items,
            driverDispatchStatus: Array.isArray(payload) ? "ok" : payload.availableStatus,
            driverDispatchReason: nextDispatchMessage,
            connectionMessage: ""
          }
        });
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
    <ScreenContainer title="طلبات الرحلات" subtitle={socketStatus === "connected" ? "الطلبات الجديدة تظهر مباشرة." : "حدّث الطلبات يدويًا عند الحاجة."} compact>
      <View style={styles.statusLine}>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <MobileButton title="تحديث" compact variant="secondary" onPress={load} />
      </View>
      {status === "loading" ? <LoadingState message="جاري تحميل الطلبات المتاحة..." /> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? (
        <EmptyState title="لا توجد طلبات الآن" message={dispatchMessage || "عند طلب رحلة من زبون ستظهر هنا."} actionTitle="تحديث" onAction={load} />
      ) : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id} tone="flat" style={styles.request}>
          <View style={styles.requestHeader}>
            <View style={styles.route}>
              <Text selectable style={styles.destination}>{ride.destination || "وجهة جديدة"}</Text>
              <Text selectable numberOfLines={1} style={styles.path}>من {ride.pickup || "-"} إلى {ride.destination || "-"}</Text>
            </View>
            <MobileBadge label={statusLabel(ride.status || "searching")} tone="warning" />
          </View>
          <View style={styles.details}>
            <Text selectable style={styles.detail}>{ride.city || ride.cityId || "المدينة"}</Text>
            <Text selectable style={styles.detail}>{km(ride.routeDistanceKm || ride.distanceKm)}</Text>
            <Text selectable style={styles.detail}>{money(ride.price || ride.fareIls)}</Text>
            <Text selectable style={styles.detail}>{paymentLabel(ride.paymentMethod)}</Text>
          </View>
          <MobileButton title="قبول الرحلة" variant="accent" onPress={() => accept(ride.id)} />
        </MobileCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusLine: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  request: { gap: spacing.xs },
  requestHeader: { flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  route: { alignItems: "flex-end", gap: 3 },
  destination: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  path: { color: colors.muted, fontSize: 12, textAlign: "right" },
  details: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  detail: { color: colors.textSoft, fontSize: 11.5, fontWeight: "800", paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.055)" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
