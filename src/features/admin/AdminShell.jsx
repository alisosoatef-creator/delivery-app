import { useMemo, useState } from "react";
import { Toast } from "../../components/ui/index.js";
import { APP_ROUTE_PATHS } from "../../routes/index.js";
import { AdminCustomers } from "./AdminCustomers.jsx";
import { AdminDashboard } from "./AdminDashboard.jsx";
import { AdminDriverApplications } from "./AdminDriverApplications.jsx";
import { AdminDrivers } from "./AdminDrivers.jsx";
import { AdminHeader } from "./AdminHeader.jsx";
import { AdminPayments } from "./AdminPayments.jsx";
import { AdminPermissions } from "./AdminPermissions.jsx";
import { AdminPricing } from "./AdminPricing.jsx";
import { AdminRides } from "./AdminRides.jsx";
import { AdminSettings } from "./AdminSettings.jsx";
import { AdminSidebar } from "./AdminSidebar.jsx";
import { AdminSupport } from "./AdminSupport.jsx";
import { mockCustomers, mockPaymentRecords, mockRideRecords } from "./adminMockData.js";

const ADMIN_SECTIONS = [
  { key: "dashboard", labelAr: "الرئيسية", labelEn: "Dashboard", path: APP_ROUTE_PATHS.admin.dashboard },
  { key: "applications", labelAr: "طلبات الكباتن", labelEn: "Captain applications", path: APP_ROUTE_PATHS.admin.driverApplications },
  { key: "customers", labelAr: "الزبائن", labelEn: "Customers", path: APP_ROUTE_PATHS.admin.customers },
  { key: "drivers", labelAr: "الكباتن", labelEn: "Captains", path: APP_ROUTE_PATHS.admin.drivers },
  { key: "rides", labelAr: "الرحلات", labelEn: "Rides", path: APP_ROUTE_PATHS.admin.rides },
  { key: "payments", labelAr: "المدفوعات", labelEn: "Payments", path: APP_ROUTE_PATHS.admin.payments },
  { key: "support", labelAr: "الدعم", labelEn: "Support", path: APP_ROUTE_PATHS.admin.support },
  { key: "pricing", labelAr: "المدن والأسعار", labelEn: "Cities & pricing", path: "/admin/pricing" },
  { key: "settings", labelAr: "الإعدادات", labelEn: "Settings", path: APP_ROUTE_PATHS.admin.settings },
  { key: "permissions", labelAr: "الصلاحيات", labelEn: "Permissions", path: "/admin/permissions" }
];

function cityName(state, cityId, isArabic) {
  const city = state.cities.find((item) => item.id === cityId);
  return city ? (isArabic ? city.ar : city.en) : cityId;
}

function captainFromApplication(application, isArabic) {
  const approvedAt = new Date().toISOString();
  return {
    id: `approved_${application.id}`,
    applicationId: application.id,
    fullName: application.fullName,
    nameAr: application.fullName,
    nameEn: application.fullName,
    phone: application.phone,
    cityId: application.city,
    cityLabel: application.cityLabel || application.city,
    vehicle: application.vehicleType,
    vehicleType: application.vehicleType,
    plate: application.vehiclePlate || (isArabic ? "غير محدد" : "Not provided"),
    experienceYears: application.experienceYears,
    online: false,
    availability: "offline",
    status: "active",
    approvedAt
  };
}

export function AdminShell({ state, dispatch, isArabic }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [routePath, setRoutePath] = useState(APP_ROUTE_PATHS.admin.dashboard);
  const pendingCaptainApplications = state.pendingCaptainApplications || [];
  const approvedCaptains = state.approvedCaptains || [];
  const supportTickets = state.supportTickets || [];
  const pricingRules = state.pricingRules || [];

  const dashboardStats = useMemo(() => {
    const activeRides = state.ride ? 1 : state.admin.activeRides;
    const estimatedRevenue = mockPaymentRecords.reduce((sum, payment) => sum + payment.amountIls, 0) + (state.admin.todayRevenueIls || 0);
    return {
      customers: mockCustomers.length,
      captains: state.drivers.length + approvedCaptains.length,
      pendingCaptainApplications: pendingCaptainApplications.filter((application) => application.status === "pending").length,
      todayRides: mockRideRecords.length + (state.ride ? 1 : 0),
      activeRides,
      estimatedRevenue,
      openSupportTickets: supportTickets.filter((ticket) => ticket.status === "open").length
    };
  }, [approvedCaptains.length, pendingCaptainApplications, state.admin.activeRides, state.admin.todayRevenueIls, state.drivers.length, state.ride, supportTickets]);

  function switchSection(section) {
    setActiveSection(section.key);
    setRoutePath(section.path);
  }

  function approveCaptainApplication(applicationId) {
    const application = pendingCaptainApplications.find((item) => item.id === applicationId);
    if (!application) return;

    const reviewedAt = new Date().toISOString();
    const nextApplications = pendingCaptainApplications.map((item) =>
      item.id === applicationId ? { ...item, status: "approved", reviewedAt } : item
    );
    const alreadyApproved = approvedCaptains.some((captain) => captain.applicationId === applicationId);
    const nextCaptains = alreadyApproved ? approvedCaptains : [...approvedCaptains, captainFromApplication(application, isArabic)];

    dispatch({
      type: "patch",
      patch: {
        pendingCaptainApplications: nextApplications,
        approvedCaptains: nextCaptains,
        toast: isArabic ? "تم قبول طلب الكابتن محليًا بدون تسجيل دخول مباشر." : "Captain application approved locally without direct sign-in."
      }
    });
  }

  function rejectCaptainApplication(applicationId) {
    const reviewedAt = new Date().toISOString();
    dispatch({
      type: "patch",
      patch: {
        pendingCaptainApplications: pendingCaptainApplications.map((application) =>
          application.id === applicationId ? { ...application, status: "rejected", reviewedAt } : application
        ),
        toast: isArabic ? "تم رفض الطلب محليًا وبقي محفوظًا للمراجعة." : "Application rejected locally and kept for review."
      }
    });
  }

  function closeSupportTicket(ticketId) {
    dispatch({
      type: "patch",
      patch: {
        supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "closed" } : ticket)),
        toast: isArabic ? "تم إغلاق التذكرة محليًا." : "Ticket closed locally."
      }
    });
  }

  function updatePricingRule(ruleId, patch) {
    dispatch({
      type: "patch",
      patch: {
        pricingRules: pricingRules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch, updatedAt: new Date().toISOString() } : rule)),
        toast: isArabic ? "تم تحديث السعر محليًا." : "Pricing updated locally."
      }
    });
  }

  function updateSystemSettings(patch) {
    dispatch({
      type: "patch",
      patch: {
        systemSettings: { ...state.systemSettings, ...patch },
        toast: isArabic ? "تم تحديث إعدادات النظام محليًا." : "System settings updated locally."
      }
    });
  }

  function placeholder(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  const sharedAdminProps = {
    state,
    dispatch,
    isArabic,
    dashboardStats,
    pendingCaptainApplications,
    approvedCaptains,
    supportTickets,
    pricingRules,
    cityName,
    approveCaptainApplication,
    rejectCaptainApplication,
    closeSupportTicket,
    updatePricingRule,
    updateSystemSettings,
    placeholder
  };

  return (
    <main className="admin-app-layout" data-route={routePath}>
      <AdminSidebar
        sections={ADMIN_SECTIONS}
        activeSection={activeSection}
        isArabic={isArabic}
        onSelect={switchSection}
      />
      <section className="admin-workspace">
        <AdminHeader
          state={state}
          dispatch={dispatch}
          isArabic={isArabic}
          activeSection={ADMIN_SECTIONS.find((section) => section.key === activeSection)}
        />
        {activeSection === "dashboard" && <AdminDashboard {...sharedAdminProps} />}
        {activeSection === "applications" && <AdminDriverApplications {...sharedAdminProps} />}
        {activeSection === "customers" && <AdminCustomers {...sharedAdminProps} />}
        {activeSection === "drivers" && <AdminDrivers {...sharedAdminProps} />}
        {activeSection === "rides" && <AdminRides {...sharedAdminProps} />}
        {activeSection === "payments" && <AdminPayments {...sharedAdminProps} />}
        {activeSection === "support" && <AdminSupport {...sharedAdminProps} />}
        {activeSection === "pricing" && <AdminPricing {...sharedAdminProps} />}
        {activeSection === "settings" && <AdminSettings {...sharedAdminProps} />}
        {activeSection === "permissions" && <AdminPermissions {...sharedAdminProps} />}
      </section>
      <Toast message={state.toast} />
    </main>
  );
}
