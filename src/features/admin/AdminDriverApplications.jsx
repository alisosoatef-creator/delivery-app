import { useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminDriverApplications({
  pendingCaptainApplications,
  approveCaptainApplication,
  rejectCaptainApplication,
  adminLoading,
  backendError,
  adminMutating,
  isArabic
}) {
  const [selectedApplication, setSelectedApplication] = useState(null);

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "طلبات انضمام الكباتن" : "Captain applications"}</h2>
          <p>{isArabic ? "قبول أو رفض محلي بدون إنشاء دخول مباشر للكابتن." : "Local approval or rejection without direct captain sign-in."}</p>
        </div>
        <span>{pendingCaptainApplications.length}</span>
      </div>

      {adminLoading && <p className="admin-loading">{isArabic ? "جاري تحميل طلبات الكباتن..." : "Loading captain applications..."}</p>}
      {backendError && (
        <p className="admin-error">
          {isArabic ? "تعذر جلب الطلبات من الـ Backend، تظهر البيانات المحلية مؤقتًا." : "Could not load Backend applications, showing local data for now."}
        </p>
      )}

      <div className="admin-data-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "المركبة" : "Vehicle"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {pendingCaptainApplications.length ? pendingCaptainApplications.map((application) => (
          <div className="admin-table-row" key={application.id}>
            <strong>{application.fullName}</strong>
            <span>{application.phone}</span>
            <span>{application.cityLabel || application.city}</span>
            <span>{application.vehicleType}</span>
            <b className={`admin-badge ${application.status}`}>{application.status}</b>
            <div className="admin-action-row">
              <button className="primary" type="button" onClick={() => approveCaptainApplication(application.id)} disabled={adminMutating || application.status === "approved"}>
                {isArabic ? "قبول" : "Approve"}
              </button>
              <button className="danger-button" type="button" onClick={() => rejectCaptainApplication(application.id)} disabled={adminMutating || application.status === "rejected"}>
                {isArabic ? "رفض" : "Reject"}
              </button>
              <button className="secondary" type="button" onClick={() => setSelectedApplication(application)}>
                {isArabic ? "تفاصيل" : "Details"}
              </button>
            </div>
          </div>
        )) : (
          <p className="admin-empty">{isArabic ? "لا توجد طلبات كباتن بعد." : "No captain applications yet."}</p>
        )}
      </div>

      {selectedApplication && (
        <div className="admin-detail-drawer">
          <div className="admin-panel-title">
            <h3>{selectedApplication.fullName}</h3>
            <button className="icon-button" type="button" onClick={() => setSelectedApplication(null)}>×</button>
          </div>
          <dl className="admin-detail-list">
            <div><dt>{isArabic ? "رقم الهاتف" : "Phone"}</dt><dd>{selectedApplication.phone}</dd></div>
            <div><dt>{isArabic ? "المدينة" : "City"}</dt><dd>{selectedApplication.cityLabel || selectedApplication.city}</dd></div>
            <div><dt>{isArabic ? "العمر" : "Age"}</dt><dd>{selectedApplication.age}</dd></div>
            <div><dt>{isArabic ? "نوع المركبة" : "Vehicle type"}</dt><dd>{selectedApplication.vehicleType}</dd></div>
            <div><dt>{isArabic ? "رقم اللوحة" : "Plate"}</dt><dd>{selectedApplication.vehiclePlate || "-"}</dd></div>
            <div><dt>{isArabic ? "سنوات الخبرة" : "Experience years"}</dt><dd>{selectedApplication.experienceYears || "-"}</dd></div>
            <div><dt>{isArabic ? "الملاحظات" : "Notes"}</dt><dd>{selectedApplication.notes || "-"}</dd></div>
            <div><dt>{isArabic ? "تاريخ الطلب" : "Created at"}</dt><dd>{formatDate(selectedApplication.createdAt)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
