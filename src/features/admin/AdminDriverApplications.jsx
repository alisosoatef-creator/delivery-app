import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, ErrorState, Input, LoadingSkeleton, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import { exportRowsToCsv, formatDate, normalizeApplication, normalizeDriver, statusLabel, textFor } from "./adminFormatters.js";

const APPLICATION_STATUSES = ["all", "pending", "approved", "rejected"];
const APPLICATION_EXPORT_COLUMNS = [
  { key: "fullName", label: "Name", value: (application) => application.fullName },
  { key: "phone", label: "Phone", value: (application) => application.phone },
  { key: "city", label: "City", value: (application) => application.city },
  { key: "age", label: "Age", value: (application) => application.age },
  { key: "vehicleType", label: "Vehicle", value: (application) => application.vehicleType },
  { key: "vehiclePlate", label: "Plate", value: (application) => application.vehiclePlate },
  { key: "status", label: "Status", value: (application) => application.status },
  { key: "createdAt", label: "Created", value: (application) => application.createdAt }
];

export function AdminDriverApplications({
  pendingCaptainApplications,
  approvedCaptains,
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
  const applications = useMemo(() => pendingCaptainApplications.map(normalizeApplication), [pendingCaptainApplications]);
  const drivers = useMemo(() => (approvedCaptains || []).map((driver) => normalizeDriver(driver)), [approvedCaptains]);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const searchableText = `${application.fullName} ${application.phone} ${application.city} ${application.vehicleType}`.toLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [applications, searchTerm, statusFilter]);

  function linkedDriver(application) {
    return drivers.find((driver) => driver.applicationId === application.id || driver.phone === application.phone);
  }

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "طلبات انضمام الكباتن", "Captain applications")}
        description={textFor(isArabic, "مراجعة الطلبات، عرض التفاصيل، والقبول أو الرفض بدون تسجيل دخول مباشر للكابتن.", "Review applications, inspect details, and approve or reject without direct captain sign-in.")}
        meta={`${filteredApplications.length} / ${applications.length}`}
        actions={<Button variant="secondary" onClick={() => exportRowsToCsv("captain-applications.csv", filteredApplications, APPLICATION_EXPORT_COLUMNS)} disabled={!filteredApplications.length}>Export CSV</Button>}
      />

      <div className="admin-filter-bar advanced-filter-bar">
        <Input label={textFor(isArabic, "بحث", "Search")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={textFor(isArabic, "الاسم، الهاتف، المدينة أو المركبة", "Name, phone, city, or vehicle")} />
        <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, isArabic)}</option>)}
        </Select>
      </div>

      {adminLoading && <LoadingSkeleton lines={5} />}
      {backendError && (
        <ErrorState
          title={textFor(isArabic, "تعذر جلب طلبات الكباتن", "Unable to load applications")}
          description={textFor(isArabic, "سيتم عرض البيانات المحلية مؤقتًا إلى أن يعود الاتصال.", "Local data is shown temporarily until the backend returns.")}
        />
      )}

      <DataTable
        className="applications-table advanced-admin-table"
        gridTemplateColumns="minmax(150px, 1.4fr) minmax(130px, 1fr) minmax(110px, .9fr) minmax(70px, .6fr) minmax(120px, 1fr) minmax(100px, .8fr) minmax(110px, .8fr) minmax(130px, 1fr) minmax(210px, 1.4fr)"
        columns={[
          { key: "name", label: textFor(isArabic, "الاسم", "Name") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "city", label: textFor(isArabic, "المدينة", "City") },
          { key: "age", label: textFor(isArabic, "العمر", "Age") },
          { key: "vehicle", label: textFor(isArabic, "المركبة", "Vehicle") },
          { key: "plate", label: textFor(isArabic, "اللوحة", "Plate") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "created", label: textFor(isArabic, "تاريخ الطلب", "Created") },
          { key: "action", label: textFor(isArabic, "إجراءات", "Actions") }
        ]}
        rows={filteredApplications}
        empty={<EmptyState title={textFor(isArabic, "لا توجد طلبات مطابقة", "No matching applications")} description={textFor(isArabic, "طلبات الانضمام الجديدة ستظهر هنا.", "New captain applications will appear here.")} />}
        renderRow={(application) => (
          <div className="admin-table-row" key={application.id}>
            <strong>{application.fullName}</strong>
            <span>{application.phone}</span>
            <span>{application.city}</span>
            <span>{application.age}</span>
            <span>{application.vehicleType}</span>
            <span>{application.vehiclePlate}</span>
            <Badge tone={application.status === "approved" ? "success" : application.status === "rejected" ? "danger" : "warning"}>{statusLabel(application.status, isArabic)}</Badge>
            <span>{formatDate(application.createdAt, isArabic)}</span>
            <div className="admin-action-row compact-actions">
              <Button variant="primary" size="sm" onClick={() => approveCaptainApplication(application.id)} disabled={adminMutating || application.status === "approved"}>
                {textFor(isArabic, "قبول", "Approve")}
              </Button>
              <Button variant="danger" size="sm" onClick={() => rejectCaptainApplication(application.id)} disabled={adminMutating || application.status === "rejected"}>
                {textFor(isArabic, "رفض", "Reject")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedApplication(application)}>
                {textFor(isArabic, "تفاصيل", "Details")}
              </Button>
            </div>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selectedApplication)}
        title={selectedApplication?.fullName || ""}
        subtitle={textFor(isArabic, "تفاصيل طلب الكابتن", "Captain application details")}
        status={selectedApplication?.status}
        isArabic={isArabic}
        onClose={() => setSelectedApplication(null)}
        actions={selectedApplication && (
          <>
            <Button variant="primary" onClick={() => approveCaptainApplication(selectedApplication.id)} disabled={adminMutating || selectedApplication.status === "approved"}>
              {textFor(isArabic, "قبول الطلب", "Approve application")}
            </Button>
            <Button variant="danger" onClick={() => rejectCaptainApplication(selectedApplication.id)} disabled={adminMutating || selectedApplication.status === "rejected"}>
              {textFor(isArabic, "رفض الطلب", "Reject application")}
            </Button>
            <DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedApplication(null)} />
          </>
        )}
      >
        {selectedApplication && (
          <>
            <DetailGrid
              items={[
                { label: textFor(isArabic, "رقم الهاتف", "Phone"), value: selectedApplication.phone },
                { label: textFor(isArabic, "المدينة", "City"), value: selectedApplication.city },
                { label: textFor(isArabic, "العمر", "Age"), value: selectedApplication.age },
                { label: textFor(isArabic, "نوع المركبة", "Vehicle type"), value: selectedApplication.vehicleType },
                { label: textFor(isArabic, "رقم اللوحة", "Plate"), value: selectedApplication.vehiclePlate },
                { label: textFor(isArabic, "سنوات الخبرة", "Experience years"), value: selectedApplication.experienceYears },
                { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedApplication.status, isArabic) },
                { label: textFor(isArabic, "تاريخ الطلب", "Created at"), value: formatDate(selectedApplication.createdAt, isArabic) },
                { label: textFor(isArabic, "تاريخ المراجعة", "Reviewed at"), value: formatDate(selectedApplication.reviewedAt, isArabic) }
              ]}
            />
            <DrawerPlaceholder title={textFor(isArabic, "الملاحظات", "Notes")}>{selectedApplication.notes}</DrawerPlaceholder>
            <DrawerPlaceholder title={textFor(isArabic, "حالة إنشاء الكابتن", "Driver creation state")}>
              {linkedDriver(selectedApplication)
                ? textFor(isArabic, "تم إنشاء كابتن مؤقت بعد الموافقة.", "A temporary driver record exists after approval.")
                : textFor(isArabic, "لم يتم إنشاء كابتن بعد، أو الطلب لم تتم الموافقة عليه.", "No driver record yet, or the application is not approved.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
