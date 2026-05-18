import { mockRideRecords } from "./adminMockData.js";

export function AdminRides({ state, isArabic, placeholder }) {
  const rides = state.ride
    ? [
        {
          id: state.ride.id,
          customer: state.session?.name || "Customer",
          captain: state.ride.driverId || "Pending captain acceptance",
          pickup: state.ride.pickup,
          dropoff: state.ride.dropoff,
          fareIls: state.ride.fareIls,
          paymentMethod: state.paymentMethod,
          status: state.ride.status,
          time: "Live"
        },
        ...mockRideRecords
      ]
    : mockRideRecords;

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الرحلات" : "Ride management"}</h2>
          <p>{isArabic ? "رحلات حالية وسابقة من بيانات محلية مؤقتة." : "Current and previous rides from local mock data."}</p>
        </div>
        <span>{rides.length}</span>
      </div>
      <div className="admin-data-table wide-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "رقم الرحلة" : "Ride ID"}</span>
          <span>{isArabic ? "الزبون" : "Customer"}</span>
          <span>{isArabic ? "الكابتن" : "Captain"}</span>
          <span>{isArabic ? "من / إلى" : "From / to"}</span>
          <span>{isArabic ? "السعر" : "Fare"}</span>
          <span>{isArabic ? "الدفع" : "Payment"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "تفاصيل" : "Details"}</span>
        </div>
        {rides.map((ride) => (
          <div className="admin-table-row" key={ride.id}>
            <strong>{ride.id}</strong>
            <span>{ride.customer}</span>
            <span>{ride.captain}</span>
            <span>{ride.pickup} / {ride.dropoff}</span>
            <span>{ride.fareIls} ₪</span>
            <span>{ride.paymentMethod}</span>
            <b className={`admin-badge ${ride.status}`}>{ride.status}</b>
            <button className="secondary" type="button" onClick={() => placeholder("عرض تفاصيل الرحلة Placeholder.", "Ride details are a Placeholder.")}>
              {isArabic ? "عرض" : "View"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
