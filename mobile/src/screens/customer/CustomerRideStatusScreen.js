import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { cancelRide, fetchCustomerRideDetails } from "../../services/ridesApi";
import { connectMobileSocket, joinRideRoom, subscribeToLocationEvents, subscribeToRideEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

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
    if (!ride?.id) return undefined;
    const client = connectMobileSocket(
      {
        ...session,
        customerId: session.userId,
        customerPhone: session.phone,
        rideId: ride.id
      },
      {
        onConnectionChange: (connected) => {
          const nextStatus = connected ? "connected" : "offline";
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

    if (client.connected) joinRideRoom(ride.id);
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
    } catch (requestError) {
      setError(requestError.message || "تعذر تحديث حالة الرحلة.");
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
      setError(requestError.message || "تعذر إلغاء الرحلة.");
    } finally {
      setStatus("idle");
    }
  }

  if (!ride) {
    return (
      <ScreenContainer title="حالة الرحلة" subtitle="لا توجد رحلة نشطة بعد.">
        <MobileButton title="طلب رحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="حالة الرحلة" subtitle={ride.status === "searching" ? "جاري البحث عن كابتن..." : "تصل تحديثات الرحلة تلقائيًا عند توفر الاتصال المباشر."}>
      <MobileCard>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "تحديث يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
        <MobileRideMap
          pickup={pickupPoint}
          destination={destinationPoint}
          driverLocation={hasAcceptedDriver(ride) ? driverLocation : null}
          userLocation={state.currentLocation}
          rideStatus={ride.status}
        />
        {hasAcceptedDriver(ride) && !driverLocation ? <Text selectable style={{ color: colors.muted }}>بانتظار تفعيل موقع الكابتن المباشر.</Text> : null}
      </MobileCard>

      <MobileCard>
        <MobileBadge label={ride.status} tone={ride.status === "completed" ? "success" : ride.status === "cancelled" ? "danger" : "warning"} />
        <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{ride.pickup} ← {ride.destination}</Text>
        <Text selectable style={{ color: colors.muted }}>السعر: {ride.price || ride.fareIls || 0} ₪ · المسافة: {ride.routeDistanceKm || ride.distanceKm || "-"} كم · الدفع: {ride.paymentMethod || "cash"}</Text>
        {hasAcceptedDriver(ride) ? (
          <MobileCard tone="soft">
            <Text selectable style={{ color: colors.text, fontWeight: "900" }}>الكابتن: {ride.driver.fullName}</Text>
            <Text selectable style={{ color: colors.muted }}>{ride.driver.vehicleType || ride.driver.vehicle} · {ride.driver.vehiclePlate || ride.driver.plate || "بدون لوحة"}</Text>
          </MobileCard>
        ) : (
          <Text selectable style={{ color: colors.muted }}>بانتظار قبول أحد الكباتن. لن تظهر بيانات الكابتن قبل القبول.</Text>
        )}
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري التحديث..." : "تحديث حالة الرحلة"} variant="secondary" onPress={refresh} disabled={status === "loading"} />
        {["searching", "accepted"].includes(ride.status) ? <MobileButton title="إلغاء الرحلة" variant="danger" onPress={cancel} disabled={status === "cancel"} /> : null}
      </MobileCard>
    </ScreenContainer>
  );
}
