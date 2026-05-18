import { mockCustomers } from "./adminMockData.js";

export function AdminCustomers({ isArabic, placeholder, adminCustomers }) {
  const customers = adminCustomers?.length ? adminCustomers : mockCustomers;

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الزبائن" : "Customer management"}</h2>
          <p>{isArabic ? "بيانات محلية مبدئية إلى حين الربط مع قاعدة البيانات." : "Local mock records until the database is connected."}</p>
        </div>
        <span>{customers.length}</span>
      </div>
      <div className="admin-data-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "الرحلات" : "Trips"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {customers.map((customer) => (
          <div className="admin-table-row" key={customer.id}>
            <strong>{customer.name || customer.fullName}</strong>
            <span>{customer.phone}</span>
            <span>{customer.city || customer.cityLabel || customer.cityId || "-"}</span>
            <span>{customer.trips ?? 0}</span>
            <b className={`admin-badge ${customer.status}`}>{customer.status}</b>
            <button className="secondary" type="button" onClick={() => placeholder("إيقاف/تفعيل الزبون Placeholder.", "Customer suspend/activate is a Placeholder.")}>
              {customer.status === "active" ? (isArabic ? "إيقاف" : "Suspend") : (isArabic ? "تفعيل" : "Activate")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
