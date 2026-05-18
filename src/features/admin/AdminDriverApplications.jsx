import { useMemo, useState } from "react";

const APPLICATION_STATUSES = ["all", "pending", "approved", "rejected"];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusLabel(status, isArabic) {
  if (!isArabic) return status;
  return {
    all: "الكل",
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض"
  }[status] || status;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return pendingCaptainApplications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const searchableText = `${application.fullName || ""} ${application.phone || ""}`.toLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [pendingCaptainApplications, searchTerm, statusFilter]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "طلبات انضمام الكباتن" : "Captain applications"}</h2>
          <p>{isArabic ? "قبول أو رفض الطلبات من قاعدة البيانات بدون تسجيل دخول مباشر للكابتن." : "Review database applications without direct captain sign-in."}</p>
        </div>
        <span>{filteredApplications.length} / {pendingCaptainApplications.length}</span>
      </div>

      <div className="admin-filter-bar">
        <label className="field">
          <span>{isArabic ? "بحث" : "Search"}</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={isArabic ? "الاسم أو رقم الهاتف" : "Name or phone"}
          />
        </label>
        <label className="field">
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{statusLabel(status, isArabic)}</option>
            ))}
          </select>
        </label>
      </div>

      {adminLoading && <p className="admin-loading">{isArabic ? "جاري تحميل طلبات الكباتن..." : "Loading captain applications..."}</p>}
      {backendError && (
        <p className="admin-error">
          {isArabic ? "تعذر جلب الطلبات من Backend، تظهر البيانات المحلية مؤقتًا." : "Could not load Backend applications, showing local data for now."}
        </p>
      )}

      <div className="admin-data-table applications-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "الاسم" : "Name"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "العمر" : "Age"}</span>
          <span>{isArabic ? "المركبة" : "Vehicle"}</span>
          <span>{isArabic ? "اللوحة" : "Plate"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "تاريخ الطلب" : "Created"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {filteredApplications.length ? filteredApplications.map((application) => (
          <div className="admin-table-row" key={application.id}>
            <strong>{application.fullName}</strong>
            <span>{application.phone}</span>
            <span>{application.cityLabel || application.city}</span>
            <span>{application.age}</span>
            <span>{application.vehicleType}</span>
            <span>{application.vehiclePlate || "-"}</span>
            <b className={`admin-badge ${application.status}`}>{application.status}</b>
            <span>{formatDate(application.createdAt)}</span>
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
          <p className="admin-empty">{isArabic ? "لا توجد طلبات مطابقة." : "No matching captain applications."}</p>
        )}
      </div>

      {selectedApplication && (
        <div className="admin-detail-drawer">
          <div className="admin-panel-title">
            <h3>{selectedApplication.fullName}</h3>
            <button className="icon-button" type="button" onClick={() => setSelectedApplication(null)}>x</button>
          </div>
          <dl className="admin-detail-list">
            <div><dt>{isArabic ? "رقم الهاتف" : "Phone"}</dt><dd>{selectedApplication.phone}</dd></div>
            <div><dt>{isArabic ? "المدينة" : "City"}</dt><dd>{selectedApplication.cityLabel || selectedApplication.city}</dd></div>
            <div><dt>{isArabic ? "العمر" : "Age"}</dt><dd>{selectedApplication.age}</dd></div>
            <div><dt>{isArabic ? "نوع المركبة" : "Vehicle type"}</dt><dd>{selectedApplication.vehicleType}</dd></div>
            <div><dt>{isArabic ? "رقم اللوحة" : "Plate"}</dt><dd>{selectedApplication.vehiclePlate || "-"}</dd></div>
            <div><dt>{isArabic ? "سنوات الخبرة" : "Experience years"}</dt><dd>{selectedApplication.experienceYears || "-"}</dd></div>
            <div><dt>{isArabic ? "الملاحظات" : "Notes"}</dt><dd>{selectedApplication.notes || "-"}</dd></div>
            <div><dt>{isArabic ? "الحالة" : "Status"}</dt><dd>{selectedApplication.status}</dd></div>
            <div><dt>{isArabic ? "تاريخ الطلب" : "Created at"}</dt><dd>{formatDate(selectedApplication.createdAt)}</dd></div>
            <div><dt>{isArabic ? "تاريخ المراجعة" : "Reviewed at"}</dt><dd>{formatDate(selectedApplication.reviewedAt)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
