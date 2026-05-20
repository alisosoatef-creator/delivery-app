import { StatCard } from "../../components/ui/index.js";

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
        <StatCard
          className="admin-stat-card"
          key={key}
          label={isArabic ? labelAr : labelEn}
          value={key === "estimatedRevenue" ? `${dashboardStats[key]} ₪` : dashboardStats[key]}
        />
      ))}
    </div>
  );
}
