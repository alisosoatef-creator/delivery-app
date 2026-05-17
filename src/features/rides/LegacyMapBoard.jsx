export function LegacyMapBoard({ state, selectedDriver, t, isArabic, showDrivers = true }) {
  const driver = showDrivers ? selectedDriver || state.drivers[0] : null;
  return (
    <div className="map-board">
      <div className="map-zone zone-a" />
      <div className="map-zone zone-b" />
      <div className="map-zone zone-c" />
      <div className="road road-a" />
      <div className="road road-b" />
      <div className="road road-c" />
      <div className="route-line" />
      <div className="pin pickup">
        <span>{isArabic ? "من" : "F"}</span>
      </div>
      <div className="pin drop">
        <span>{isArabic ? "إلى" : "T"}</span>
      </div>
      {showDrivers && state.drivers.map((item, index) => (
        <div
          className={`car-pin ${item.id === driver?.id ? "selected" : ""}`}
          key={item.id}
          style={{ insetInlineStart: `${25 + index * 24}%`, top: `${36 + index * 13}%` }}
        >
          {item.nameEn.slice(0, 1)}
        </div>
      ))}
      <div className="map-compass">N</div>
      <div className="map-sheet">
        <span>{isArabic ? "معاينة المسار" : "Route preview"}</span>
        <strong>{driver ? (isArabic ? driver.nameAr : driver.nameEn) : (isArabic ? "معاينة الرحلة" : "Trip preview")}</strong>
        <div className="map-route-summary">
          <small>{state.pickup}</small>
          <small>{state.dropoff}</small>
        </div>
      </div>
    </div>
  );
}
