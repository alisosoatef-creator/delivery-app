import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader, StatusTimeline } from "../../components/ui";
import { cancelRide, fetchActiveCustomerRide, fetchCustomerRideDetails } from "../../services/ridesApi";
import { connectMobileSocket, joinRideRoom, subscribeToLocationEvents, subscribeToRideEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, km, money } from "../../utils/mobileTheme";
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
      {
        ...session,
        customerId: session.userId,
        customerPhone: session.phone,
        rideId: ride.id
      },
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
      dispatch({
        type: "patch",
        patch: {
          driverLocation: nextLocation,
          liveTrackingStatus: "active",
          lastDriverLocationAt: nextLocation.timestamp
        }
      });
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
      <ScreenContainer title="حالة الرحلة" subtitle="لا توجد رحلة نشطة الآن.">
        <EmptyState
          title={status === "loading" ? "جاري البحث عن رحلة نشطة..." : "لا توجد رحلة نشطة الآن"}
          message={error || "يمكنك طلب رحلة جديدة والعودة لهذه الشاشة عند الحاجة."}
          actionTitle="طلب رحلة جديدة"
          onAction={() => dispatch({ type: "navigate", area: "customer", screen: "request" })}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      eyebrow="تتبع الرحلة"
      title="حالة الرحلة"
      subtitle={ride.status === "searching" ? "جاري البحث عن كابتن قريب..." : "التحديثات تصل تلقائيًا عند توفر الاتصال المباشر."}
    >
      <MobileCard tone="soft">
        <MobileBadge label={socketStatus === "connected" ? "تحديث مباشر" : "تحديث يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <MobileRideMap
          pickup={pickupPoint}
          destination={destinationPoint}
          driverLocation={hasAcceptedDriver(ride) ? driverLocation : null}
          userLocation={state.currentLocation}
          rideStatus={ride.status}
        />
        {hasAcceptedDriver(ride) && !driverLocation ? <Text selectable style={styles.muted}>بانتظار تفعيل موقع الكابتن المباشر.</Text> : null}
      </MobileCard>

      <MobileCard tone={isFinishedRide(ride) ? "flat" : "gold"}>
        <SectionHeader title={statusLabel(ride.status)} subtitle={`${ride.pickup} ← ${ride.destination}`} />
        <MobileBadge label={statusLabel(ride.status)} tone={ride.status === "completed" ? "success" : ride.status === "cancelled" ? "danger" : "warning"} />
        <StatusTimeline status={ride.status} />
        <InfoRow label="السعر" value={money(ride.price || ride.fareIls)} />
        <InfoRow label="المسافة" value={km(ride.routeDistanceKm || ride.distanceKm)} />
        <InfoRow label="الدفع" value={ride.paymentMethod || "cash"} />
        {hasAcceptedDriver(ride) ? (
          <MobileCard tone="soft">
            <SectionHeader title={`الكابتن ${ride.driver.fullName}`} subtitle={`${ride.driver.vehicleType || ride.driver.vehicle || "مركبة"} · ${ride.driver.vehiclePlate || ride.driver.plate || "بدون لوحة"}`} />
          </MobileCard>
        ) : (
          <Text selectable style={styles.muted}>بانتظار قبول أحد الكباتن. لن تظهر بيانات الكابتن قبل القبول.</Text>
        )}
        {isFinishedRide(ride) ? <Text selectable style={styles.muted}>هذه الرحلة انتهت. يمكنك الرجوع للرئيسية أو طلب رحلة جديدة.</Text> : null}
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري التحديث..." : "تحديث حالة الرحلة"} variant="secondary" onPress={refresh} disabled={status === "loading"} />
        {["searching", "accepted"].includes(ride.status) ? <MobileButton title="إلغاء الرحلة" variant="danger" onPress={cancel} disabled={status === "cancel"} /> : null}
        {!isActiveRide(ride) ? <MobileButton title="العودة للرئيسية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "home" })} /> : null}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, textAlign: "right", lineHeight: 22, fontWeight: "800" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
