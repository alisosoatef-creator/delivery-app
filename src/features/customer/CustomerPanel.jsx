import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useRidesApi } from "../../hooks/useRidesApi.js";
import { buildRideHistory, rideHasAcceptedDriver } from "../../utils/rideUtils.js";
import { RIDE_STATUSES } from "../../utils/rideStatus.js";
import { RideHistoryPanel } from "../rides/RideHistoryPanel.jsx";

const AccountProfilePanel = lazy(() => import("./AccountProfilePanel.jsx").then((module) => ({ default: module.AccountProfilePanel })));
const CustomerSupportPanel = lazy(() => import("../support/CustomerSupportPanel.jsx").then((module) => ({ default: module.CustomerSupportPanel })));
const MapBoard = lazy(() => import("../rides/MapBoard.jsx").then((module) => ({ default: module.MapBoard })));
const PhaseTwoExperience = lazy(() => import("../rides/PhaseTwoExperience.jsx").then((module) => ({ default: module.PhaseTwoExperience })));
const RideDetailPage = lazy(() => import("../rides/RideDetailPage.jsx").then((module) => ({ default: module.RideDetailPage })));
const RouteSearchCard = lazy(() => import("../rides/RouteSearchCard.jsx").then((module) => ({ default: module.RouteSearchCard })));
const WalletPaymentPanel = lazy(() => import("../payments/WalletPaymentPanel.jsx").then((module) => ({ default: module.WalletPaymentPanel })));

function CustomerSectionFallback({ label }) {
  return (
    <div className="lazy-section-fallback" role="status">
      <span />
      <strong>{label}</strong>
    </div>
  );
}

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
          <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل تفاصيل الرحلة..." : "Loading ride details..."} />}>
            <RideDetailPage ride={selectedHistoryRide} state={state} dispatch={dispatch} t={t} isArabic={isArabic} />
          </Suspense>
        </section>
      </div>
    );
  }

  if (activeView === "wallet") {
    return (
      <div className="customer-view-shell single-view">
        <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل المحفظة..." : "Loading wallet..."} />}>
          <WalletPaymentPanel state={state} dispatch={dispatch} t={t} isArabic={isArabic} rideHistory={rideHistory} />
        </Suspense>
      </div>
    );
  }

  if (activeView === "support") {
    return (
      <div className="customer-view-shell single-view">
        <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل الدعم..." : "Loading support..."} />}>
          <CustomerSupportPanel state={state} dispatch={dispatch} isArabic={isArabic} setActiveView={setActiveView} />
        </Suspense>
      </div>
    );
  }

  if (activeView === "account") {
    return (
      <div className="customer-view-shell single-view">
        <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل الحساب..." : "Loading account..."} />}>
          <AccountProfilePanel
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            rideHistory={rideHistory}
            selectedDriver={selectedDriver}
          />
        </Suspense>
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
        <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل نموذج الطلب..." : "Loading request form..."} />}>
          <RouteSearchCard
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            actionLabel={t.requestRide}
            onAction={requestRide}
          />
        </Suspense>
      </section>

      <section className="panel wide map-panel">
        <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل الخريطة..." : "Loading map..."} />}>
          <MapBoard
            state={state}
            dispatch={dispatch}
            selectedDriver={customerHasAcceptedDriver ? selectedDriver : null}
            t={t}
            isArabic={isArabic}
            showDrivers={customerHasAcceptedDriver}
          />
        </Suspense>
      </section>

      {state.ride && (
        <section className="phase-two-panel">
          <Suspense fallback={<CustomerSectionFallback label={isArabic ? "جاري تحميل حالة الرحلة..." : "Loading ride status..."} />}>
            <PhaseTwoExperience
              state={state}
              dispatch={dispatch}
              t={t}
              isArabic={isArabic}
              selectedDriver={selectedDriver}
              cancelRide={() => updateRideStatus?.(RIDE_STATUSES.cancelled)}
              refreshCurrentRide={props.refreshCurrentRide}
            />
          </Suspense>
        </section>
      )}

    </div>
  );
}
