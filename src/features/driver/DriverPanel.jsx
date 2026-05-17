import { Avatar, Metric, PanelTitle, QuoteStrip, StatusBadge } from "../../components/ui/index.js";
import { statusText } from "../../utils/i18n.js";
import { buildRideHistory, cityNameById, paymentMethodLabel, rideDisplayCode } from "../../utils/rideUtils.js";
import { MapBoard } from "../rides/MapBoard.jsx";

export function DriverPanel({ state, dispatch, t, isArabic, selectedDriver, toggleDriverStatus, updateRideStatus }) {
  const assignedRide = state.ride || {
    id: "demo_request",
    pickup: state.pickup,
    dropoff: state.dropoff,
    fareIls: state.quote.fareIls,
    distanceKm: state.quote.distanceKm,
    etaMinutes: state.quote.etaMinutes,
    status: "searching"
  };
  const driverName = isArabic ? selectedDriver.nameAr : selectedDriver.nameEn;
  const rideHistory = buildRideHistory(state, selectedDriver, isArabic);
  const currentRide = state.ride ? rideHistory.find((ride) => ride.id === state.ride.id) || rideHistory[0] : null;
  const requestFallback = {
    id: assignedRide.id,
    raw: assignedRide,
    code: rideDisplayCode(assignedRide),
    pickup: assignedRide.pickup,
    dropoff: assignedRide.dropoff,
    fareIls: assignedRide.fareIls,
    distanceKm: assignedRide.distanceKm,
    etaMinutes: assignedRide.etaMinutes,
    status: assignedRide.status,
    statusLabel: statusText[state.language][assignedRide.status] || assignedRide.status,
    paymentLabel: paymentMethodLabel(state.paymentMethod, isArabic)
  };
  const newRequests = rideHistory.filter((ride) => ride.status === "searching");
  const visibleRequests = newRequests.length ? newRequests : state.driverOnline && !state.ride ? [requestFallback] : [];
  const driverTrips = rideHistory.filter((ride) => ride.raw?.driverId === selectedDriver.id || ride.id === state.ride?.id);
  const visibleTrips = driverTrips.length ? driverTrips : rideHistory.slice(0, 4);
  const todayEarnings = visibleTrips.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const completedTrips = visibleTrips.filter((ride) => ride.statusGroup === "completed").length;

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  function acceptRide(ride) {
    dispatch({
      type: "patch",
      patch: {
        ride: {
          ...ride.raw,
          id: ride.id,
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          fareIls: ride.fareIls,
          distanceKm: ride.distanceKm,
          etaMinutes: ride.etaMinutes,
          status: "accepted",
          driverId: selectedDriver.id
        }
      }
    });
  }

  return (
    <div className="driver-dashboard">
      <section className="driver-hero-card">
        <div className="driver-hero-top">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "لوحة السائق" : "Driver dashboard"}</span>
            <h2>{driverName}</h2>
            <p>{selectedDriver.vehicle} · {selectedDriver.plate}</p>
          </div>
          <span className={`driver-status-pill ${state.driverOnline ? "online" : "offline"}`}>
            {state.driverOnline ? t.online : t.offline}
          </span>
        </div>
        <div className="driver-hero-actions">
          <button className={state.driverOnline ? "secondary danger-soft" : "primary"} onClick={toggleDriverStatus}>
            {state.driverOnline ? t.goOffline : t.goOnline}
          </button>
          <button className="secondary" onClick={() => notify("الدعم غير مربوط بعد", "Support is not connected yet")}>
            {isArabic ? "الدعم" : "Support"}
          </button>
        </div>
      </section>

      <section className="driver-kpi-grid">
        <Metric label={isArabic ? "أرباح اليوم" : "Today earnings"} value={`${todayEarnings} ₪`} />
        <Metric label={isArabic ? "عدد الرحلات" : "Trips"} value={visibleTrips.length} />
        <Metric label={t.rating} value={selectedDriver.rating} />
        <Metric label={isArabic ? "مكتملة" : "Completed"} value={completedTrips} />
      </section>

      <section className="driver-map-card">
        <PanelTitle title={isArabic ? "نطاق العمل والخريطة" : "Work zone and map"} meta={cityNameById(state.cities, state.cityId, isArabic)} />
        <MapBoard state={state} dispatch={dispatch} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>

      <section className="driver-requests-card">
        <PanelTitle title={isArabic ? "طلبات الرحلات الجديدة" : "New ride requests"} meta={`${visibleRequests.length}`} />
        {state.driverOnline && visibleRequests.length ? (
          <div className="driver-request-list">
            {visibleRequests.slice(0, 3).map((ride) => (
              <div className="driver-request-card" key={ride.id}>
                <div className="driver-card-head">
                  <strong>{ride.code}</strong>
                  <StatusBadge status={ride.status} label={ride.statusLabel} />
                </div>
                <div className="driver-route-line">
                  <span><small>{t.pickup}</small><b>{ride.pickup}</b></span>
                  <span><small>{t.dropoff}</small><b>{ride.dropoff}</b></span>
                </div>
                <div className="driver-request-meta">
                  <span>{ride.distanceKm} km</span>
                  <span>{ride.etaMinutes} min</span>
                  <strong>{ride.fareIls} ₪</strong>
                </div>
                <div className="driver-action-row">
                  <button className="primary" onClick={() => acceptRide(ride)}>{t.acceptRide}</button>
                  <button className="secondary" onClick={() => notify("رفض الرحلة غير مفعل في هذه النسخة", "Reject ride is not enabled in this build")}>
                    {isArabic ? "رفض" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            {state.driverOnline
              ? (isArabic ? "لا توجد طلبات جديدة الآن" : "No new requests right now")
              : (isArabic ? "افتح أونلاين حتى تظهر الطلبات" : "Go online to receive requests")}
          </div>
        )}
      </section>

      <section className="driver-current-card">
        <PanelTitle title={isArabic ? "الرحلة الحالية" : "Current ride"} meta={currentRide ? <StatusBadge status={currentRide.status} label={currentRide.statusLabel} /> : "-"} />
        {currentRide ? (
          <div className="driver-current-stack">
            <div className="driver-card-head">
              <strong>{currentRide.code}</strong>
              <b>{currentRide.fareIls} ₪</b>
            </div>
            <div className="driver-route-line">
              <span><small>{t.pickup}</small><b>{currentRide.pickup}</b></span>
              <span><small>{t.dropoff}</small><b>{currentRide.dropoff}</b></span>
            </div>
            <QuoteStrip state={{ ...state, quote: currentRide }} t={t} compact />
            <button className="secondary" disabled={state.ride?.status === "completed"} onClick={() => updateRideStatus("completed")}>
              {state.ride?.status === "completed" ? statusText[state.language].completed : t.completeRide}
            </button>
          </div>
        ) : (
          <div className="empty">{isArabic ? "لا توجد رحلة حالية" : "No current ride"}</div>
        )}
      </section>

      <section className="driver-history-card">
        <PanelTitle title={isArabic ? "رحلات السائق السابقة" : "Driver ride history"} meta={`${visibleTrips.length}`} />
        <div className="driver-history-list">
          {visibleTrips.length ? (
            visibleTrips.slice(0, 5).map((ride) => (
              <div className="driver-history-row" key={ride.id}>
                <span>
                  <strong>{ride.code}</strong>
                  <small>{ride.pickup} · {ride.dropoff}</small>
                </span>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
                <b>{ride.fareIls} ₪</b>
              </div>
            ))
          ) : (
            <div className="detail-empty compact">{isArabic ? "ستظهر الرحلات هنا بعد قبول الطلبات" : "Trips will appear here after accepted requests"}</div>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle title={t.driver} meta={state.driverOnline ? t.online : t.offline} />
        <div className="driver-profile">
          <Avatar label={(isArabic ? selectedDriver.nameAr : selectedDriver.nameEn).slice(0, 1)} />
          <div>
            <strong>{isArabic ? selectedDriver.nameAr : selectedDriver.nameEn}</strong>
            <small>{selectedDriver.vehicle} · {selectedDriver.plate}</small>
          </div>
        </div>
        <button className="primary" onClick={toggleDriverStatus}>{state.driverOnline ? t.goOffline : t.goOnline}</button>
        <div className="metrics">
          <Metric label={t.rating} value={selectedDriver.rating} />
          <Metric label={t.fare} value="186 ₪" />
          <Metric label={t.activeRides} value="9" />
        </div>
      </section>
      <section className="panel wide">
        <MapBoard state={state} dispatch={dispatch} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>
      <section className="panel">
        <PanelTitle
          title={isArabic ? "طلب قريب" : "Nearby request"}
          meta={
            state.driverOnline ? (
              <StatusBadge
                status={assignedRide.status}
                label={statusText[state.language][assignedRide.status] || assignedRide.status}
              />
            ) : (
              t.offline
            )
          }
        />
        {state.driverOnline ? (
          <div className="ride-card">
            <strong>{assignedRide.pickup}</strong>
            <small>{assignedRide.dropoff}</small>
            <QuoteStrip state={{ ...state, quote: assignedRide }} t={t} compact />
            <button className="primary" onClick={() => dispatch({ type: "patch", patch: { ride: { ...assignedRide, status: "accepted", driverId: selectedDriver.id } } })}>{t.acceptRide}</button>
            <button className="secondary" onClick={() => updateRideStatus("completed")}>{t.completeRide}</button>
          </div>
        ) : (
          <div className="empty">{isArabic ? "افتح أونلاين حتى تظهر الطلبات" : "Go online to receive requests"}</div>
        )}
      </section>
    </div>
  );
}
