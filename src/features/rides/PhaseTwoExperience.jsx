import { Avatar, Metric, PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { customerLocationFromState, driverLocationFromDriver, formatDistanceKm, haversineKm } from "../../utils/mapUtils.js";
import { cityNameById, driverDisplayName, findRideDriver, paymentMethodLabel, rideHasAcceptedDriver } from "../../utils/rideUtils.js";
import { statusText } from "../../utils/i18n.js";
import { MapBoard } from "./MapBoard.jsx";
import { RideTimeline } from "./RideTimeline.jsx";

export function PhaseTwoExperience({ state, dispatch, t, isArabic, selectedDriver, cancelRide }) {
  const ride = state.ride;
  const rideStatus = ride?.status || "searching";
  const isCancelled = rideStatus === "cancelled" || rideStatus === "canceled";
  const hasAcceptedDriver = rideHasAcceptedDriver(ride);
  const driver = hasAcceptedDriver ? findRideDriver(ride, state, selectedDriver) : null;
  const statusLabel = statusText[state.language][rideStatus] || (isArabic ? "جاري البحث" : "Searching");
  const driverName = driver ? driverDisplayName(driver, isArabic) : "";
  const vehicle = driver?.vehicle || "";
  const plate = driver?.plate || "";
  const customerLocation = customerLocationFromState(state);
  const driverLocation = driverLocationFromDriver(driver);
  const liveDriverDistanceKm = hasAcceptedDriver && driverLocation ? haversineKm(customerLocation, driverLocation) : null;
  const driverDistance = liveDriverDistanceKm ?? driver?.distanceKm ?? ride?.driverDistanceKm ?? "";
  const driverDistanceLabel = formatDistanceKm(driverDistance);
  const eta = hasAcceptedDriver ? ride?.etaMinutes || driver?.etaMinutes || state.quote.etaMinutes : state.quote.etaMinutes;
  const fare = ride?.fareIls || state.quote.fareIls;
  const distance = ride?.distanceKm || state.quote.distanceKm;
  const routeDistance = ride?.routeDistanceKm || distance;
  const rideCode = ride ? `R-${ride.id.replace("ride_", "").slice(0, 6).toUpperCase()}` : "-";
  const cityName = cityNameById(state.cities, ride?.cityId || state.cityId, isArabic);
  const paymentLabel = paymentMethodLabel(ride?.paymentMethod || state.paymentMethod, isArabic);

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="phase-two-stack">
      <section className={`phase-two-card captain-search-card searching-driver ${hasAcceptedDriver ? "is-matched" : "is-searching"}`}>
        <div className="search-visual" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="phase-two-copy">
          <span>{isArabic ? "حالة الطلب" : "Request status"}</span>
          <h3>
            {hasAcceptedDriver
              ? (isArabic ? "الكابتن قبل طلبك" : "A captain accepted your request")
              : (isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain...")}
          </h3>
          <p>
            {hasAcceptedDriver
              ? (isArabic ? "ظهرت بيانات الكابتن بعد قبول الطلب." : "Captain details are visible after acceptance.")
              : (isArabic ? "لن تظهر بيانات الكابتن أو المركبة إلا بعد قبول الطلب." : "Captain and vehicle details will appear only after acceptance.")}
          </p>
        </div>
        <StatusBadge status={rideStatus} label={statusLabel} />
      </section>

      {!hasAcceptedDriver && (
        <section className="phase-two-card captain-pending-card">
          <PanelTitle
            title={isCancelled ? (isArabic ? "تم إلغاء الرحلة" : "Ride cancelled") : (isArabic ? "طلبك قيد المطابقة" : "Your request is being matched")}
            meta={rideCode}
          />
          <div className="detail-empty compact">
            {isCancelled
              ? (isArabic ? "تم حفظ الرحلة كملغية في السجل ولن تظهر بيانات كابتن لها." : "The ride is saved as cancelled in your history and no captain details are shown.")
              : (isArabic ? "بانتظار قبول أحد الكباتن. لن تظهر بيانات الكابتن أو المركبة قبل القبول." : "Waiting for a captain to accept. Captain and vehicle details stay hidden until acceptance.")}
          </div>
          <div className="ride-searching-summary">
            <span><small>{t.city}</small><strong>{cityName}</strong></span>
            <span><small>{t.pickup}</small><strong>{ride?.pickup || state.pickup}</strong></span>
            <span><small>{t.dropoff}</small><strong>{ride?.dropoff || ride?.destination || state.dropoff}</strong></span>
            <span><small>{t.fare}</small><strong>{fare} ₪</strong></span>
            <span><small>{t.distance}</small><strong>{routeDistance} km</strong></span>
            <span><small>{t.eta}</small><strong>{eta} min</strong></span>
            <span><small>{t.payment}</small><strong>{paymentLabel}</strong></span>
          </div>
          {!isCancelled && (
            <div className="searching-ride-actions">
              <button className="secondary danger-soft" type="button" onClick={() => (cancelRide ? cancelRide() : notify("تعذر إلغاء الرحلة الآن.", "Unable to cancel the ride now."))}>
                {isArabic ? "إلغاء الرحلة" : "Cancel ride"}
              </button>
            </div>
          )}
        </section>
      )}

      {hasAcceptedDriver && (
        <section className="phase-two-card accepted-driver-card driver-match-card">
          <div className="driver-card-top">
            <Avatar label={driverName.slice(0, 1)} />
            <div>
              <span>{isArabic ? "الكابتن" : "Captain"}</span>
              <strong>{driverName}</strong>
            </div>
          </div>
          <div className="driver-meta-grid">
            {driverDistanceLabel && <span><small>{isArabic ? "المسافة عنك" : "Distance away"}</small><strong>{driverDistanceLabel} km</strong></span>}
            <span><small>{t.eta}</small><strong>{eta} min</strong></span>
            {vehicle && <span><small>{isArabic ? "السيارة" : "Vehicle"}</small><strong>{vehicle}</strong></span>}
            {plate && <span><small>{isArabic ? "رقم اللوحة" : "Plate"}</small><strong>{plate}</strong></span>}
          </div>
          <div className="ride-action-row">
            <button className="secondary danger-soft" onClick={() => notify("يمكنك طلب إلغاء الرحلة من الدعم.", "You can request ride cancellation from support.")}>
              {isArabic ? "إلغاء الرحلة" : "Cancel ride"}
            </button>
            <button className="secondary" onClick={() => notify("سيتم فتح الاتصال بالكابتن من بيانات الرحلة.", "Captain calling will open from trip details.")}>
              {isArabic ? "اتصال" : "Call"}
            </button>
            <button className="secondary" onClick={() => notify("سيتم فتح المحادثة الخاصة بالرحلة.", "Trip chat will open here.")}>
              {isArabic ? "رسالة" : "Message"}
            </button>
          </div>
        </section>
      )}

      {hasAcceptedDriver && (
        <section className="phase-two-card tracking-card">
          <PanelTitle title={isArabic ? "تتبع الكابتن" : "Captain tracking"} meta={<StatusBadge status={rideStatus} label={statusLabel} />} />
          <div className="tracking-map-shell">
            <MapBoard state={state} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} />
          </div>
        </section>
      )}

      <section className="phase-two-card trip-details-card">
        <PanelTitle title={isArabic ? "تفاصيل الرحلة الحالية" : "Current trip details"} meta={rideCode} />
        <div className="trip-route">
          <span><small>{t.pickup}</small><strong>{ride?.pickup || state.pickup}</strong></span>
          <span><small>{t.dropoff}</small><strong>{ride?.dropoff || state.dropoff}</strong></span>
        </div>
        <div className="detail-metrics">
          <Metric label={t.fare} value={`${fare} ₪`} />
          <Metric label={t.distance} value={`${distance} km`} />
          <Metric label={t.eta} value={`${eta} min`} />
        </div>
        <RideTimeline status={rideStatus} isArabic={isArabic} />
      </section>
    </div>
  );
}
