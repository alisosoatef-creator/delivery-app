import { useEffect, useState } from "react";
import { driverDevLogin, fetchDriverDevDrivers } from "../services/driverApi";
import { saveDriverSession } from "../services/sessionStorage";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../utils/errorUtils";

export function useDevDriverLogin() {
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

  function goToCustomerLogin() {
    dispatch({ type: "navigate", area: "auth", screen: "login" });
  }

  return {
    drivers,
    driverId,
    setDriverId,
    phone,
    setPhone,
    error,
    submit,
    goToCustomerLogin
  };
}
