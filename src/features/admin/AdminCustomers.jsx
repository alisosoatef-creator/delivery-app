import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, ErrorState, Input, LoadingSkeleton, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import { adminStatusTone, exportRowsToCsv, formatDate, formatMoney, normalizeCustomer, normalizeRide, normalizeTicket, statusLabel, textFor } from "./adminFormatters.js";
import { mockCustomers } from "./adminMockData.js";

const CUSTOMER_EXPORT_COLUMNS = [
  { key: "name", label: "Name", value: (customer) => customer.name },
  { key: "phone", label: "Phone", value: (customer) => customer.phone },
  { key: "city", label: "City", value: (customer) => customer.city },
  { key: "age", label: "Age", value: (customer) => customer.age },
  { key: "status", label: "Status", value: (customer) => customer.status },
  { key: "verified", label: "Verified", value: (customer) => customer.isVerified ? "yes" : "no" },
  { key: "trips", label: "Trips", value: (customer) => customer.trips },
  { key: "createdAt", label: "Created", value: (customer) => customer.createdAt }
];

export function AdminCustomers({ isArabic, adminCustomers, updateCustomerStatus, adminMutating, backendError, adminLoading, adminRides, supportTickets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customers = useMemo(() => (adminCustomers || (backendError ? mockCustomers : [])).map(normalizeCustomer), [adminCustomers, backendError]);
  const rides = useMemo(() => (adminRides || []).map(normalizeRide), [adminRides]);
  const tickets = useMemo(() => (supportTickets || []).map(normalizeTicket), [supportTickets]);

  const filteredCustomers = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
      const matchesVerified = verifiedFilter === "all" || (verifiedFilter === "verified" ? customer.isVerified : !customer.isVerified);
      const searchable = `${customer.name} ${customer.phone} ${customer.city}`.toLowerCase();
      return matchesStatus && matchesVerified && (!needle || searchable.includes(needle));
    });
  }, [customers, searchTerm, statusFilter, verifiedFilter]);
  const activeCount = customers.filter((customer) => customer.status === "active").length;
  const verifiedCount = customers.filter((customer) => customer.isVerified).length;
  const suspendedCount = customers.filter((customer) => customer.status === "suspended").length;

  function relatedRides(customer) {
    return rides.filter((ride) => ride.customerPhone === customer.phone || ride.customer === customer.name).slice(0, 4);
  }

  function relatedTickets(customer) {
    return tickets.filter((ticket) => ticket.phone === customer.phone || ticket.name === customer.name).slice(0, 4);
  }

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "إدارة الزبائن", "Customer management")}
        description={textFor(isArabic, "بحث وفلاتر وتحكم بالحالة مع تفاصيل زبون مرتبطة بالرحلات والدعم.", "Search, filters, status controls, and customer details linked to rides and support.")}
        meta={`${filteredCustomers.length} / ${customers.length}`}
        actions={
          <Button variant="secondary" onClick={() => exportRowsToCsv("admin-customers.csv", filteredCustomers, CUSTOMER_EXPORT_COLUMNS)} disabled={!filteredCustomers.length}>
            Export CSV
          </Button>
        }
      />

      <div className="admin-analytics-strip admin-super-summary">
        <div><span>{textFor(isArabic, "زبائن نشطون", "Active customers")}</span><strong>{activeCount}</strong></div>
        <div><span>{textFor(isArabic, "حسابات مؤكدة", "Verified accounts")}</span><strong>{verifiedCount}</strong></div>
        <div><span>{textFor(isArabic, "موقوفون", "Suspended")}</span><strong>{suspendedCount}</strong></div>
      </div>

      <div className="admin-filter-bar advanced-filter-bar">
        <Input label={textFor(isArabic, "بحث", "Search")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={textFor(isArabic, "الاسم، الهاتف، أو المدينة", "Name, phone, or city")} />
        <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">{statusLabel("all", isArabic)}</option>
          <option value="active">{statusLabel("active", isArabic)}</option>
          <option value="suspended">{statusLabel("suspended", isArabic)}</option>
        </Select>
        <Select label={textFor(isArabic, "التحقق", "Verification")} value={verifiedFilter} onChange={(event) => setVerifiedFilter(event.target.value)}>
          <option value="all">{statusLabel("all", isArabic)}</option>
          <option value="verified">{textFor(isArabic, "مؤكد", "Verified")}</option>
          <option value="unverified">{textFor(isArabic, "غير مؤكد", "Unverified")}</option>
        </Select>
      </div>

      {adminLoading && <LoadingSkeleton lines={4} />}
      {backendError && (
        <ErrorState
          title={textFor(isArabic, "تعذر تحميل الزبائن من الخادم", "Unable to load customers")}
          description={textFor(isArabic, "تظهر بيانات fallback مؤقتًا عند انقطاع الاتصال.", "Fallback data is shown temporarily while offline.")}
        />
      )}

      <DataTable
        className="customers-table advanced-admin-table"
        gridTemplateColumns="minmax(160px, 1.3fr) minmax(130px, 1fr) minmax(110px, .9fr) minmax(70px, .6fr) minmax(110px, .8fr) minmax(90px, .7fr) minmax(105px, .8fr) minmax(125px, 1fr) minmax(170px, 1.2fr)"
        columns={[
          { key: "name", label: textFor(isArabic, "الاسم", "Name") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "city", label: textFor(isArabic, "المدينة", "City") },
          { key: "age", label: textFor(isArabic, "العمر", "Age") },
          { key: "verified", label: textFor(isArabic, "التحقق", "Verified") },
          { key: "trips", label: textFor(isArabic, "الرحلات", "Trips") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "created", label: textFor(isArabic, "الإنشاء", "Created") },
          { key: "action", label: textFor(isArabic, "إجراءات", "Actions") }
        ]}
        rows={filteredCustomers}
        empty={<EmptyState title={textFor(isArabic, "لا توجد حسابات مطابقة", "No matching customers")} description={textFor(isArabic, "جرّب تغيير البحث أو الفلتر.", "Try changing search or filters.")} />}
        renderRow={(customer) => {
          const nextStatus = customer.status === "active" ? "suspended" : "active";
          return (
            <div className="admin-table-row" key={customer.id}>
              <strong>{customer.name}</strong>
              <span>{customer.phone}</span>
              <span>{customer.city}</span>
              <span>{customer.age}</span>
              <Badge className="admin-status-badge-ar" tone={customer.isVerified ? "success" : "warning"}>{customer.isVerified ? textFor(isArabic, "مؤكد", "Verified") : textFor(isArabic, "غير مؤكد", "Unverified")}</Badge>
              <span>{customer.trips}</span>
              <Badge className="admin-status-badge-ar" tone={adminStatusTone(customer.status)}>{statusLabel(customer.status, isArabic)}</Badge>
              <span>{formatDate(customer.createdAt, isArabic, { dateOnly: true })}</span>
              <div className="admin-action-row compact-actions">
                <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(customer)}>{textFor(isArabic, "عرض", "View")}</Button>
                <Button variant={nextStatus === "suspended" ? "danger" : "secondary"} size="sm" onClick={() => updateCustomerStatus(customer.id, nextStatus)} disabled={adminMutating}>
                  {nextStatus === "suspended" ? textFor(isArabic, "إيقاف", "Suspend") : textFor(isArabic, "تفعيل", "Activate")}
                </Button>
              </div>
            </div>
          );
        }}
      />

      <AdminDetailDrawer
        open={Boolean(selectedCustomer)}
        title={selectedCustomer?.name || ""}
        subtitle={textFor(isArabic, "تفاصيل الزبون", "Customer details")}
        status={selectedCustomer?.status}
        isArabic={isArabic}
        onClose={() => setSelectedCustomer(null)}
        actions={<DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedCustomer(null)} />}
      >
        {selectedCustomer && (
          <>
            <DetailGrid
              items={[
                { label: textFor(isArabic, "الهاتف", "Phone"), value: selectedCustomer.phone },
                { label: textFor(isArabic, "المدينة", "City"), value: selectedCustomer.city },
                { label: textFor(isArabic, "العمر", "Age"), value: selectedCustomer.age },
                { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedCustomer.status, isArabic) },
                { label: textFor(isArabic, "التحقق", "Verification"), value: selectedCustomer.isVerified ? textFor(isArabic, "مؤكد", "Verified") : textFor(isArabic, "غير مؤكد", "Unverified") },
                { label: textFor(isArabic, "تاريخ الإنشاء", "Created at"), value: formatDate(selectedCustomer.createdAt, isArabic) },
                { label: textFor(isArabic, "عدد الرحلات", "Ride count"), value: selectedCustomer.trips }
              ]}
            />
            <DrawerPlaceholder title={textFor(isArabic, "آخر الرحلات", "Recent rides")}>
              {relatedRides(selectedCustomer).length
                ? relatedRides(selectedCustomer).map((ride) => `${ride.id}: ${ride.pickup} → ${ride.dropoff} (${formatMoney(ride.fareIls)})`).join(" | ")
                : textFor(isArabic, "لا توجد رحلات مرتبطة ظاهرة حاليًا.", "No linked rides are visible right now.")}
            </DrawerPlaceholder>
            <DrawerPlaceholder title={textFor(isArabic, "تذاكر الدعم", "Support tickets")}>
              {relatedTickets(selectedCustomer).length
                ? relatedTickets(selectedCustomer).map((ticket) => `${ticket.type}: ${statusLabel(ticket.status, isArabic)}`).join(" | ")
                : textFor(isArabic, "لا توجد تذاكر مرتبطة.", "No linked support tickets.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
