import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function ticketName(ticket) {
  return ticket.userName || ticket.name || "-";
}

export function AdminSupport({ supportTickets, closeSupportTicket, adminMutating, isArabic }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const ticketTypes = useMemo(() => {
    const types = new Set(supportTickets.map((ticket) => ticket.type).filter(Boolean));
    return ["all", ...types];
  }, [supportTickets]);
  const filteredTickets = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return supportTickets.filter((ticket) => {
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesRole = roleFilter === "all" || ticket.role === roleFilter;
      const matchesType = typeFilter === "all" || ticket.type === typeFilter;
      const searchable = `${ticketName(ticket)} ${ticket.phone || ""} ${ticket.message || ""} ${ticket.rideId || ""}`.toLowerCase();
      return matchesStatus && matchesRole && matchesType && (!needle || searchable.includes(needle));
    });
  }, [roleFilter, searchTerm, statusFilter, supportTickets, typeFilter]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "الدعم والشكاوى" : "Support tickets"}</h2>
          <p>{isArabic ? "تذاكر الزبائن والكباتن من قاعدة البيانات مع بحث وفلاتر وإغلاق وإعادة فتح." : "Customer and captain tickets from the database with search, filters, close and reopen."}</p>
        </div>
        <span>{filteredTickets.length} / {supportTickets.length}</span>
      </div>

      <div className="admin-filter-bar support-ticket-filters">
        <label className="field">
          <span>{isArabic ? "بحث" : "Search"}</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={isArabic ? "الاسم أو الهاتف أو الرسالة" : "Name, phone, or message"} />
        </label>
        <label className="field">
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">{isArabic ? "الكل" : "All"}</option>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <label className="field">
          <span>{isArabic ? "الدور" : "Role"}</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">{isArabic ? "الكل" : "All"}</option>
            <option value="customer">customer</option>
            <option value="driver">driver</option>
          </select>
        </label>
        <label className="field">
          <span>{isArabic ? "النوع" : "Type"}</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {ticketTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>

      <div className="admin-data-table support-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "المستخدم" : "User"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "الدور" : "Role"}</span>
          <span>{isArabic ? "النوع" : "Type"}</span>
          <span>{isArabic ? "الرسالة" : "Message"}</span>
          <span>rideId</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "التاريخ" : "Date"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
          <span>{isArabic ? "تفاصيل" : "Details"}</span>
        </div>
        {filteredTickets.length ? filteredTickets.map((ticket) => {
          const nextStatus = ticket.status === "closed" ? "open" : "closed";
          return (
            <div className="admin-table-row" key={ticket.id}>
              <strong>{ticketName(ticket)}</strong>
              <span>{ticket.phone || "-"}</span>
              <b className={`admin-badge ${ticket.role || "customer"}`}>{ticket.role || "customer"}</b>
              <span>{ticket.type}</span>
              <span>{ticket.message}</span>
              <span>{ticket.rideId || "-"}</span>
              <b className={`admin-badge ${ticket.status}`}>{ticket.status}</b>
              <span>{formatDate(ticket.createdAt)}</span>
              <button className="secondary" type="button" onClick={() => closeSupportTicket(ticket.id, nextStatus)} disabled={adminMutating}>
                {nextStatus === "closed" ? (isArabic ? "إغلاق" : "Close") : (isArabic ? "إعادة فتح" : "Reopen")}
              </button>
              <button className="secondary" type="button" onClick={() => setSelectedTicket(ticket)}>
                {isArabic ? "عرض" : "View"}
              </button>
            </div>
          );
        }) : (
          <p className="admin-empty">{isArabic ? "لا توجد تذاكر دعم مطابقة." : "No matching support tickets."}</p>
        )}
      </div>

      {selectedTicket && (
        <div className="admin-detail-drawer">
          <div className="admin-panel-title">
            <h3>{ticketName(selectedTicket)}</h3>
            <button className="icon-button" type="button" onClick={() => setSelectedTicket(null)}>x</button>
          </div>
          <dl className="admin-detail-list">
            <div><dt>{isArabic ? "الهاتف" : "Phone"}</dt><dd>{selectedTicket.phone || "-"}</dd></div>
            <div><dt>{isArabic ? "الدور" : "Role"}</dt><dd>{selectedTicket.role || "customer"}</dd></div>
            <div><dt>{isArabic ? "النوع" : "Type"}</dt><dd>{selectedTicket.type}</dd></div>
            <div><dt>rideId</dt><dd>{selectedTicket.rideId || "-"}</dd></div>
            <div><dt>{isArabic ? "الحالة" : "Status"}</dt><dd>{selectedTicket.status}</dd></div>
            <div><dt>{isArabic ? "التاريخ" : "Date"}</dt><dd>{formatDate(selectedTicket.createdAt)}</dd></div>
            <div><dt>{isArabic ? "الرسالة" : "Message"}</dt><dd>{selectedTicket.message}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
