import { formatDistanceKm } from "../../utils/mapUtils.js";

export function LocationPicker({
  cityName,
  distanceKm,
  gpsStatus,
  isArabic,
  mapSelectionMode,
  onUseCurrentLocation,
  onSelectMode,
  onSetPickup,
  onSetDestination,
  selectedMapPoint
}) {
  return (
    <div className="location-picker-panel">
      <div className="map-badge-row">
        <span>{isArabic ? "المدينة" : "City"}: <strong>{cityName}</strong></span>
        <span className={`gps-badge ${gpsStatus}`}>GPS: <strong>{gpsStatus}</strong></span>
        <span>{isArabic ? "المسافة" : "Distance"}: <strong>{distanceKm ? `${formatDistanceKm(distanceKm)} km` : "-"}</strong></span>
      </div>
      <div className="map-picker-actions">
        <button className="secondary use-my-current-location" type="button" onClick={onUseCurrentLocation}>
          {isArabic ? "استخدم موقعي الحالي" : "Use my current location"}
        </button>
        <button
          className={`secondary ${mapSelectionMode === "pickup" ? "active" : ""}`}
          type="button"
          onClick={() => onSelectMode("pickup")}
        >
          {isArabic ? "النقرة التالية انطلاق" : "Next click is pickup"}
        </button>
        <button
          className={`secondary ${mapSelectionMode === "destination" ? "active" : ""}`}
          type="button"
          onClick={() => onSelectMode("destination")}
        >
          {isArabic ? "النقرة التالية وجهة" : "Next click is destination"}
        </button>
      </div>
      <div className="map-picker-actions compact">
        <button className="secondary set-map-point-pickup" type="button" onClick={onSetPickup} disabled={!selectedMapPoint}>
          {isArabic ? "تعيين هذه النقطة كنقطة انطلاق" : "Set this point as pickup"}
        </button>
        <button className="secondary set-map-point-destination" type="button" onClick={onSetDestination} disabled={!selectedMapPoint}>
          {isArabic ? "تعيين هذه النقطة كوجهة" : "Set this point as destination"}
        </button>
      </div>
      <p>
        {selectedMapPoint
          ? (isArabic ? "تم اختيار نقطة على الخريطة. يمكنك تثبيتها كنقطة انطلاق أو وجهة." : "A map point is selected. Set it as pickup or destination.")
          : (isArabic ? "اضغط على الخريطة لتحديد نقطة الانطلاق، ثم اضغط مرة ثانية لتحديد الوجهة." : "Click the map to set pickup first, then click again to set destination.")}
      </p>
    </div>
  );
}
