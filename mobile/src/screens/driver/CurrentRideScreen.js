import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { EmptyState, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchDriverRides, updateDriverRideStatus } from "../../services/driverApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

const nextActions = {
  accepted: ["driver_arriving", "أنا بالطريق"],
  driver_arriving: ["arrived", "وصلت"],
  arrived: ["in_progress", "بدأت الرحلة"],
  in_progress: ["completed", "إنهاء الرحلة"]
};

export function CurrentRideScreen() {
  const { state } = useMobileApp();
  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");
  const session = { ...state.session, token: state.token, driverId: state.currentUser?.driverId, phone: state.currentUser?.phone };
  const currentRide = useMemo(() => rides.find((ride) => ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status)), [rides]);
  const action = currentRide ? nextActions[currentRide.status] : null;

  function load() {
    fetchDriverRides(session).then(setRides).catch((requestError) => setError(requestError.message || "تعذر تحميل رحلات الكابتن."));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  async function update(status) {
    try {
      await updateDriverRideStatus(currentRide.id, status, session);
      load();
    } catch (requestError) {
      setError(requestError.message || "تعذر تحديث حالة الرحلة.");
    }
  }

  return (
    <ScreenContainer title="رحلتي الحالية" subtitle="تحديث التسلسل الأساسي للرحلة. GPS الموبايل الكامل في المرحلة 26.">
      {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
      {!currentRide ? <EmptyState title="لا توجد رحلة نشطة" message="اقبل رحلة من شاشة الرحلات المتاحة." /> : null}
      {currentRide ? (
        <MobileCard>
          <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{currentRide.pickup} ← {currentRide.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>الحالة: {currentRide.status}</Text>
          {action ? <MobileButton title={action[1]} onPress={() => update(action[0])} /> : null}
        </MobileCard>
      ) : null}
    </ScreenContainer>
  );
}
