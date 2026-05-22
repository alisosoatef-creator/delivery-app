import { useEffect } from "react";
import { fetchActiveCustomerRide } from "../services/ridesApi";
import { useMobileApp } from "../store/mobileStore";
import { connectionMessageFor } from "../utils/errorUtils";
import { isActiveRide } from "../utils/rideStatus";

export function useCustomerActiveRide({ enabled = true } = {}) {
  const { state, dispatch } = useMobileApp();
  const session = { phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token };

  async function refreshActiveRide() {
    if (!enabled || state.role !== "customer" || !state.token) return null;
    dispatch({ type: "activeRideStatus", status: "loading" });
    try {
      const activeRide = await fetchActiveCustomerRide(session);
      if (activeRide) {
        dispatch({ type: "setActiveRide", ride: activeRide, status: "idle" });
      } else {
        dispatch({ type: "activeRideStatus", status: "idle" });
      }
      dispatch({ type: "patch", patch: { connectionMessage: "" } });
      return activeRide;
    } catch (error) {
      dispatch({ type: "activeRideStatus", status: "error", error: error.message || "تعذر جلب الرحلة النشطة." });
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(error) } });
      return null;
    }
  }

  useEffect(() => {
    if (!enabled || state.role !== "customer" || !state.token) return;
    if (isActiveRide(state.currentRide)) return;
    refreshActiveRide();
  }, [enabled, state.role, state.token, state.currentUser?.id, state.currentUser?.phone]);

  return { refreshActiveRide };
}
