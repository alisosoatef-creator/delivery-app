import { useState } from "react";
import { Text } from "react-native";
import { MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { cancelRide, fetchCustomerRideDetails } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

function hasAcceptedDriver(ride) {
  return ride?.driver && ["accepted", "driver_arriving", "arrived", "in_progress", "completed"].includes(ride.status);
}

export function CustomerRideStatusScreen() {
  const { state, dispatch } = useMobileApp();
  const [ride, setRide] = useState(state.currentRide);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };

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
    <ScreenContainer title="حالة الرحلة" subtitle={ride.status === "searching" ? "جاري البحث عن كابتن..." : "تابع حالة الرحلة من هنا."}>
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
