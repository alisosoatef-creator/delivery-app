function driverName(driver, isArabic) {
  return isArabic ? driver.nameAr || driver.fullName || driver.nameEn : driver.nameEn || driver.fullName || driver.nameAr;
}

export function AdminDrivers({ state, approvedCaptains, isArabic, cityName, placeholder, adminDrivers }) {
  const fallbackDrivers = [
    ...state.drivers.map((driver) => ({ ...driver, status: "active", availability: driver.online ? "online" : "offline" })),
    ...approvedCaptains
  ];
  const drivers = adminDrivers?.length ? adminDrivers : fallbackDrivers;

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الكباتن" : "Captain management"}</h2>
          <p>{isArabic ? "يشمل الكباتن الحاليين والموافق عليهم محليًا من الطلبات." : "Includes existing captains and locally approved applications."}</p>
        </div>
        <span>{drivers.length}</span>
      </div>
      <div className="admin-data-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "المركبة" : "Vehicle"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {drivers.map((driver) => (
          <div className="admin-table-row" key={driver.id}>
            <strong>{driverName(driver, isArabic)}</strong>
            <span>{driver.phone || "-"}</span>
            <span>{driver.cityLabel || cityName(state, driver.cityId, isArabic)}</span>
            <span>{driver.vehicle || driver.vehicleType} · {driver.plate || "-"}</span>
            <div className="admin-badge-stack">
              <b className={`admin-badge ${driver.availability || "offline"}`}>{driver.availability || "offline"}</b>
              <b className={`admin-badge ${driver.status || "active"}`}>{driver.status || "active"}</b>
            </div>
            <button className="secondary" type="button" onClick={() => placeholder("إيقاف/تفعيل الكابتن Placeholder.", "Captain suspend/activate is a Placeholder.")}>
              {isArabic ? "إيقاف/تفعيل" : "Suspend/activate"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
