import { Avatar, Metric, PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { useDriverData } from "../../hooks/useDriverData.js";
import { statusText } from "../../utils/i18n.js";
import { RIDE_STATUSES } from "../../utils/rideStatus.js";
import { cityNameById, paymentMethodLabel, rideDisplayCode } from "../../utils/rideUtils.js";
import { MapBoard } from "../rides/MapBoard.jsx";

const ACTIVE_DRIVER_RIDE_STATUSES = [
  RIDE_STATUSES.accepted,
  RIDE_STATUSES.driverArriving,
  RIDE_STATUSES.arrived,
  RIDE_STATUSES.inProgress
];

const DRIVER_STATUS_ACTIONS = [
  { from: RIDE_STATUSES.accepted, next: RIDE_STATUSES.driverArriving, labelAr: "أنا بالطريق", labelEn: "I'm on the way" },
  { from: RIDE_STATUSES.driverArriving, next: RIDE_STATUSES.arrived, labelAr: "وصلت", labelEn: "Arrived" },
  { from: RIDE_STATUSES.arrived, next: RIDE_STATUSES.inProgress, labelAr: "بدأت الرحلة", labelEn: "Start ride" },
  { from: RIDE_STATUSES.inProgress, next: RIDE_STATUSES.completed, labelAr: "إنهاء الرحلة", labelEn: "Complete ride" }
];

function formatDate(value, isArabic) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalizeDriverRide(ride, state, isArabic) {
  const status = ride.status || RIDE_STATUSES.searching;
  const cityName = cityNameById(state.cities, ride.cityId || ride.city || state.cityId, isArabic);
  return {
    ...ride,
    code: rideDisplayCode(ride),
    pickup: ride.pickup || (isArabic ? `مركز ${cityName}` : `${cityName} center`),
    dropoff: ride.dropoff || ride.destination || (isArabic ? `وجهة داخل ${cityName}` : `${cityName} destination`),
    fareIls: ride.fareIls || ride.price || 0,
    distanceKm: ride.routeDistanceKm || ride.distanceKm || 0,
    etaMinutes: ride.durationMinutes || ride.etaMinutes || "-",
    paymentLabel: paymentMethodLabel(ride.paymentMethod || state.paymentMethod || "cash", isArabic),
    status,
    statusLabel: statusText[state.language][status] || status,
    cityName,
    createdLabel: formatDate(ride.createdAt, isArabic)
  };
}

export function DriverPanel({ state, dispatch, t, isArabic, selectedDriver }) {
  const sessionDriver = state.session?.driver || {};
  const driver = {
    ...selectedDriver,
    ...sessionDriver,
    id: state.session?.driverId || sessionDriver.id || selectedDriver?.id,
    fullName: sessionDriver.fullName || selectedDriver?.fullName || selectedDriver?.nameAr || selectedDriver?.nameEn || "",
    phone: sessionDriver.phone || selectedDriver?.phone || "",
    cityId: sessionDriver.cityId || sessionDriver.city || selectedDriver?.cityId || state.cityId,
    vehicle: sessionDriver.vehicle || sessionDriver.vehicleType || selectedDriver?.vehicle || selectedDriver?.vehicleType || "",
    plate: sessionDriver.plate || sessionDriver.vehiclePlate || selectedDriver?.plate || selectedDriver?.vehiclePlate || "",
    status: sessionDriver.status || selectedDriver?.status || "active",
    rating: sessionDriver.rating || selectedDriver?.rating || "4.8"
  };
  const driverId = driver.id || "";
  const driverName = driver.fullName || (isArabic ? "كابتن واصل" : "Wasel captain");
  const isDriverActive = driver.status === "active" || driver.status === "approved";
  const driverData = useDriverData({
    enabled: Boolean(driverId) && isDriverActive,
    driverId,
    phone: driver.phone,
    cityId: driver.cityId
  });

  const availableRides = driverData.availableRides.map((ride) => normalizeDriverRide(ride, state, isArabic));
  const driverRides = driverData.myRides.map((ride) => normalizeDriverRide(ride, state, isArabic));
  const activeRemoteRide = driverRides.find((ride) => ACTIVE_DRIVER_RIDE_STATUSES.includes(ride.status));
  const activeLocalRide =
    state.ride?.driverId === driverId && ACTIVE_DRIVER_RIDE_STATUSES.includes(state.ride.status)
      ? normalizeDriverRide(state.ride, state, isArabic)
      : null;
  const currentRide = activeRemoteRide || activeLocalRide || null;
  const completedTrips = driverRides.filter((ride) => ride.status === RIDE_STATUSES.completed);
  const historyRides = driverRides.length ? driverRides : currentRide ? [currentRide] : [];
  const todayEarnings = completedTrips.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);

  function showToast(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  async function handleToggleOnline() {
    const online = !state.driverOnline;
    dispatch({ type: "patch", patch: { driverOnline: online } });
    try {
      await driverData.updateOnlineStatus({ driverId, online });
      dispatch({ type: "patch", patch: { backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { driverOnline: !online, backendLive: false } });
      showToast("تعذر تحديث حالة الكابتن.", "Unable to update captain availability.");
    }
  }

  async function handleAcceptRide(ride) {
    try {
      const payload = await driverData.acceptRide({ rideId: ride.id, driverId });
      dispatch({
        type: "patch",
        patch: {
          ride: payload.ride,
          backendLive: true,
          toast: isArabic ? "تم قبول الرحلة ونقلها إلى رحلتي الحالية." : "Ride accepted and moved to your current ride."
        }
      });
    } catch {
      showToast("تعذر قبول الرحلة. ربما قُبلت من كابتن آخر.", "Unable to accept this ride. It may have been taken.");
    }
  }

  async function handleUpdateRideStatus(status) {
    if (!currentRide) return;
    try {
      const payload = await driverData.updateRideStatus({ rideId: currentRide.id, driverId, status });
      dispatch({
        type: "patch",
        patch: {
          ride: payload.ride,
          backendLive: true,
          toast: statusText[state.language][payload.ride.status] || payload.ride.status
        }
      });
    } catch {
      showToast("تعذر تحديث حالة الرحلة حسب التسلسل الحالي.", "Unable to update the ride status in the current sequence.");
    }
  }

  const emptyAvailableMessage = state.driverOnline
    ? (isArabic ? "لا توجد رحلات متاحة الآن. استخدم تحديث لجلب الطلبات الجديدة." : "No available rides now. Refresh to fetch new requests.")
    : (isArabic ? "افتح أونلاين حتى تتمكن من قبول الرحلات." : "Go online to accept available rides.");

  return (
    <div className="driver-dashboard">
      <section className="driver-hero-card">
        <div className="driver-hero-top">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "لوحة الكابتن" : "Captain dashboard"}</span>
            <h2>{driverName}</h2>
            <p>{driver.vehicle || "-"} · {driver.plate || "-"}</p>
            <small>{driver.phone || "-"} · {cityNameById(state.cities, driver.cityId, isArabic)}</small>
          </div>
          <span className={`driver-status-pill ${state.driverOnline ? "online" : "offline"}`}>
            {state.driverOnline ? t.online : t.offline}
          </span>
        </div>
        <div className="driver-hero-actions">
          <button className={state.driverOnline ? "secondary danger-soft" : "primary"} onClick={handleToggleOnline} disabled={!driverId || !isDriverActive || driverData.isMutating}>
            {state.driverOnline ? t.goOffline : t.goOnline}
          </button>
          <button className="secondary" onClick={() => driverData.refetchAvailableRides()} disabled={driverData.isAvailableLoading}>
            {isArabic ? "تحديث الطلبات" : "Refresh requests"}
          </button>
          <StatusBadge status={isDriverActive ? "accepted" : "cancelled"} label={isDriverActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "موقوف" : "Suspended")} />
        </div>
      </section>

      <section className="driver-kpi-grid">
        <Metric label={isArabic ? "أرباح مكتملة" : "Completed earnings"} value={`${todayEarnings} ₪`} />
        <Metric label={isArabic ? "رحلاتي" : "My rides"} value={driverRides.length} />
        <Metric label={t.rating} value={driver.rating} />
        <Metric label={isArabic ? "مكتملة" : "Completed"} value={completedTrips.length} />
      </section>

      <section className="driver-map-card">
        <PanelTitle title={isArabic ? "نطاق العمل والخريطة" : "Work zone and map"} meta={cityNameById(state.cities, driver.cityId, isArabic)} />
        <MapBoard state={state} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} />
      </section>

      <section className="driver-requests-card">
        <PanelTitle title={isArabic ? "الرحلات المتاحة" : "Available rides"} meta={driverData.isAvailableLoading ? (isArabic ? "تحميل" : "Loading") : `${availableRides.length}`} />
        {driverData.backendError && (
          <p className="driver-panel-error">{isArabic ? "تعذر الاتصال بواجهات الكابتن. البيانات لا تُحدّث الآن." : "Unable to reach driver APIs. Data is not updating now."}</p>
        )}
        {availableRides.length ? (
          <div className="driver-request-list">
            {availableRides.map((ride) => (
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
                  <span>{ride.customerName || ride.customer}</span>
                  <span>{ride.cityName}</span>
                  <span>{ride.distanceKm} km</span>
                  <span>{ride.etaMinutes} min</span>
                  <span>{ride.paymentLabel}</span>
                  <strong>{ride.fareIls} ₪</strong>
                </div>
                <div className="driver-action-row">
                  <button className="primary" onClick={() => handleAcceptRide(ride)} disabled={!state.driverOnline || !isDriverActive || driverData.isMutating}>
                    {t.acceptRide}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">{emptyAvailableMessage}</div>
        )}
      </section>

      <section className="driver-current-card">
        <PanelTitle title={isArabic ? "رحلتي الحالية" : "Current ride"} meta={currentRide ? <StatusBadge status={currentRide.status} label={currentRide.statusLabel} /> : "-"} />
        {currentRide ? (
          <div className="driver-current-stack">
            <div className="driver-card-head">
              <strong>{currentRide.code}</strong>
              <b>{currentRide.fareIls} ₪</b>
            </div>
            <div className="driver-route-line">
              <span><small>{isArabic ? "الزبون" : "Customer"}</small><b>{currentRide.customerName || currentRide.customer || "-"}</b></span>
              <span><small>{isArabic ? "الهاتف" : "Phone"}</small><b>{currentRide.customerPhone || "-"}</b></span>
              <span><small>{t.pickup}</small><b>{currentRide.pickup}</b></span>
              <span><small>{t.dropoff}</small><b>{currentRide.dropoff}</b></span>
            </div>
            <div className="driver-request-meta">
              <span>{currentRide.distanceKm} km</span>
              <span>{currentRide.etaMinutes} min</span>
              <span>{currentRide.paymentLabel}</span>
              <span>{currentRide.createdLabel}</span>
            </div>
            <div className="driver-action-row driver-status-actions">
              {DRIVER_STATUS_ACTIONS.map((action) => (
                <button
                  className={currentRide.status === action.from ? "primary" : "secondary"}
                  key={action.next}
                  onClick={() => handleUpdateRideStatus(action.next)}
                  disabled={currentRide.status !== action.from || driverData.isMutating}
                >
                  {isArabic ? action.labelAr : action.labelEn}
                </button>
              ))}
              <button
                className="secondary danger-soft"
                onClick={() => handleUpdateRideStatus(RIDE_STATUSES.cancelled)}
                disabled={currentRide.status !== RIDE_STATUSES.accepted || driverData.isMutating}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty">{isArabic ? "لا توجد رحلة حالية. اقبل رحلة من القائمة المتاحة." : "No current ride. Accept one from the available list."}</div>
        )}
      </section>

      <section className="driver-history-card">
        <PanelTitle title={isArabic ? "سجل رحلات الكابتن" : "Captain ride history"} meta={`${historyRides.length}`} />
        <div className="driver-history-list">
          {historyRides.length ? (
            historyRides.map((ride) => (
              <div className="driver-history-row" key={ride.id}>
                <span>
                  <strong>{ride.code}</strong>
                  <small>{ride.pickup} · {ride.dropoff}</small>
                </span>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
                <small>{ride.createdLabel}</small>
                <b>{ride.fareIls} ₪</b>
              </div>
            ))
          ) : (
            <div className="detail-empty compact">{isArabic ? "ستظهر الرحلات هنا بعد قبول الطلبات." : "Trips will appear here after accepting requests."}</div>
          )}
        </div>
      </section>
    </div>
  );
}
