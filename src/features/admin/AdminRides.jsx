import { useMemo, useState } from "react";
import { mockRideRecords } from "./adminMockData.js";

const RIDE_STATUSES = ["all", "searching", "accepted", "arriving", "picked_up", "completed", "cancelled"];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function normalizeRide(ride) {
  return {
    id: ride.id,
    customer: ride.customer || ride.customerName || "Customer",
    customerPhone: ride.customerPhone || "",
    captain: ride.captain || ride.driverId || "Pending captain acceptance",
    pickup: ride.pickup,
    dropoff: ride.dropoff || ride.destination,
    city: ride.city || ride.cityId || "-",
    distanceKm: ride.distanceKm ?? "-",
    fareIls: ride.fareIls ?? ride.price ?? 0,
    paymentMethod: ride.paymentMethod,
    status: ride.status,
    time: ride.createdAt || ride.time || "-"
  };
}

export function AdminRides({ state, isArabic, adminRides }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);

  const rides = useMemo(() => {
    if (adminRides) return adminRides.map(normalizeRide);
    if (state.ride) {
      return [
        normalizeRide({
          ...state.ride,
          customerName: state.session?.name || "Customer",
          paymentMethod: state.paymentMethod,
          time: "Live"
        }),
        ...mockRideRecords.map(normalizeRide)
      ];
    }
    return mockRideRecords.map(normalizeRide);
  }, [adminRides, state.paymentMethod, state.ride, state.session?.name]);

  const filteredRides = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return rides.filter((ride) => {
      const matchesStatus = statusFilter === "all" || ride.status === statusFilter;
      const searchableText = `${ride.customer} ${ride.customerPhone} ${ride.pickup} ${ride.dropoff}`.toLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [rides, searchTerm, statusFilter]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الرحلات" : "Ride management"}</h2>
          <p>{isArabic ? "رحلات حالية وسابقة من قاعدة البيانات مع فلترة وبحث." : "Database rides with filtering, search, and details."}</p>
        </div>
        <span>{filteredRides.length} / {rides.length}</span>
      </div>

      <div className="admin-filter-bar">
        <label className="field">
          <span>{isArabic ? "بحث" : "Search"}</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={isArabic ? "الزبون أو الوجهة" : "Customer or destination"} />
        </label>
        <label className="field">
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {RIDE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <div className="admin-data-table rides-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "رقم الرحلة" : "Ride ID"}</span>
          <span>{isArabic ? "الزبون" : "Customer"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "الكابتن" : "Captain"}</span>
          <span>{isArabic ? "من / إلى" : "From / to"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "المسافة" : "Distance"}</span>
          <span>{isArabic ? "السعر" : "Fare"}</span>
          <span>{isArabic ? "الدفع" : "Payment"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "تاريخ الإنشاء" : "Created"}</span>
          <span>{isArabic ? "تفاصيل" : "Details"}</span>
        </div>
        {filteredRides.length ? filteredRides.map((ride) => (
          <div className="admin-table-row" key={ride.id}>
            <strong>{ride.id}</strong>
            <span>{ride.customer}</span>
            <span>{ride.customerPhone || "-"}</span>
            <span>{ride.captain}</span>
            <span>{ride.pickup} / {ride.dropoff}</span>
            <span>{ride.city}</span>
            <span>{ride.distanceKm} km</span>
            <span>{ride.fareIls} ₪</span>
            <span>{ride.paymentMethod}</span>
            <b className={`admin-badge ${ride.status}`}>{ride.status}</b>
            <span>{formatDate(ride.time)}</span>
            <button className="secondary" type="button" onClick={() => setSelectedRide(ride)}>
              {isArabic ? "عرض" : "View"}
            </button>
          </div>
        )) : (
          <p className="admin-empty">{isArabic ? "لا توجد رحلات مطابقة." : "No matching rides."}</p>
        )}
      </div>

      {selectedRide && (
        <div className="admin-detail-drawer">
          <div className="admin-panel-title">
            <h3>{selectedRide.id}</h3>
            <button className="icon-button" type="button" onClick={() => setSelectedRide(null)}>x</button>
          </div>
          <dl className="admin-detail-list">
            <div><dt>{isArabic ? "الزبون" : "Customer"}</dt><dd>{selectedRide.customer}</dd></div>
            <div><dt>{isArabic ? "الهاتف" : "Phone"}</dt><dd>{selectedRide.customerPhone || "-"}</dd></div>
            <div><dt>{isArabic ? "الكابتن" : "Captain"}</dt><dd>{selectedRide.captain}</dd></div>
            <div><dt>{isArabic ? "المسار" : "Route"}</dt><dd>{selectedRide.pickup} / {selectedRide.dropoff}</dd></div>
            <div><dt>{isArabic ? "السعر" : "Fare"}</dt><dd>{selectedRide.fareIls} ₪</dd></div>
            <div><dt>{isArabic ? "طريقة الدفع" : "Payment"}</dt><dd>{selectedRide.paymentMethod}</dd></div>
            <div><dt>{isArabic ? "الحالة" : "Status"}</dt><dd>{selectedRide.status}</dd></div>
            <div><dt>{isArabic ? "الوقت" : "Time"}</dt><dd>{formatDate(selectedRide.time)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
