import { useEffect, useState } from "react";
import { Text } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { driverDevLogin, fetchDriverDevDrivers } from "../../services/driverApi";
import { saveDriverSession } from "../../services/sessionStorage";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors } from "../../utils/mobileTheme";

export function DevDriverLoginScreen() {
  const { dispatch } = useMobileApp();
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDriverDevDrivers()
      .then((list) => {
        setDrivers(list);
        setDriverId(list[0]?.id || "");
      })
      .catch((requestError) => {
        setDrivers([]);
        dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
      });
  }, []);

  async function submit() {
    setError("");
    try {
      const payload = await driverDevLogin({ driverId, phone });
      const driver = payload.driver;
      await saveDriverSession({ token: payload.token, user: payload.user, driver });
      dispatch({
        type: "login",
        token: payload.token,
        role: "driver",
        user: { ...payload.user, driverId: driver.id, phone: driver.phone, fullName: driver.fullName },
        session: { ...payload.user, token: payload.token, driver, driverId: driver.id, phone: driver.phone },
        toast: "تم دخول الكابتن للتطوير."
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر دخول الكابتن."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    }
  }

  return (
    <ScreenContainer title="مدخل الكابتن" subtitle="Development Only. لا يدخل أي طلب انضمام قبل موافقة الأدمن.">
      <MobileCard>
        <MobileBadge label="Development Only" tone="warning" />
        <Text selectable style={{ color: colors.muted }}>اختر كابتنًا موافقًا عليه أو أدخل رقم هاتفه.</Text>
        <MobileInput label="Driver ID" value={driverId} onChangeText={setDriverId} placeholder={drivers[0]?.id || "driver_..."} />
        <MobileInput label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title="دخول لوحة الكابتن" onPress={submit} disabled={!driverId && !phone} />
        <MobileButton title="رجوع إلى دخول الزبون" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}
