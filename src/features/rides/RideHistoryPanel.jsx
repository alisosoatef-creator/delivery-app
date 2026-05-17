import { PanelTitle, StatusBadge } from "../../components/ui/index.js";

export function RideHistoryPanel({ rides, allRides, selectedRide, filter, setFilter, setSelectedRideId, isArabic }) {
  const filters = [
    { key: "all", label: isArabic ? "الكل" : "All" },
    { key: "completed", label: isArabic ? "مكتملة" : "Completed" },
    { key: "cancelled", label: isArabic ? "ملغية" : "Cancelled" },
    { key: "active", label: isArabic ? "قيد التنفيذ" : "In progress" }
  ];

  function countFor(key) {
    if (key === "all") return allRides.length;
    return allRides.filter((ride) => ride.statusGroup === key).length;
  }

  return (
    <div className="history-panel">
      <PanelTitle
        title={isArabic ? "رحلاتي السابقة" : "My previous rides"}
        meta={isArabic ? `${allRides.length} رحلات` : `${allRides.length} rides`}
      />
      <div className="history-filter-row" aria-label={isArabic ? "فلترة الرحلات" : "Ride filters"}>
        {filters.map((item) => (
          <button
            className={filter === item.key ? "active" : ""}
            key={item.key}
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
          >
            <span>{item.label}</span>
            <b>{countFor(item.key)}</b>
          </button>
        ))}
      </div>
      <div className="history-trip-list">
        {rides.length ? (
          rides.map((ride) => (
            <button
              className={`history-trip-card ${selectedRide?.id === ride.id ? "selected" : ""}`}
              key={ride.id}
              onClick={() => setSelectedRideId(ride.id)}
            >
              <span className="history-card-head">
                <strong>{ride.code}</strong>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
              </span>
              <span className="history-route">
                <span>
                  <small>{isArabic ? "من" : "From"}</small>
                  <b>{ride.pickup}</b>
                </span>
                <span>
                  <small>{isArabic ? "إلى" : "To"}</small>
                  <b>{ride.dropoff}</b>
                </span>
              </span>
              <span className="history-meta">
                <span>{ride.dateLabel}</span>
                <span>{ride.driverName}</span>
                <strong>{ride.fareIls} ₪</strong>
              </span>
            </button>
          ))
        ) : (
          <div className="detail-empty">
            {isArabic ? "لا توجد رحلات مطابقة لهذا الفلتر الآن" : "No rides match this filter yet"}
          </div>
        )}
      </div>
    </div>
  );
}
