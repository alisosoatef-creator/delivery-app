import { Metric, PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { statusText } from "../../utils/i18n.js";

export function AdminPanel({ state, t, isArabic }) {
  return (
    <div className="content-grid admin-grid">
      <Metric label={t.activeRides} value={state.admin.activeRides} />
      <Metric label={t.onlineDrivers} value={state.admin.onlineDrivers} />
      <Metric label={t.revenue} value={`${state.admin.todayRevenueIls} ₪`} />
      <section className="panel wide">
        <PanelTitle title={isArabic ? "الطلب حسب المدينة" : "Demand by city"} meta="Live" />
        <div className="demand-list">
          {state.cities.map((city) => (
            <div className="demand-row" key={city.id}>
              <span>{isArabic ? city.ar : city.en}</span>
              <div><i style={{ width: `${city.demand}%` }} /></div>
              <strong>{city.demand}%</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <PanelTitle title={t.activeRide} meta={`${state.admin.recentRides?.length || 0}`} />
        <div className="list">
          {(state.admin.recentRides || []).map((ride) => (
            <div className="table-card" key={ride.id}>
              <strong>{ride.id.replace("ride_", "R-")}</strong>
              <StatusBadge status={ride.status} label={statusText[state.language][ride.status] || ride.status} />
              <b>{ride.fareIls} ₪</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
