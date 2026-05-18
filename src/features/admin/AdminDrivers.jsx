function driverName(driver, isArabic) {
  return isArabic ? driver.nameAr || driver.fullName || driver.nameEn : driver.nameEn || driver.fullName || driver.nameAr;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function AdminDrivers({ state, approvedCaptains, isArabic, cityName, adminDrivers, updateDriverStatus, adminMutating }) {
  const fallbackDrivers = [
    ...state.drivers.map((driver) => ({ ...driver, status: "active", availability: driver.online ? "online" : "offline" })),
    ...approvedCaptains
  ];
  const drivers = adminDrivers || fallbackDrivers;

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الكباتن" : "Captain management"}</h2>
          <p>{isArabic ? "الكباتن الموافق عليهم من قاعدة البيانات مع تحكم مبدئي بالحالة." : "Approved database captains with basic status controls."}</p>
        </div>
        <span>{drivers.length}</span>
      </div>
      <div className="admin-data-table drivers-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "المركبة" : "Vehicle"}</span>
          <span>{isArabic ? "اللوحة" : "Plate"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "الاتصال" : "Online"}</span>
          <span>{isArabic ? "التقييم" : "Rating"}</span>
          <span>{isArabic ? "تاريخ الإنشاء" : "Created"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {drivers.length ? drivers.map((driver) => {
          const status = driver.status || "active";
          const nextStatus = status === "active" ? "suspended" : "active";
          const onlineStatus = driver.onlineStatus || driver.availability || "offline";
          return (
            <div className="admin-table-row" key={driver.id}>
              <strong>{driverName(driver, isArabic) || "-"}</strong>
              <span>{driver.phone || "-"}</span>
              <span>{driver.cityLabel || cityName(state, driver.cityId || driver.city, isArabic)}</span>
              <span>{driver.vehicle || driver.vehicleType || "-"}</span>
              <span>{driver.plate || driver.vehiclePlate || "-"}</span>
              <b className={`admin-badge ${status}`}>{status}</b>
              <b className={`admin-badge ${onlineStatus}`}>{onlineStatus}</b>
              <span>{driver.rating ?? "-"}</span>
              <span>{formatDate(driver.createdAt)}</span>
              <button className="secondary" type="button" onClick={() => updateDriverStatus(driver.id, { status: nextStatus })} disabled={adminMutating}>
                {nextStatus === "suspended" ? (isArabic ? "إيقاف" : "Suspend") : (isArabic ? "تفعيل" : "Activate")}
              </button>
            </div>
          );
        }) : (
          <p className="admin-empty">{isArabic ? "لا يوجد كباتن موافق عليهم في قاعدة البيانات بعد." : "No approved captains in the database yet."}</p>
        )}
      </div>
    </section>
  );
}
