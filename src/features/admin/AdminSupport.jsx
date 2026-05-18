function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminSupport({ supportTickets, closeSupportTicket, adminMutating, isArabic }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "الدعم والشكاوى" : "Support tickets"}</h2>
          <p>{isArabic ? "تذاكر الدعم من قاعدة البيانات مع إغلاق وإعادة فتح مبدئية." : "Database-backed support tickets with close and reopen actions."}</p>
        </div>
        <span>{supportTickets.length}</span>
      </div>
      <div className="admin-data-table support-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "المستخدم" : "User"}</span>
          <span>{isArabic ? "الهاتف" : "Phone"}</span>
          <span>{isArabic ? "النوع" : "Type"}</span>
          <span>{isArabic ? "الرسالة" : "Message"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "التاريخ" : "Date"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {supportTickets.length ? supportTickets.map((ticket) => {
          const nextStatus = ticket.status === "closed" ? "open" : "closed";
          return (
            <div className="admin-table-row" key={ticket.id}>
              <strong>{ticket.userName || ticket.name}</strong>
              <span>{ticket.phone || "-"}</span>
              <span>{ticket.type}</span>
              <span>{ticket.message}</span>
              <b className={`admin-badge ${ticket.status}`}>{ticket.status}</b>
              <span>{formatDate(ticket.createdAt)}</span>
              <button className="secondary" type="button" onClick={() => closeSupportTicket(ticket.id, nextStatus)} disabled={adminMutating}>
                {nextStatus === "closed" ? (isArabic ? "إغلاق" : "Close") : (isArabic ? "إعادة فتح" : "Reopen")}
              </button>
            </div>
          );
        }) : (
          <p className="admin-empty">{isArabic ? "لا توجد تذاكر دعم بعد." : "No support tickets yet."}</p>
        )}
      </div>
    </section>
  );
}
