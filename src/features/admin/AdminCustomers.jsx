import { mockCustomers } from "./adminMockData.js";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function customerName(customer) {
  return customer.name || customer.fullName || "-";
}

export function AdminCustomers({ isArabic, adminCustomers, updateCustomerStatus, adminMutating, backendError }) {
  const customers = adminCustomers || (backendError ? mockCustomers : []);

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إدارة الزبائن" : "Customer management"}</h2>
          <p>{isArabic ? "بيانات الزبائن من قاعدة البيانات مع تحكم مبدئي بالحالة." : "Database-backed customers with basic account status controls."}</p>
        </div>
        <span>{customers.length}</span>
      </div>
      <div className="admin-data-table customers-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "العمر" : "Age"}</span>
          <span>{isArabic ? "التحقق" : "Verified"}</span>
          <span>{isArabic ? "الرحلات" : "Trips"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "تاريخ الإنشاء" : "Created"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {customers.length ? customers.map((customer) => {
          const nextStatus = customer.status === "active" ? "suspended" : "active";
          return (
            <div className="admin-table-row" key={customer.id}>
              <strong>{customerName(customer)}</strong>
              <span>{customer.phone || "-"}</span>
              <span>{customer.city || customer.cityLabel || customer.cityId || "-"}</span>
              <span>{customer.age ?? "-"}</span>
              <b className={`admin-badge ${customer.verified || customer.isVerified ? "active" : "pending"}`}>
                {customer.verified || customer.isVerified ? (isArabic ? "مؤكد" : "Verified") : (isArabic ? "غير مؤكد" : "Unverified")}
              </b>
              <span>{customer.trips ?? customer.ridesCount ?? 0}</span>
              <b className={`admin-badge ${customer.status || "active"}`}>{customer.status || "active"}</b>
              <span>{formatDate(customer.createdAt)}</span>
              <button className="secondary" type="button" onClick={() => updateCustomerStatus(customer.id, nextStatus)} disabled={adminMutating}>
                {nextStatus === "suspended" ? (isArabic ? "إيقاف" : "Suspend") : (isArabic ? "تفعيل" : "Activate")}
              </button>
            </div>
          );
        }) : (
          <p className="admin-empty">{isArabic ? "لا توجد حسابات زبائن في قاعدة البيانات بعد." : "No customer accounts in the database yet."}</p>
        )}
      </div>
    </section>
  );
}
