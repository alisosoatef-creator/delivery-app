import { useEffect, useMemo, useState } from "react";
import { updateDriverOnlineStatus } from "../services/driverApi";
import { clearMobileSession, saveMobileSession } from "../services/sessionStorage";
import { connectMobileSocket, disconnectMobileSocket, subscribeToDriverEvents } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage } from "../utils/errorUtils";

function driverSessionFromState(state, driver = {}) {
  return {
    ...state.session,
    token: state.token,
    role: "driver",
    driverId: state.currentUser?.driverId || state.session?.driverId || driver.id || "",
    phone: state.currentUser?.phone || state.session?.phone || driver.phone || "",
    userId: state.currentUser?.id || state.session?.id || ""
  };
}

export function useDriverAvailability() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};
  const currentUser = state.currentUser || {};
  const session = useMemo(() => driverSessionFromState(state, driver), [driver, state.currentUser, state.session, state.token]);
  const [available, setAvailable] = useState((driver.onlineStatus || state.driverOnlineStatus || currentUser.onlineStatus || "offline") === "online");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const nextOnlineStatus = driver.onlineStatus || state.driverOnlineStatus || currentUser.onlineStatus || "offline";
    setAvailable(nextOnlineStatus === "online");
  }, [driver.onlineStatus, currentUser.onlineStatus, state.driverOnlineStatus]);

  useEffect(() => {
    if (!session.driverId || !state.token) return undefined;
    connectMobileSocket(session);
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      if (eventName !== "driver:online-status-updated") return;
      const updatedDriver = payload?.driver;
      if (!updatedDriver?.id || String(updatedDriver.id) !== String(session.driverId)) return;
      applyDriverSession(updatedDriver, false);
    });
    return unsubscribe;
  }, [session.driverId, session.phone, state.token]);

  async function applyDriverSession(updatedDriver, persist = true) {
    const nextUser = {
      ...currentUser,
      driverId: updatedDriver.id,
      phone: updatedDriver.phone,
      fullName: updatedDriver.fullName || currentUser.fullName,
      onlineStatus: updatedDriver.onlineStatus,
      online: updatedDriver.online
    };
    const nextSession = {
      ...(state.session || {}),
      token: state.token,
      driver: { ...(state.session?.driver || {}), ...updatedDriver },
      driverId: updatedDriver.id,
      phone: updatedDriver.phone
    };
    setAvailable(updatedDriver.onlineStatus === "online");
    dispatch({
      type: "patch",
      patch: {
        currentUser: nextUser,
        session: nextSession,
        driverOnlineStatus: updatedDriver.onlineStatus,
        connectionMessage: ""
      }
    });
    if (persist) {
      await saveMobileSession({
        token: state.token,
        role: "driver",
        currentUser: nextUser,
        session: nextSession,
        driverSession: updatedDriver,
        driverId: updatedDriver.id,
        phone: updatedDriver.phone,
        userId: nextUser.id
      });
    }
  }

  async function toggleAvailability() {
    if (!session.driverId) {
      setError("بيانات الكابتن غير مكتملة. سجل الدخول مرة أخرى.");
      return;
    }
    const previous = available;
    const nextAvailable = !previous;
    setAvailable(nextAvailable);
    setStatus("saving");
    setError("");
    try {
      const payload = await updateDriverOnlineStatus(nextAvailable, session);
      await applyDriverSession(payload.driver);
      dispatch({ type: "toast", message: nextAvailable ? "أصبحت متاحا لاستقبال الطلبات." : "أصبحت غير متاح للطلبات الجديدة." });
    } catch (requestError) {
      setAvailable(previous);
      const message = apiErrorMessage(requestError, "تعذر تحديث حالة توفر الكابتن.");
      setError(message);
      dispatch({ type: "patch", patch: { connectionMessage: message } });
    } finally {
      setStatus("idle");
    }
  }

  async function logout() {
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل خروج الكابتن." });
  }

  function goToAvailable() {
    dispatch({ type: "navigate", area: "driver", screen: "available" });
  }

  function goToCurrent() {
    dispatch({ type: "navigate", area: "driver", screen: "current" });
  }

  function goToEarnings() {
    dispatch({ type: "navigate", area: "driver", screen: "earnings" });
  }

  function goToSupport() {
    dispatch({ type: "navigate", area: "driver", screen: "support" });
  }

  return {
    driver,
    currentUser,
    available,
    status,
    error,
    availableCount: state.availableRides?.length || 0,
    currentRide: state.currentRide,
    socketStatus: state.socketStatus,
    toggleAvailability,
    logout,
    goToAvailable,
    goToCurrent,
    goToEarnings,
    goToSupport
  };
}
