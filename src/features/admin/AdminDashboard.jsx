import { AdminStats } from "./AdminStats.jsx";

export function AdminDashboard({ state, dashboardStats, pendingCaptainApplications, supportTickets, pricingRules, isArabic, cityName }) {
  const recentApplications = pendingCaptainApplications.slice(-3).reverse();
  const openTickets = supportTickets.filter((ticket) => ticket.status === "open").slice(0, 3);

  return (
    <div className="admin-section-stack">
      <AdminStats dashboardStats={dashboardStats} isArabic={isArabic} />

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel-title">
            <h2>{isArabic ? "طلبات الكباتن الأخيرة" : "Recent captain applications"}</h2>
            <span>{dashboardStats.pendingCaptainApplications}</span>
          </div>
          <div className="admin-list">
            {recentApplications.length ? recentApplications.map((application) => (
              <article className="admin-mini-card" key={application.id}>
                <strong>{application.fullName}</strong>
                <span>{application.phone}</span>
                <b className={`admin-badge ${application.status}`}>{application.status}</b>
              </article>
            )) : (
              <p className="admin-empty">{isArabic ? "لا توجد طلبات جديدة حاليًا." : "No new applications right now."}</p>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <h2>{isArabic ? "المدن والأسعار" : "Cities and pricing"}</h2>
            <span>{pricingRules.length}</span>
          </div>
          <div className="admin-list">
            {pricingRules.slice(0, 4).map((rule) => (
              <article className="admin-mini-card" key={rule.id}>
                <strong>{cityName(state, rule.cityId, isArabic)}</strong>
                <span>{isArabic ? "سعر البداية" : "Base fare"}: {rule.baseFareIls} ₪</span>
                <span>{isArabic ? "للكيلومتر" : "Per km"}: {rule.perKmIls} ₪</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-title">
          <h2>{isArabic ? "الدعم المفتوح" : "Open support"}</h2>
          <span>{openTickets.length}</span>
        </div>
        <div className="admin-data-table compact">
          {openTickets.map((ticket) => (
            <div className="admin-table-row" key={ticket.id}>
              <strong>{ticket.userName}</strong>
              <span>{ticket.type}</span>
              <span>{ticket.message}</span>
              <b className={`admin-badge ${ticket.status}`}>{ticket.status}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
