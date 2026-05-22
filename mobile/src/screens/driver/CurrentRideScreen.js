import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { fetchDriverRides, updateDriverRideStatus } from "../../services/driverApi";
import { startDriverLocationWatch } from "../../services/locationService";
import { connectMobileSocket, emitDriverLocation, emitDriverLocationUnavailable, joinRideRoom, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";
import { statusLabel } from "../../utils/rideStatus";

const nextActions = {
  accepted: ["driver_arriving", "أنا بالطريق"],
  driver_arriving: ["arrived", "وصلت"],
  arrived: ["in_progress", "بدأت الرحلة"],
  in_progress: ["completed", "إنهاء الرحلة"]
};

const visibleStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];

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
  const session = { ...state.session, token: state.token, role: "driver", driverId: state.currentUser?.driverId, phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const currentRide = useMemo(() => {
    const active = rides.find((ride) => ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status));
    if (active) return active;
    if (visibleStatuses.includes(state.currentRide?.status)) return state.currentRide;
    return rides.find((ride) => visibleStatuses.includes(ride.status)) || null;
  }, [rides, state.currentRide]);
  const action = currentRide ? nextActions[currentRide.status] : null;
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
          dispatch({
            type: "patch",
            patch: {
              driverLocation: location,
              liveTrackingStatus: "active",
              lastDriverLocationAt: location.timestamp || new Date().toISOString(),
              toast: "تم تحديث موقع الكابتن مباشرًا."
            }
          });
          const sent = emitDriverLocation({
            rideId: currentRide.id,
            driverId: session.driverId,
            lat: location.lat,
            lng: location.lng,
            timestamp: location.timestamp
          });
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
    <ScreenContainer eyebrow="رحلة الكابتن" title="رحلتي الحالية" subtitle="تابع الرحلة وحدث الحالة بالتسلسل الصحيح.">
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {!currentRide ? <EmptyState title="لا توجد رحلة نشطة" message="اقبل رحلة من شاشة الرحلات المتاحة." actionTitle="الرحلات المتاحة" onAction={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} /> : null}
      {currentRide ? (
        <MobileCard tone="soft">
          <SectionHeader title={statusLabel(currentRide.status)} subtitle={`${currentRide.pickup} ← ${currentRide.destination}`} />
          <MobileBadge label={currentRide.status === "completed" ? "تم إنهاء الرحلة" : "رحلة نشطة"} tone={currentRide.status === "completed" ? "success" : "warning"} />
          <MobileRideMap
            pickup={pickupPoint}
            destination={destinationPoint}
            driverLocation={driverLocation}
            userLocation={driverLocation}
            rideStatus={currentRide.status}
          />
          <InfoRow label="الزبون" value={currentRide.customerName || "-"} accent />
          <InfoRow label="الهاتف" value={currentRide.customerPhone || "-"} />
          <InfoRow label="السعر" value={money(currentRide.price || currentRide.fareIls)} />
          <InfoRow label="المسافة" value={km(currentRide.routeDistanceKm || currentRide.distanceKm)} />
          <InfoRow label="الدفع" value={currentRide.paymentMethod || "cash"} />
          <MobileCard tone="flat">
            <SectionHeader title="التتبع المباشر" subtitle={socketStatus === "connected" ? "Socket.IO متصل" : "التحديث اليدوي متاح كاحتياط"} />
            <View style={styles.trackingPills}>
              <MobileBadge label={socketStatus === "connected" ? "مباشر" : "غير متصل"} tone={socketStatus === "connected" ? "success" : "warning"} />
              <MobileBadge label={trackingStatus === "active" ? "GPS مفعل" : trackingStatus === "requesting" ? "جاري الطلب" : trackingStatus === "denied" ? "GPS مرفوض" : "GPS غير مفعل"} tone={trackingStatus === "active" ? "success" : trackingStatus === "denied" ? "danger" : "warning"} />
            </View>
            <View style={styles.trackingActions}>
              <MobileButton title="تفعيل موقعي المباشر" variant="secondary" onPress={startTracking} disabled={trackingStatus === "requesting" || trackingStatus === "active"} />
              <MobileButton title="إيقاف التتبع" variant="danger" onPress={() => stopTracking(true)} disabled={trackingStatus !== "active"} />
            </View>
          </MobileCard>
          {action ? <MobileButton title={action[1]} onPress={() => update(action[0])} /> : <Text selectable style={styles.muted}>تم إنهاء الرحلة أو لا توجد خطوة تالية لهذه الحالة.</Text>}
        </MobileCard>
      ) : null}
      <MobileButton title="تحديث رحلاتي" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.red, textAlign: "right", fontWeight: "800" },
  muted: { color: colors.muted, lineHeight: 22, textAlign: "right", fontWeight: "800" },
  trackingPills: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  trackingActions: { gap: spacing.sm }
});
