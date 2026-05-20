import { StatCard } from "../../components/ui/index.js";
import { formatMoney, textFor } from "./adminFormatters.js";

const STAT_ITEMS = [
  ["todayRides", "رحلات اليوم", "Rides today"],
  ["completedRides", "رحلات مكتملة", "Completed rides"],
  ["cancelledRides", "رحلات ملغاة", "Cancelled rides"],
  ["estimatedRevenue", "إيرادات تقديرية", "Estimated revenue"],
  ["activeRides", "رحلات نشطة", "Active rides"],
  ["activeCaptains", "كباتن نشطين", "Active captains"],
  ["newCustomers", "زبائن جدد", "New customers"],
  ["openSupportTickets", "تذاكر دعم مفتوحة", "Open support tickets"],
  ["acceptanceRate", "معدل قبول الرحلات", "Ride acceptance rate"]
];

export function AdminStats({ dashboardStats, isArabic }) {
  return (
    <div className="admin-stat-grid advanced-stat-grid">
      {STAT_ITEMS.map(([key, labelAr, labelEn]) => {
        const value = key === "estimatedRevenue"
          ? formatMoney(dashboardStats[key])
          : key === "acceptanceRate"
            ? `${dashboardStats[key] ?? 0}%`
            : dashboardStats[key] ?? 0;
        return (
          <StatCard
            className="admin-stat-card"
            key={key}
            label={textFor(isArabic, labelAr, labelEn)}
            value={value}
          />
        );
      })}
    </div>
  );
}
