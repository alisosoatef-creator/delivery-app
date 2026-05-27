import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatusTimeline } from "../../components/ui";
import { fetchDriverRides, updateDriverRideStatus } from "../../services/driverApi";
import { startDriverLocationWatch } from "../../services/locationService";
import { connectMobileSocket, emitDriverLocation, emitDriverLocationUnavailable, joinRideRoom, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money, radii, shadows, spacing } from "../../utils/mobileTheme";
import { statusLabel } from "../../utils/rideStatus";

const nextActions = {
  accepted: ["driver_arriving", "أنا بالطريق"],
  driver_arriving: ["arrived", "وصلت"],
  arrived: ["in_progress", "بدأت الرحلة"],
  in_progress: ["completed", "إنهاء الرحلة"]
};

const visibleStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];

function trackingLabel(status) {
  if (status === "active") return "مباشر";
  if (status === "denied") return "مرفوض";
  if (status === "requesting") return "جاري التفعيل";
  if (status === "unavailable") return "غير متاح";
  return "غير مفعل";
}

function trackingTone(status) {
  if (status === "active") return "success";
  if (status === "denied" || status === "unavailable") return "danger";
  if (status === "requesting") return "info";
  return "warning";
}

function timeLabel(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "محفظة";
  return "نقدًا";
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

export function CurrentRideScreen() {
  const { state, dispatch } = useMobileApp();
  const watchRef = useRef(null);
  const [rides, setRides] = useState(state.currentRide ? [state.currentRide] : []);
  const [error, setError] = useState("");
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [trackingStatus, setTrackingStatus] = useState(state.liveTrackingStatus || "idle");
  const [driverLocation, setDriverLocation] = useState(state.driverLocation);
  const session = {
    ...state.session,
    token: state.token,
    role: "driver",
    driverId: state.currentUser?.driverId || state.session?.driverId || state.session?.driver?.id,
    phone: state.currentUser?.phone || state.session?.phone || state.session?.driver?.phone,
    userId: state.currentUser?.id || state.session?.id
  };
  const currentRide = useMemo(() => {
    const active = rides.find((ride) => ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status));
    if (active) return active;
    if (visibleStatuses.includes(state.currentRide?.status)) return state.currentRide;
    return rides.find((ride) => visibleStatuses.includes(ride.status)) || null;
  }, [rides, state.currentRide]);
  const action = currentRide ? nextActions[currentRide.status] : null;
  const completed = currentRide?.status === "completed";
  const driverLocationTime = timeLabel(driverLocation?.timestamp || state.lastDriverLocationAt);
  const pickupPoint = useMemo(() => ridePoint(currentRide, "pickup"), [currentRide]);
  const destinationPoint = useMemo(() => ridePoint(currentRide, "destination"), [currentRide]);

  function load() {
    setError("");
    fetchDriverRides(session)
      .then((items) => {
        setRides(items);
        const active = items.find((ride) => ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status)) || items.find((ride) => ride.id === state.currentRide?.id);
        if (active) dispatch({ type: "setCurrentRide", ride: active, area: "driver", screen: "current" });
        dispatch({ type: "patch", patch: { connectionMessage: "" } });
      })
      .catch((requestError) => {
        setError(apiErrorMessage(requestError, "تعذر تحميل رحلات الكابتن."));
        dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
      });
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    if (!session.driverId) return undefined;
    connectMobileSocket(
      { ...session, rideId: currentRide?.id },
      {
        onConnectionChange: (connected, statusName) => {
          const nextStatus = statusName || (connected ? "connected" : "disconnected");
          setSocketStatus(nextStatus);
          dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
          if (connected && currentRide?.id) joinRideRoom(currentRide.id);
        }
      }
    );
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      const nextRide = payload?.ride;
      if (eventName === "ride:created" || !nextRide || String(nextRide.driverId || "") === String(session.driverId) || String(nextRide.id || "") === String(currentRide?.id || "")) {
        load();
      }
    });
    return unsubscribe;
  }, [session.driverId, session.phone, session.token, currentRide?.id]);

  useEffect(() => {
    if (currentRide?.id) joinRideRoom(currentRide.id);
  }, [currentRide?.id]);

  useEffect(() => {
    return () => {
      if (watchRef.current?.remove) watchRef.current.remove();
    };
  }, []);

  async function update(status) {
    if (!currentRide) return;
    setError("");
    try {
      const payload = await updateDriverRideStatus(currentRide.id, status, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "driver", screen: "current", toast: payload.ride?.status === "completed" ? "تم إنهاء الرحلة." : "تم تحديث حالة الرحلة." });
      if (status === "completed") stopTracking(false);
      load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تحديث حالة الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    }
  }

  async function startTracking() {
    if (!currentRide) return;
    setError("");
    setTrackingStatus("requesting");
    dispatch({ type: "patch", patch: { liveTrackingStatus: "requesting" } });
    connectMobileSocket({ ...session, rideId: currentRide.id }, { onConnectionChange: (connected, statusName) => setSocketStatus(statusName || (connected ? "connected" : "disconnected")) });

    try {
      const subscription = await startDriverLocationWatch(
        (location) => {
          setDriverLocation(location);
          setTrackingStatus("active");
          dispatch({ type: "patch", patch: { driverLocation: location, liveTrackingStatus: "active", lastDriverLocationAt: location.timestamp || new Date().toISOString(), toast: "تم تحديث موقع الكابتن مباشرًا." } });
          const sent = emitDriverLocation({ rideId: currentRide.id, driverId: session.driverId, lat: location.lat, lng: location.lng, timestamp: location.timestamp });
          if (!sent) setSocketStatus("offline");
        },
        () => {
          setTrackingStatus("denied");
          dispatch({ type: "patch", patch: { liveTrackingStatus: "denied" } });
          setError("لم يتم السماح بالوصول لموقع الكابتن.");
        }
      );
      watchRef.current = subscription;
      if (!subscription) setTrackingStatus("denied");
    } catch (requestError) {
      setTrackingStatus("denied");
      dispatch({ type: "patch", patch: { liveTrackingStatus: "denied" } });
      setError(requestError.message || "تعذر تفعيل موقع الكابتن.");
    }
  }

  function stopTracking(showToast = true) {
    if (watchRef.current?.remove) watchRef.current.remove();
    watchRef.current = null;
    setTrackingStatus("idle");
    dispatch({ type: "patch", patch: { liveTrackingStatus: "idle", toast: showToast ? "تم إيقاف تتبع موقع الكابتن." : state.toast } });
    if (currentRide?.id && session.driverId) {
      emitDriverLocationUnavailable({ rideId: currentRide.id, driverId: session.driverId, reason: "driver-stopped-tracking" });
    }
  }

  return (
    <ScreenContainer showHeader={false} compact>
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {!currentRide ? <EmptyState title="لا توجد رحلة نشطة" message="اقبل رحلة من شاشة الطلبات." actionTitle="عرض الطلبات" onAction={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} /> : null}
      {currentRide ? (
        <>
          <View style={styles.header}>
            <View>
              <Text selectable style={styles.title}>رحلتي الحالية</Text>
              <Text selectable style={styles.subtitle}>{statusLabel(currentRide.status)}</Text>
            </View>
            <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
          </View>
          <MobileRideMap pickup={pickupPoint} destination={destinationPoint} driverLocation={driverLocation} userLocation={driverLocation} rideStatus={currentRide.status} height={252} />
          {socketStatus !== "connected" ? <Text selectable style={styles.mapNotice}>التحديث المباشر غير متاح مؤقتًا، ويمكنك المتابعة يدويًا.</Text> : null}
          <MobileCard tone="flat" style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <MobileBadge label={statusLabel(currentRide.status)} tone={completed ? "success" : "info"} />
              <Text selectable style={styles.cardTitle}>مسار الرحلة</Text>
            </View>
            <View style={styles.routePoints}>
              <View style={styles.routePoint}>
                <Text selectable style={styles.pointLabel}>نقطة الانطلاق</Text>
                <Text selectable style={styles.pointValue} numberOfLines={1}>{currentRide.pickup || "-"}</Text>
              </View>
              <View style={styles.routePoint}>
                <Text selectable style={styles.pointLabel}>الوجهة</Text>
                <Text selectable style={styles.pointValue} numberOfLines={1}>{currentRide.destination || "-"}</Text>
              </View>
            </View>
          </MobileCard>

          <MobileCard tone="flat">
            <StatusTimeline status={currentRide.status} />
            <InfoRow label="الزبون" value={currentRide.customerName || "-"} accent />
            <InfoRow label="الهاتف" value={currentRide.customerPhone || "-"} />
            <InfoRow label="السعر" value={money(currentRide.price || currentRide.fareIls)} />
            <InfoRow label="المسافة" value={km(currentRide.routeDistanceKm || currentRide.distanceKm)} />
            <InfoRow label="الدفع" value={paymentLabel(currentRide.paymentMethod)} />
          </MobileCard>
          {!completed ? (
            <MobileCard tone="flat">
              <View style={styles.trackingHeader}>
                <Text selectable style={styles.cardTitle}>التتبع</Text>
                <View style={styles.trackingPills}>
                  <MobileBadge label={trackingLabel(trackingStatus)} tone={trackingTone(trackingStatus)} />
                </View>
              </View>
              {driverLocationTime ? <Text selectable style={styles.muted}>آخر تحديث للموقع: {driverLocationTime}</Text> : null}
              <View style={styles.trackingActions}>
                <MobileButton title="تفعيل موقعي المباشر" compact variant="secondary" onPress={startTracking} disabled={trackingStatus === "requesting" || trackingStatus === "active"} />
                <MobileButton title="إيقاف التتبع" compact variant="danger" onPress={() => stopTracking(true)} disabled={trackingStatus !== "active"} />
              </View>
            </MobileCard>
          ) : (
            <MobileCard tone="hero" style={styles.completedCard}>
              <Text selectable style={styles.cardTitle}>تم إنهاء الرحلة</Text>
              <Text selectable style={styles.muted}>تم حفظ الرحلة ضمن سجل الكابتن. يمكنك العودة للطلبات لاستقبال رحلة جديدة.</Text>
              <MobileButton title="عرض الطلبات" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} />
            </MobileCard>
          )}
          {action ? (
            <MobileCard tone="hero" style={styles.nextActionCard}>
              <Text selectable style={styles.nextActionHint}>الخطوة التالية</Text>
              <MobileButton title={action[1]} variant="accent" onPress={() => update(action[0])} />
            </MobileCard>
          ) : null}
        </>
      ) : null}
      <MobileButton title="تحديث" compact variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  title: { color: colors.text, fontSize: 21, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.primary, fontSize: 13, textAlign: "right", marginTop: 2 },
  cardTitle: { color: colors.text, fontSize: 14.5, fontWeight: "900", textAlign: "right" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" },
  mapNotice: { color: colors.muted, textAlign: "right", fontSize: 12, fontWeight: "700", marginTop: -spacing.xs },
  muted: { color: colors.muted, lineHeight: 21, textAlign: "right", fontWeight: "600" },
  routeCard: { gap: spacing.xs, backgroundColor: "rgba(255, 255, 255, 0.038)", borderColor: "rgba(41, 213, 201, 0.16)" },
  routeHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  routePoints: { gap: spacing.xs },
  routePoint: { paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, borderRadius: radii.sm },
  pointLabel: { color: colors.primary, textAlign: "right", fontSize: 12, fontWeight: "900" },
  pointValue: { color: colors.text, textAlign: "right", fontSize: 14, fontWeight: "800", marginTop: 2 },
  trackingHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  trackingPills: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  trackingActions: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  nextActionCard: { gap: spacing.xs, borderColor: "rgba(216, 173, 98, 0.22)", boxShadow: shadows.accentGlow },
  nextActionHint: { color: colors.muted, textAlign: "right", fontWeight: "900", fontSize: 12 },
  completedCard: { gap: spacing.sm, borderColor: "rgba(66, 231, 156, 0.2)", backgroundColor: "rgba(66, 231, 156, 0.055)" }
});
