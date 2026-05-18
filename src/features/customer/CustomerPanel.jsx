import { useEffect, useMemo, useState } from "react";
import { useRidesApi } from "../../hooks/useRidesApi.js";
import { buildRideHistory, rideHasAcceptedDriver } from "../../utils/rideUtils.js";
import { RIDE_STATUSES } from "../../utils/rideStatus.js";
import { MapBoard } from "../rides/MapBoard.jsx";
import { PhaseTwoExperience } from "../rides/PhaseTwoExperience.jsx";
import { RideDetailPage } from "../rides/RideDetailPage.jsx";
import { RideHistoryPanel } from "../rides/RideHistoryPanel.jsx";
import { RouteSearchCard } from "../rides/RouteSearchCard.jsx";
import { WalletPaymentPanel } from "../payments/WalletPaymentPanel.jsx";
import { CustomerSupportPanel } from "../support/CustomerSupportPanel.jsx";
import { AccountProfilePanel } from "./AccountProfilePanel.jsx";

export function CustomerPanel(props) {
  const { state, dispatch, t, isArabic, selectedDriver, requestRide, updateRideStatus, activeView, setActiveView } = props;
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const customerId = state.currentUser?.id || state.session?.id || "";
  const customerPhone = state.currentUser?.phone || state.session?.phone || state.phone || "";
  const ridesApi = useRidesApi({ enabled: Boolean(state.session), customerId, customerPhone });

  useEffect(() => {
    if (!ridesApi.customerRidesLoaded) return;
    dispatch({ type: "patch", patch: { customerRides: ridesApi.customerRides, backendLive: !ridesApi.backendError } });
  }, [dispatch, ridesApi.backendError, ridesApi.customerRides, ridesApi.customerRidesLoaded]);

  const rideHistory = useMemo(
    () => buildRideHistory(state, selectedDriver, isArabic),
    [
      state.ride,
      state.customerRides,
      state.admin.recentRides,
      state.drivers,
      state.pickup,
      state.dropoff,
      state.quote,
      state.paymentMethod,
      state.cityId,
      state.cities,
      state.language,
      selectedDriver,
      isArabic
    ]
  );
  const filteredRideHistory = useMemo(
    () => rideHistory.filter((ride) => historyFilter === "all" || ride.statusGroup === historyFilter),
    [historyFilter, rideHistory]
  );
  const selectedHistoryRide =
    filteredRideHistory.find((ride) => ride.id === selectedHistoryId) || filteredRideHistory[0] || rideHistory[0];
  const customerHasAcceptedDriver = rideHasAcceptedDriver(state.ride);

  if (activeView === "trips") {
    return (
      <div className="customer-view-shell trips-view">
        <section className="phase-three-panel">
          <RideHistoryPanel
            rides={filteredRideHistory}
            allRides={rideHistory}
            selectedRide={selectedHistoryRide}
            filter={historyFilter}
            setFilter={setHistoryFilter}
            setSelectedRideId={setSelectedHistoryId}
            isArabic={isArabic}
            language={state.language}
          />
        </section>
        <section className="ride-detail-page">
          <RideDetailPage ride={selectedHistoryRide} state={state} dispatch={dispatch} t={t} isArabic={isArabic} />
        </section>
      </div>
    );
  }

  if (activeView === "wallet") {
    return (
      <div className="customer-view-shell single-view">
        <WalletPaymentPanel state={state} dispatch={dispatch} t={t} isArabic={isArabic} rideHistory={rideHistory} />
      </div>
    );
  }

  if (activeView === "support") {
    return (
      <div className="customer-view-shell single-view">
        <CustomerSupportPanel state={state} dispatch={dispatch} isArabic={isArabic} setActiveView={setActiveView} />
      </div>
    );
  }

  if (activeView === "account") {
    return (
      <div className="customer-view-shell single-view">
        <AccountProfilePanel
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          rideHistory={rideHistory}
          selectedDriver={selectedDriver}
        />
      </div>
    );
  }

  return (
    <div className="customer-view-shell ride-view">
      <section className="stage-one-copy customer-ride-hero">
        <h1>{isArabic ? "اختر وجهتك وابدأ مشوارك بثقة" : "Choose your route and ride with confidence"}</h1>
        <p>
          {isArabic
            ? "حدد نقطة الانطلاق والوجهة، راجع السعر المتوقع، ثم أرسل الطلب عندما تكون جاهزًا."
            : "Set your pickup and destination, review the expected fare, then request when you are ready."}
        </p>
      </section>

      <section className="booking-panel">
        <RouteSearchCard
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          actionLabel={t.requestRide}
          onAction={requestRide}
        />
      </section>

      <section className="panel wide map-panel">
        <MapBoard
          state={state}
          dispatch={dispatch}
          selectedDriver={customerHasAcceptedDriver ? selectedDriver : null}
          t={t}
          isArabic={isArabic}
          showDrivers={customerHasAcceptedDriver}
        />
      </section>

      {state.ride && (
        <section className="phase-two-panel">
          <PhaseTwoExperience
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            selectedDriver={selectedDriver}
            cancelRide={() => updateRideStatus?.(RIDE_STATUSES.cancelled)}
          />
        </section>
      )}

    </div>
  );
}
