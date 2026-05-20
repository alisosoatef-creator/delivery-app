import { Badge, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { AdminStats } from "./AdminStats.jsx";
import { formatMoney, normalizeRide, statusLabel, textFor } from "./adminFormatters.js";

function buildAdvancedStats(baseStats, rides = [], customers = [], drivers = []) {
  const normalizedRides = rides.map(normalizeRide);
  const completedRides = normalizedRides.filter((ride) => ride.status === "completed").length;
  const cancelledRides = normalizedRides.filter((ride) => ride.status === "cancelled").length;
  const acceptedRides = normalizedRides.filter((ride) => ["accepted", "driver_arriving", "arrived", "in_progress", "completed"].includes(ride.status)).length;
  const activeCaptains = drivers.filter((driver) => (driver.status || "active") === "active").length;
  const acceptanceRate = normalizedRides.length ? Math.round((acceptedRides / normalizedRides.length) * 100) : 0;
  return {
    ...baseStats,
    completedRides,
    cancelledRides,
    activeCaptains,
    newCustomers: customers.length,
    acceptanceRate
  };
}

export function AdminDashboard({ state, dashboardStats, pendingCaptainApplications, supportTickets, pricingRules, isArabic, cityName, adminRides, adminCustomers, adminDrivers }) {
  const advancedStats = buildAdvancedStats(dashboardStats, adminRides || [], adminCustomers || [], adminDrivers || []);
  const recentApplications = pendingCaptainApplications.slice(-4).reverse();
  const openTickets = supportTickets.filter((ticket) => ticket.status === "open").slice(0, 4);
  const activeRides = (adminRides || []).map(normalizeRide).filter((ride) => ["searching", "accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status)).slice(0, 4);

  return (
    <div className="admin-section-stack admin-dashboard-advanced">
      <SectionHeader
        title={textFor(isArabic, "لوحة التحكم", "Dashboard")}
        description={textFor(isArabic, "نظرة تشغيلية على الرحلات، الطلبات، الدعم، الإيرادات، والكباتن.", "Operational view across rides, applications, support, revenue, and captains.")}
        meta={textFor(isArabic, "تحديث محلي مباشر", "Local live overview")}
      />
      <AdminStats dashboardStats={advancedStats} isArabic={isArabic} />

      <div className="admin-grid-two">
        <section className="admin-panel nested-admin-panel">
          <SectionHeader title={textFor(isArabic, "الرحلات النشطة", "Active rides")} meta={activeRides.length} />
          <div className="admin-list">
            {activeRides.length ? activeRides.map((ride) => (
              <article className="admin-mini-card elevated-mini-card" key={ride.id}>
                <strong>{ride.customer}</strong>
                <span>{ride.pickup} → {ride.dropoff}</span>
                <div className="admin-mini-card-footer">
                  <Badge tone="warning">{statusLabel(ride.status, isArabic)}</Badge>
                  <small>{formatMoney(ride.fareIls)}</small>
                </div>
              </article>
            )) : (
              <EmptyState title={textFor(isArabic, "لا توجد رحلات نشطة", "No active rides")} description={textFor(isArabic, "الرحلات الجديدة ستظهر هنا.", "New active rides will appear here.")} />
            )}
          </div>
        </section>

        <section className="admin-panel nested-admin-panel">
          <SectionHeader title={textFor(isArabic, "طلبات الكباتن الأخيرة", "Recent captain applications")} meta={dashboardStats.pendingCaptainApplications} />
          <div className="admin-list">
            {recentApplications.length ? recentApplications.map((application) => (
              <article className="admin-mini-card elevated-mini-card" key={application.id}>
                <strong>{application.fullName}</strong>
                <span>{application.phone}</span>
                <div className="admin-mini-card-footer">
                  <Badge tone={application.status === "approved" ? "success" : application.status === "rejected" ? "danger" : "warning"}>{statusLabel(application.status, isArabic)}</Badge>
                  <small>{application.cityLabel || application.city}</small>
                </div>
              </article>
            )) : (
              <EmptyState title={textFor(isArabic, "لا توجد طلبات جديدة", "No new applications")} description={textFor(isArabic, "طلبات الانضمام ستظهر هنا.", "Captain applications will appear here.")} />
            )}
          </div>
        </section>
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel nested-admin-panel">
          <SectionHeader title={textFor(isArabic, "المدن والأسعار", "Cities and pricing")} meta={pricingRules.length} />
          <div className="admin-list">
            {pricingRules.slice(0, 5).map((rule) => (
              <article className="admin-mini-card pricing-mini-card" key={rule.id || rule.cityId}>
                <strong>{cityName(state, rule.cityId, isArabic) || rule.cityName}</strong>
                <span>{textFor(isArabic, "سعر البداية", "Base fare")}: {formatMoney(rule.baseFareIls ?? rule.baseFare)}</span>
                <span>{textFor(isArabic, "للكيلومتر", "Per km")}: {formatMoney(rule.perKmIls ?? rule.pricePerKm)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel nested-admin-panel">
          <SectionHeader title={textFor(isArabic, "الدعم المفتوح", "Open support")} meta={openTickets.length} />
          <div className="admin-data-table compact support-dashboard-table">
            {openTickets.length ? openTickets.map((ticket) => (
              <div className="admin-table-row" key={ticket.id}>
                <strong>{ticket.userName || ticket.name}</strong>
                <span>{ticket.type}</span>
                <span>{ticket.message}</span>
                <Badge tone="success">{statusLabel(ticket.status, isArabic)}</Badge>
              </div>
            )) : (
              <EmptyState title={textFor(isArabic, "لا توجد تذاكر مفتوحة", "No open tickets")} description={textFor(isArabic, "فريق الدعم مرتاح حاليًا.", "Support desk is clear right now.")} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
