import { useEffect } from "react";
import { connectMobileSocket, joinRideRoom, subscribeToRideEvents } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";
import { isActiveRide, isFinishedRide } from "../utils/rideStatus";

export function useCustomerRideRealtime() {
  const { state, dispatch } = useMobileApp();
  const ride = state.currentRide;

  useEffect(() => {
    if (state.role !== "customer" || !state.token || !ride?.id) return undefined;
    const client = connectMobileSocket(
      {
        token: state.token,
        role: "customer",
        phone: state.currentUser?.phone,
        userId: state.currentUser?.id,
        customerId: state.currentUser?.id,
        customerPhone: state.currentUser?.phone,
        rideId: ride.id
      },
      {
        onConnectionChange: (connected, statusName) => {
          dispatch({ type: "patch", patch: { socketStatus: statusName || (connected ? "connected" : "disconnected") } });
          if (connected) joinRideRoom(ride.id);
        }
      }
    );

    const unsubscribe = subscribeToRideEvents((payload) => {
      const nextRide = payload?.ride;
      if (!nextRide || String(nextRide.id) !== String(ride.id)) return;
      dispatch({ type: "setActiveRide", ride: nextRide, status: "idle" });
      if (isFinishedRide(nextRide)) {
        dispatch({ type: "patch", patch: { toast: "تم تحديث حالة الرحلة." } });
      }
    });

    if (client?.connected) joinRideRoom(ride.id);
    return unsubscribe;
  }, [state.role, state.token, state.currentUser?.id, state.currentUser?.phone, ride?.id]);

  return { hasActiveRide: isActiveRide(ride) };
}
