import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatusTimeline } from "../../components/ui";
import { cancelRide, fetchActiveCustomerRide, fetchCustomerRideDetails } from "../../services/ridesApi";
import { connectMobileSocket, joinRideRoom, subscribeToLocationEvents, subscribeToRideEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";
import { isActiveRide, isFinishedRide, statusLabel } from "../../utils/rideStatus";

const acceptedStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];

function hasAcceptedDriver(ride) {
  return ride?.driver && acceptedStatuses.includes(ride.status);
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

export function CustomerRideStatusScreen() {
  const { state, dispatch } = useMobileApp();
  const [ride, setRide] = useState(state.currentRide);
  const [driverLocation, setDriverLocation] = useState(state.driverLocation);
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const pickupPoint = useMemo(() => ridePoint(ride, "pickup"), [ride]);
  const destinationPoint = useMemo(() => ridePoint(ride, "destination"), [ride]);

  useEffect(() => {
    let mounted = true;
    async function bootRide() {
      setStatus("loading");
      setError("");
      try {
        if (ride?.id) {
          const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
          if (mounted && nextRide) {
            setRide(nextRide);
            dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
          }
        } else {
          const activeRide = await fetchActiveCustomerRide(session);
          if (mounted && activeRide) {
            setRide(activeRide);
            dispatch({ type: "setCurrentRide", ride: activeRide, area: "customer", screen: "ride-status" });
          }
        }
        dispatch({ type: "patch", patch: { connectionMessage: "" } });
      } catch (requestError) {
        if (mounted) {
          setError(apiErrorMessage(requestError, "تعذر جلب الرحلة النشطة."));
          dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
        }
      } finally {
        if (mounted) setStatus("idle");
      }
    }
    bootRide();
    return () => {
      mounted = false;
    };
  }, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  useEffect(() => {
    if (!ride?.id) return undefined;
    const client = connectMobileSocket(
      { ...session, customerId: session.userId, customerPhone: session.phone, rideId: ride.id },
      {
        onConnectionChange: (connected, statusName) => {
          const nextStatus = statusName || (connected ? "connected" : "disconnected");
          setSocketStatus(nextStatus);
          dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
          if (connected) joinRideRoom(ride.id);
        }
      }
    );

    const unsubscribeRide = subscribeToRideEvents((payload) => {
      const nextRide = payload?.ride;
      if (!nextRide || String(nextRide.id) !== String(ride.id)) return;
      setRide(nextRide);
      dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
    });

    const unsubscribeLocation = subscribeToLocationEvents((payload, eventName) => {
      if (String(payload?.rideId || "") !== String(ride.id)) return;
      if (eventName === "driver:location-unavailable") {
        dispatch({ type: "patch", patch: { liveTrackingStatus: "unavailable" } });
        return;
      }
      const location = payload?.location || { lat: payload?.lat, lng: payload?.lng };
      const nextLocation = {
        lat: Number(location.lat),
        lng: Number(location.lng),
        label: "موقع الكابتن",
        timestamp: payload?.timestamp || new Date().toISOString()
      };
      if (!Number.isFinite(nextLocation.lat) || !Number.isFinite(nextLocation.lng)) return;
      setDriverLocation(nextLocation);
      dispatch({ type: "patch", patch: { driverLocation: nextLocation, liveTrackingStatus: "active", lastDriverLocationAt: nextLocation.timestamp } });
    });

    if (client?.connected) joinRideRoom(ride.id);
    return () => {
      unsubscribeRide();
      unsubscribeLocation();
    };
  }, [ride?.id, session.phone, session.token, session.userId]);

  async function refresh() {
    if (!ride?.id) return;
    setStatus("loading");
    setError("");
    try {
      const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
      setRide(nextRide);
      dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
      dispatch({ type: "patch", patch: { connectionMessage: "" } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تحديث حالة الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  async function cancel() {
    setStatus("cancel");
    setError("");
    try {
      const payload = await cancelRide(ride.id, session);
      setRide(payload.ride);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "customer", screen: "ride-status", toast: "تم إلغاء الرحلة." });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر إلغاء الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  if (!ride) {
    return (
      <ScreenContainer showHeader={false}>
        <EmptyState
          title={status === "loading" ? "جاري البحث عن رحلة نشطة..." : "لا توجد رحلة نشطة الآن"}
          message={error || "يمكنك طلب رحلة جديدة والعودة لهذه الشاشة عند الحاجة."}
          actionTitle="طلب رحلة جديدة"
          onAction={() => dispatch({ type: "navigate", area: "customer", screen: "request" })}
        />
      </ScreenContainer>
    );
  }

  const accepted = hasAcceptedDriver(ride);
  const finished = isFinishedRide(ride);

  return (
    <ScreenContainer showHeader={false} compact>
      <View style={styles.header}>
        <View>
          <Text selectable style={styles.title}>{finished ? "ملخص الرحلة" : "تتبع الرحلة"}</Text>
          <Text selectable style={styles.subtitle}>{ride.status === "searching" ? "جاري البحث عن كابتن قريب" : statusLabel(ride.status)}</Text>
        </View>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
      </View>

      <MobileRideMap
        pickup={pickupPoint}
        destination={destinationPoint}
        driverLocation={accepted ? driverLocation : null}
        userLocation={state.currentLocation}
        rideStatus={ride.status}
        height={300}
      />

      <MobileCard tone={finished ? "flat" : "soft"} style={styles.statusCard}>
        <View style={styles.rowBetween}>
          <Text selectable style={styles.statusTitle}>{statusLabel(ride.status)}</Text>
          <Text selectable style={styles.price}>{money(ride.price || ride.fareIls)}</Text>
        </View>
        <StatusTimeline status={ride.status} />
        <InfoRow label="المسار" value={`${ride.pickup} ← ${ride.destination}`} accent />
        <InfoRow label="المسافة" value={km(ride.routeDistanceKm || ride.distanceKm)} />
        <InfoRow label="الدفع" value={ride.paymentMethod || "cash"} />
      </MobileCard>

      {accepted ? (
        <MobileCard tone="flat" style={styles.driverCard}>
          <Text selectable style={styles.cardTitle}>الكابتن</Text>
          <Text selectable style={styles.driverName}>{ride.driver.fullName}</Text>
          <Text selectable style={styles.muted}>{ride.driver.vehicleType || ride.driver.vehicle || "مركبة"} · {ride.driver.vehiclePlate || ride.driver.plate || "بدون لوحة"}</Text>
          {!driverLocation ? <Text selectable style={styles.muted}>بانتظار تفعيل موقع الكابتن المباشر.</Text> : null}
        </MobileCard>
      ) : (
        <Text selectable style={styles.muted}>لن تظهر بيانات الكابتن قبل قبول الرحلة.</Text>
      )}

      {finished ? <Text selectable style={styles.muted}>هذه الرحلة انتهت. يمكنك الرجوع للرئيسية أو طلب رحلة جديدة.</Text> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <MobileButton title={status === "loading" ? "جاري التحديث..." : "تحديث"} compact variant="secondary" onPress={refresh} loading={status === "loading"} />
        {["searching", "accepted"].includes(ride.status) ? <MobileButton title="إلغاء" compact variant="danger" onPress={cancel} loading={status === "cancel"} /> : null}
        {!isActiveRide(ride) ? <MobileButton title="الرئيسية" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "home" })} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, textAlign: "right", marginTop: 2 },
  statusCard: { gap: spacing.xs },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  statusTitle: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" },
  price: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  driverCard: { gap: spacing.xs },
  cardTitle: { color: colors.muted, textAlign: "right", fontSize: 12, fontWeight: "700" },
  driverName: { color: colors.text, textAlign: "right", fontSize: 18, fontWeight: "800" },
  muted: { color: colors.muted, textAlign: "right", lineHeight: 21, fontWeight: "600" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" },
  actions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }
});
