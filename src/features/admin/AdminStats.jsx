const STAT_ITEMS = [
  ["customers", "عدد الزبائن", "Customers"],
  ["captains", "عدد الكباتن", "Captains"],
  ["pendingCaptainApplications", "طلبات كباتن قيد المراجعة", "Pending applications"],
  ["todayRides", "الرحلات اليوم", "Rides today"],
  ["activeRides", "الرحلات النشطة", "Active rides"],
  ["estimatedRevenue", "الإيرادات التقديرية", "Estimated revenue"],
  ["openSupportTickets", "شكاوى الدعم المفتوحة", "Open support tickets"]
];

export function AdminStats({ dashboardStats, isArabic }) {
  return (
    <div className="admin-stat-grid">
      {STAT_ITEMS.map(([key, labelAr, labelEn]) => (
        <section className="admin-stat-card" key={key}>
          <span>{isArabic ? labelAr : labelEn}</span>
          <strong>{key === "estimatedRevenue" ? `${dashboardStats[key]} ₪` : dashboardStats[key]}</strong>
        </section>
      ))}
    </div>
  );
}
