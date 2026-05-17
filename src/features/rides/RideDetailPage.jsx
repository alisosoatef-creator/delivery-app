import { Avatar, Metric, PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { driverDisplayName } from "../../utils/rideUtils.js";
import { MapBoard } from "./MapBoard.jsx";

export function RideDetailPage({ ride, state, dispatch, t, isArabic }) {
  if (!ride) {
    return (
      <div className="ride-detail-card">
        <PanelTitle title={isArabic ? "تفاصيل الرحلة" : "Ride details"} meta="-" />
        <div className="detail-empty">{isArabic ? "اختر رحلة لعرض التفاصيل" : "Select a ride to view details"}</div>
      </div>
    );
  }

  const hasAcceptedDriver = Boolean(ride.hasAcceptedDriver);
  const driver = hasAcceptedDriver ? ride.driver || {} : null;
  const driverName = hasAcceptedDriver ? ride.driverName || driverDisplayName(driver, isArabic) : "";
  const vehicle = driver?.vehicle || (isArabic ? "مركبة مريحة" : "Comfort vehicle");
  const plate = driver?.plate || (isArabic ? "غير متاح" : "Not available");
  const rating = driver?.rating || "4.9";
  const mapState = { ...state, pickup: ride.pickup, dropoff: ride.dropoff };

  return (
    <div className="ride-detail-card">
      <div className="detail-hero">
        <div>
          <span>{isArabic ? "تفاصيل الرحلة" : "Ride details"}</span>
          <h3>{isArabic ? "ملخص الرحلة" : "Trip summary"}</h3>
          <p>{ride.code} · {ride.dateLabel}</p>
        </div>
        <StatusBadge status={ride.status} label={ride.statusLabel} />
      </div>

      <div className="detail-route-grid">
        <span>
          <small>{t.pickup}</small>
          <strong>{ride.pickup}</strong>
        </span>
        <span>
          <small>{t.dropoff}</small>
          <strong>{ride.dropoff}</strong>
        </span>
      </div>

      <div className="detail-metrics">
        <Metric label={t.fare} value={`${ride.fareIls} ₪`} />
        <Metric label={t.distance} value={`${ride.distanceKm} km`} />
        <Metric label={t.eta} value={`${ride.etaMinutes} min`} />
        <Metric label={isArabic ? "طريقة الدفع" : "Payment"} value={ride.paymentLabel} />
      </div>

      {hasAcceptedDriver ? (
        <div className="detail-driver-card">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "بيانات السائق" : "Driver details"}</span>
            <strong>{driverName}</strong>
            <small>{vehicle} · {plate}</small>
          </div>
          <b>{rating}</b>
        </div>
      ) : (
        <div className="detail-empty compact">
          {isArabic ? "بيانات الكابتن ستظهر بعد قبول الطلب فقط." : "Captain details will appear only after acceptance."}
        </div>
      )}

      <div className="detail-map-shell">
        <MapBoard state={mapState} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} showDrivers={hasAcceptedDriver} />
      </div>
    </div>
  );
}
