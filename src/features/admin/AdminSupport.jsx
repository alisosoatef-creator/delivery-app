import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, Input, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import { ADMIN_SUPPORT_ROLES, adminStatusTone, exportRowsToCsv, formatDate, normalizeTicket, statusLabel, textFor } from "./adminFormatters.js";

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

export function AdminSupport({ supportTickets, closeSupportTicket, adminMutating, isArabic }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const tickets = useMemo(() => (supportTickets || []).map(normalizeTicket), [supportTickets]);
  const ticketTypes = useMemo(() => ["all", ...new Set(tickets.map((ticket) => ticket.type).filter(Boolean))], [tickets]);

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

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "الدعم والشكاوى", "Support tickets")}
        description={textFor(isArabic, "إدارة تذاكر الزبائن والكباتن مع فلاتر، تفاصيل، وإغلاق أو إعادة فتح.", "Manage customer and captain tickets with filters, detail drawers, close and reopen actions.")}
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

      <DataTable
        className="support-table advanced-admin-table"
        gridTemplateColumns="minmax(150px, 1.3fr) minmax(120px, 1fr) minmax(90px, .7fr) minmax(130px, 1fr) minmax(240px, 1.8fr) minmax(105px, .8fr) minmax(105px, .8fr) minmax(130px, 1fr) minmax(160px, 1.1fr)"
        columns={[
          { key: "user", label: textFor(isArabic, "المستخدم", "User") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "role", label: textFor(isArabic, "الدور", "Role") },
          { key: "type", label: textFor(isArabic, "النوع", "Type") },
          { key: "message", label: textFor(isArabic, "الرسالة", "Message") },
          { key: "ride", label: "rideId" },
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
                <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(ticket)}>{textFor(isArabic, "عرض", "View")}</Button>
                <Button variant={nextStatus === "closed" ? "danger" : "secondary"} size="sm" onClick={() => closeSupportTicket(ticket.id, nextStatus)} disabled={adminMutating}>
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
              onClick={() => closeSupportTicket(selectedTicket.id, selectedTicket.status === "closed" ? "open" : "closed")}
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
            <DetailGrid
              items={[
                { label: textFor(isArabic, "مقدم التذكرة", "Submitted by"), value: selectedTicket.name },
                { label: textFor(isArabic, "الدور", "Role"), value: statusLabel(selectedTicket.role, isArabic) },
                { label: textFor(isArabic, "الهاتف", "Phone"), value: selectedTicket.phone },
                { label: textFor(isArabic, "النوع", "Type"), value: selectedTicket.type },
                { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedTicket.status, isArabic) },
                { label: textFor(isArabic, "تاريخ الإنشاء", "Created at"), value: formatDate(selectedTicket.createdAt, isArabic) },
                { label: textFor(isArabic, "آخر تحديث", "Updated at"), value: formatDate(selectedTicket.updatedAt, isArabic) },
                { label: "rideId", value: selectedTicket.rideId || "-" }
              ]}
            />
            <DrawerPlaceholder title={textFor(isArabic, "الرسالة", "Message")}>{selectedTicket.message}</DrawerPlaceholder>
            <DrawerPlaceholder title={textFor(isArabic, "ردود الإدارة", "Admin replies")}>
              {textFor(isArabic, "Placeholder لمساحة ردود ومحادثة دعم لاحقًا.", "Placeholder for future threaded support replies.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
