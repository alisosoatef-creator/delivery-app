export function AdminSupport({ supportTickets, closeSupportTicket, isArabic }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "الدعم والشكاوى" : "Support tickets"}</h2>
          <p>{isArabic ? "تذاكر محلية مبدئية، والإغلاق Placeholder حتى الربط." : "Local mock tickets; closing is a Placeholder until backend wiring."}</p>
        </div>
        <span>{supportTickets.length}</span>
      </div>
      <div className="admin-data-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "المستخدم" : "User"}</span>
          <span>{isArabic ? "النوع" : "Type"}</span>
          <span>{isArabic ? "الرسالة" : "Message"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "إجراء" : "Action"}</span>
        </div>
        {supportTickets.map((ticket) => (
          <div className="admin-table-row" key={ticket.id}>
            <strong>{ticket.userName}</strong>
            <span>{ticket.type}</span>
            <span>{ticket.message}</span>
            <b className={`admin-badge ${ticket.status}`}>{ticket.status}</b>
            <button className="secondary" type="button" onClick={() => closeSupportTicket(ticket.id)} disabled={ticket.status === "closed"}>
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
