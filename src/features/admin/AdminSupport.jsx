import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, ErrorState, Input, LoadingSkeleton, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, AdminTimeline, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import {
  ADMIN_SUPPORT_ROLES,
  adminStatusTone,
  exportRowsToCsv,
  formatDate,
  formatDistance,
  formatMoney,
  normalizeCustomer,
  normalizeDriver,
  normalizeRide,
  normalizeTicket,
  paymentMethodLabel,
  statusLabel,
  textFor
} from "./adminFormatters.js";

const TICKET_EXPORT_COLUMNS = [
  { key: "name", label: "Name", value: (ticket) => ticket.name },
  { key: "phone", label: "Phone", value: (ticket) => ticket.phone },
  { key: "role", label: "Role", value: (ticket) => ticket.role },
  { key: "type", label: "Type", value: (ticket) => ticket.type },
  { key: "status", label: "Status", value: (ticket) => ticket.status },
  { key: "rideId", label: "Ride ID", value: (ticket) => ticket.rideId },
  { key: "createdAt", label: "Created", value: (ticket) => ticket.createdAt },
  { key: "message", label: "Message", value: (ticket) => ticket.message }
];

function ticketPerson(ticket, customers = [], drivers = []) {
  if (!ticket) return null;

  if (ticket.role === "driver") {
    const driver = drivers.map((item) => normalizeDriver(item)).find((item) => item.phone === ticket.phone);
    return driver ? { ...driver, role: "driver" } : { name: ticket.name, phone: ticket.phone, role: "driver", city: ticket.city || "-", status: "-" };
  }

  const customer = customers.map(normalizeCustomer).find((item) => item.phone === ticket.phone);
  return customer ? { ...customer, role: "customer" } : { name: ticket.name, phone: ticket.phone, role: "customer", city: ticket.city || "-", status: "-" };
}

function linkedRideForTicket(ticket, rides = []) {
  if (!ticket?.rideId) return null;
  return rides.map(normalizeRide).find((ride) => String(ride.id) === String(ticket.rideId)) || null;
}

export function AdminSupport({ supportTickets, closeSupportTicket, adminMutating, isArabic, adminRides = [], adminCustomers = [], adminDrivers = [], adminLoading, backendError }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRideDetails, setExpandedRideDetails] = useState(false);

  const tickets = useMemo(() => (supportTickets || []).map(normalizeTicket), [supportTickets]);
  const normalizedRides = useMemo(() => (adminRides || []).map(normalizeRide), [adminRides]);
  const ticketTypes = useMemo(() => ["all", ...new Set(tickets.map((ticket) => ticket.type).filter(Boolean))], [tickets]);
  const linkedRide = useMemo(() => linkedRideForTicket(selectedTicket, normalizedRides), [normalizedRides, selectedTicket]);
  const linkedPerson = useMemo(() => ticketPerson(selectedTicket, adminCustomers, adminDrivers), [adminCustomers, adminDrivers, selectedTicket]);

  const filteredTickets = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesRole = roleFilter === "all" || ticket.role === roleFilter;
      const matchesType = typeFilter === "all" || ticket.type === typeFilter;
      const searchable = `${ticket.name} ${ticket.phone} ${ticket.message} ${ticket.rideId}`.toLowerCase();
      return matchesStatus && matchesRole && matchesType && (!needle || searchable.includes(needle));
    });
  }, [roleFilter, searchTerm, statusFilter, tickets, typeFilter]);

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;
  const closedCount = tickets.filter((ticket) => ticket.status === "closed").length;
  const customerCount = tickets.filter((ticket) => ticket.role === "customer").length;
  const driverCount = tickets.filter((ticket) => ticket.role === "driver").length;

  async function updateTicketStatus(ticket, nextStatus) {
    await closeSupportTicket(ticket.id, nextStatus);
    setSelectedTicket((current) => {
      if (!current || current.id !== ticket.id) return current;
      return {
        ...current,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        closedAt: nextStatus === "closed" ? new Date().toISOString() : ""
      };
    });
  }

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "الدعم والشكاوى", "Support tickets")}
        description={textFor(isArabic, "إدارة تذاكر الزبائن والكباتن مع فلاتر وتفاصيل الرحلات المرتبطة.", "Manage customer and captain tickets with filters and linked ride details.")}
        meta={`${filteredTickets.length} / ${tickets.length}`}
        actions={<Button variant="secondary" onClick={() => exportRowsToCsv("support-tickets.csv", filteredTickets, TICKET_EXPORT_COLUMNS)} disabled={!filteredTickets.length}>Export CSV</Button>}
      />

      <div className="admin-analytics-strip admin-super-summary">
        <div><span>{textFor(isArabic, "مفتوحة", "Open")}</span><strong>{openCount}</strong></div>
        <div><span>{textFor(isArabic, "مغلقة", "Closed")}</span><strong>{closedCount}</strong></div>
        <div><span>{textFor(isArabic, "زبائن / كباتن", "Customers / Captains")}</span><strong>{customerCount} / {driverCount}</strong></div>
      </div>

      <div className="admin-filter-bar support-ticket-filters advanced-filter-bar">
        <Input label={textFor(isArabic, "بحث", "Search")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={textFor(isArabic, "الاسم، الهاتف، الرسالة أو رقم الرحلة", "Name, phone, message, or ride ID")} />
        <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">{statusLabel("all", isArabic)}</option>
          <option value="open">{statusLabel("open", isArabic)}</option>
          <option value="closed">{statusLabel("closed", isArabic)}</option>
        </Select>
        <Select label={textFor(isArabic, "الدور", "Role")} value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          {ADMIN_SUPPORT_ROLES.map((role) => <option key={role} value={role}>{statusLabel(role, isArabic)}</option>)}
        </Select>
        <Select label={textFor(isArabic, "النوع", "Type")} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          {ticketTypes.map((type) => <option key={type} value={type}>{type === "all" ? statusLabel("all", isArabic) : type}</option>)}
        </Select>
      </div>

      {adminLoading ? <LoadingSkeleton lines={4} /> : null}
      {backendError ? (
        <ErrorState
          title={textFor(isArabic, "تعذر تحميل تذاكر الدعم", "Unable to load support tickets")}
          description={textFor(isArabic, "تظهر البيانات المتاحة مؤقتًا إلى أن يعود الاتصال.", "Available data remains visible until the connection returns.")}
        />
      ) : null}

      <DataTable
        className="support-table advanced-admin-table"
        gridTemplateColumns="minmax(150px, 1.3fr) minmax(120px, 1fr) minmax(90px, .7fr) minmax(130px, 1fr) minmax(240px, 1.8fr) minmax(105px, .8fr) minmax(105px, .8fr) minmax(130px, 1fr) minmax(160px, 1.1fr)"
        columns={[
          { key: "user", label: textFor(isArabic, "المستخدم", "User") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "role", label: textFor(isArabic, "الدور", "Role") },
          { key: "type", label: textFor(isArabic, "النوع", "Type") },
          { key: "message", label: textFor(isArabic, "الرسالة", "Message") },
          { key: "ride", label: textFor(isArabic, "الرحلة", "Ride") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "date", label: textFor(isArabic, "التاريخ", "Date") },
          { key: "actions", label: textFor(isArabic, "إجراءات", "Actions") }
        ]}
        rows={filteredTickets}
        empty={<EmptyState title={textFor(isArabic, "لا توجد تذاكر مطابقة", "No matching tickets")} description={textFor(isArabic, "تذاكر الدعم الجديدة ستظهر هنا.", "New support tickets will appear here.")} />}
        renderRow={(ticket) => {
          const nextStatus = ticket.status === "closed" ? "open" : "closed";
          return (
            <div className="admin-table-row" key={ticket.id}>
              <strong>{ticket.name}</strong>
              <span>{ticket.phone}</span>
              <Badge className="admin-status-badge-ar" tone={ticket.role === "driver" ? "info" : "neutral"}>{statusLabel(ticket.role, isArabic)}</Badge>
              <span>{ticket.type}</span>
              <span className="admin-truncate">{ticket.message}</span>
              <span>{ticket.rideId || "-"}</span>
              <Badge className="admin-status-badge-ar" tone={adminStatusTone(ticket.status)}>{statusLabel(ticket.status, isArabic)}</Badge>
              <span>{formatDate(ticket.createdAt, isArabic)}</span>
              <div className="admin-action-row compact-actions">
                <Button variant="secondary" size="sm" onClick={() => { setSelectedTicket(ticket); setExpandedRideDetails(false); }}>{textFor(isArabic, "عرض", "View")}</Button>
                <Button variant={nextStatus === "closed" ? "danger" : "secondary"} size="sm" onClick={() => updateTicketStatus(ticket, nextStatus)} disabled={adminMutating}>
                  {nextStatus === "closed" ? textFor(isArabic, "إغلاق", "Close") : textFor(isArabic, "إعادة فتح", "Reopen")}
                </Button>
              </div>
            </div>
          );
        }}
      />

      <AdminDetailDrawer
        open={Boolean(selectedTicket)}
        title={selectedTicket?.name || ""}
        subtitle={textFor(isArabic, "تفاصيل تذكرة الدعم", "Support ticket details")}
        status={selectedTicket?.status}
        isArabic={isArabic}
        onClose={() => setSelectedTicket(null)}
        actions={selectedTicket && (
          <>
            <Button
              variant={selectedTicket.status === "closed" ? "secondary" : "danger"}
              onClick={() => updateTicketStatus(selectedTicket, selectedTicket.status === "closed" ? "open" : "closed")}
              disabled={adminMutating}
            >
              {selectedTicket.status === "closed" ? textFor(isArabic, "إعادة فتح التذكرة", "Reopen ticket") : textFor(isArabic, "إغلاق التذكرة", "Close ticket")}
            </Button>
            <DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedTicket(null)} />
          </>
        )}
      >
        {selectedTicket && (
          <>
            <section className="admin-support-detail-card support-ticket-drawer">
              <SectionHeader title={textFor(isArabic, "تفاصيل التذكرة", "Ticket details")} meta={statusLabel(selectedTicket.status, isArabic)} />
              <DetailGrid
                items={[
                  { label: textFor(isArabic, "مقدم التذكرة", "Submitted by"), value: selectedTicket.name },
                  { label: textFor(isArabic, "الدور", "Role"), value: statusLabel(selectedTicket.role, isArabic) },
                  { label: textFor(isArabic, "الهاتف", "Phone"), value: selectedTicket.phone },
                  { label: textFor(isArabic, "نوع المشكلة", "Issue type"), value: selectedTicket.type },
                  { label: textFor(isArabic, "المدينة", "City"), value: selectedTicket.city || linkedPerson?.city || "-" },
                  { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedTicket.status, isArabic) },
                  { label: textFor(isArabic, "وقت الإنشاء", "Created at"), value: formatDate(selectedTicket.createdAt, isArabic) },
                  { label: textFor(isArabic, "آخر تحديث", "Updated at"), value: formatDate(selectedTicket.updatedAt, isArabic) }
                ]}
              />
            </section>

            <DrawerPlaceholder title={textFor(isArabic, "رسالة الشكوى", "Complaint message")}>{selectedTicket.message}</DrawerPlaceholder>

            <section className="admin-support-detail-card support-person-card">
              <SectionHeader title={selectedTicket.role === "driver" ? textFor(isArabic, "معلومات الكابتن", "Captain quick info") : textFor(isArabic, "معلومات الزبون", "Customer quick info")} />
              <DetailGrid
                items={[
                  { label: textFor(isArabic, "الاسم", "Name"), value: linkedPerson?.name || selectedTicket.name },
                  { label: textFor(isArabic, "الهاتف", "Phone"), value: linkedPerson?.phone || selectedTicket.phone },
                  { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(linkedPerson?.status, isArabic) },
                  { label: textFor(isArabic, "المدينة", "City"), value: linkedPerson?.city || selectedTicket.city || "-" }
                ]}
              />
            </section>

            <section className="admin-support-detail-card support-linked-ride-card">
              <SectionHeader
                title={textFor(isArabic, "الرحلة المرتبطة", "Linked ride")}
                description={selectedTicket.rideId ? selectedTicket.rideId : textFor(isArabic, "لا توجد رحلة مرتبطة بهذه التذكرة.", "This ticket is not linked to a ride.")}
                actions={linkedRide ? (
                  <Button variant="secondary" size="sm" onClick={() => setExpandedRideDetails((value) => !value)}>
                    {expandedRideDetails ? textFor(isArabic, "إخفاء الرحلة", "Hide ride") : textFor(isArabic, "عرض الرحلة", "View ride")}
                  </Button>
                ) : null}
              />
              {linkedRide ? (
                <>
                  <DetailGrid
                    items={[
                      { label: textFor(isArabic, "رقم الرحلة", "Ride ID"), value: linkedRide.id },
                      { label: textFor(isArabic, "من", "Pickup"), value: linkedRide.pickup },
                      { label: textFor(isArabic, "إلى", "Destination"), value: linkedRide.dropoff },
                      { label: textFor(isArabic, "حالة الرحلة", "Ride status"), value: statusLabel(linkedRide.status, isArabic) },
                      { label: textFor(isArabic, "السعر", "Fare"), value: formatMoney(linkedRide.fareIls) },
                      { label: textFor(isArabic, "الدفع", "Payment"), value: paymentMethodLabel(linkedRide.paymentMethod, isArabic) },
                      { label: textFor(isArabic, "الزبون", "Customer"), value: linkedRide.customer },
                      { label: textFor(isArabic, "الكابتن", "Captain"), value: linkedRide.captain || textFor(isArabic, "لم يتم التعيين", "Not assigned") }
                    ]}
                  />
                  {expandedRideDetails ? (
                    <>
                      <DetailGrid
                        items={[
                          { label: textFor(isArabic, "المسافة", "Distance"), value: formatDistance(linkedRide.distanceKm) },
                          { label: textFor(isArabic, "وقت القبول", "Accepted at"), value: formatDate(linkedRide.acceptedAt, isArabic) },
                          { label: textFor(isArabic, "وقت الإلغاء", "Cancelled at"), value: formatDate(linkedRide.cancelledAt, isArabic) },
                          { label: textFor(isArabic, "وقت الإكمال", "Completed at"), value: formatDate(linkedRide.completedAt, isArabic) }
                        ]}
                      />
                      <AdminTimeline status={linkedRide.status} timestamps={linkedRide} isArabic={isArabic} />
                    </>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title={textFor(isArabic, "لا توجد رحلة مرتبطة", "No linked ride")}
                  description={textFor(isArabic, "يمكن متابعة التذكرة من بيانات المرسل والرسالة.", "Use sender information and the message to follow up.")}
                />
              )}
            </section>

            <DrawerPlaceholder title={textFor(isArabic, "ردود الإدارة", "Admin replies")}>
              {textFor(isArabic, "سيتم ربط الردود والمحادثة الداخلية لاحقًا.", "Threaded admin replies will be connected later.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
