import { useMemo, useState } from "react";
import { Toast } from "../../components/ui/index.js";
import { useAdminData } from "../../hooks/useAdminData.js";
import { useCaptainApplications } from "../../hooks/useCaptainApplications.js";
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

function mergeById(localItems, remoteItems) {
  const merged = new Map();
  localItems.forEach((item) => {
    if (item?.id) merged.set(item.id, item);
  });
  remoteItems.forEach((item) => {
    if (item?.id) merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
  });
  return [...merged.values()];
}

export function AdminShell({ state, dispatch, isArabic, logout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [routePath, setRoutePath] = useState(APP_ROUTE_PATHS.admin.dashboard);
  const adminEnabled = state.role === "admin" && Boolean(state.session);
  const captainApplicationsQuery = useCaptainApplications({ enabled: adminEnabled });
  const adminData = useAdminData({ enabled: adminEnabled });
  const pendingCaptainApplications = useMemo(
    () => mergeById(state.pendingCaptainApplications || [], captainApplicationsQuery.applications || []),
    [captainApplicationsQuery.applications, state.pendingCaptainApplications]
  );
  const approvedCaptains = state.approvedCaptains || [];
  const supportTickets = adminData.supportTickets.length ? adminData.supportTickets : state.supportTickets || [];
  const pricingRules = adminData.pricingRules.length ? adminData.pricingRules : state.pricingRules || [];
  const adminCustomers = adminData.customers.length ? adminData.customers : mockCustomers;
  const fallbackDrivers = useMemo(
    () => [
      ...state.drivers.map((driver) => ({ ...driver, status: "active", availability: driver.online ? "online" : "offline" })),
      ...approvedCaptains
    ],
    [approvedCaptains, state.drivers]
  );
  const adminDrivers = adminData.drivers.length ? adminData.drivers : fallbackDrivers;
  const adminRides = adminData.rides.length ? adminData.rides : null;
  const backendError = captainApplicationsQuery.backendError || adminData.backendError;
  const adminLoading = captainApplicationsQuery.isLoading || adminData.isLoading;
  const adminMutating = captainApplicationsQuery.isMutating || adminData.isMutating;

  const dashboardStats = useMemo(() => {
    const activeRides = state.ride ? 1 : state.admin.activeRides;
    const estimatedRevenue = mockPaymentRecords.reduce((sum, payment) => sum + payment.amountIls, 0) + (state.admin.todayRevenueIls || 0);
    const rideCount = adminRides?.length || mockRideRecords.length + (state.ride ? 1 : 0);
    return {
      customers: adminCustomers.length,
      captains: adminDrivers.length,
      pendingCaptainApplications: pendingCaptainApplications.filter((application) => application.status === "pending").length,
      todayRides: rideCount,
      activeRides,
      estimatedRevenue,
      openSupportTickets: supportTickets.filter((ticket) => ticket.status === "open").length
    };
  }, [adminCustomers.length, adminDrivers.length, adminRides, pendingCaptainApplications, state.admin.activeRides, state.admin.todayRevenueIls, state.ride, supportTickets]);

  function switchSection(section) {
    setActiveSection(section.key);
    setRoutePath(section.path);
  }

  async function approveCaptainApplication(applicationId) {
    const application = pendingCaptainApplications.find((item) => item.id === applicationId);
    if (!application) return;

    const remoteReviewedAt = new Date().toISOString();
    try {
      const result = await captainApplicationsQuery.approveApplication(applicationId);
      const approvedApplication = result?.application || { ...application, status: "approved", reviewedAt: remoteReviewedAt };
      const captain = result?.captain || captainFromApplication(approvedApplication, isArabic);
      const alreadyApproved = approvedCaptains.some((item) => item.applicationId === applicationId || item.id === captain.id);
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: pendingCaptainApplications.map((item) =>
            item.id === applicationId ? approvedApplication : item
          ),
          approvedCaptains: alreadyApproved ? approvedCaptains : [...approvedCaptains, captain],
          backendLive: true,
          toast: isArabic ? "تم قبول طلب الكابتن عبر الـ Backend بدون تسجيل دخول مباشر." : "Captain application approved through the Backend without direct sign-in."
        }
      });
      return;
    } catch (error) {
      const backendError = error?.message || "Backend unavailable";
      const approvedApplication = { ...application, status: "approved", reviewedAt: remoteReviewedAt, backendError };
      const alreadyApproved = approvedCaptains.some((captain) => captain.applicationId === applicationId);
      const nextCaptains = alreadyApproved ? approvedCaptains : [...approvedCaptains, captainFromApplication(approvedApplication, isArabic)];
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: pendingCaptainApplications.map((item) =>
            item.id === applicationId ? approvedApplication : item
          ),
          approvedCaptains: nextCaptains,
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم قبول الطلب محليًا مؤقتًا." : "Backend unavailable; application approved locally for now."
        }
      });
      return;
    }

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

  async function rejectCaptainApplication(applicationId) {
    const application = pendingCaptainApplications.find((item) => item.id === applicationId);
    const remoteReviewedAt = new Date().toISOString();
    try {
      const result = await captainApplicationsQuery.rejectApplication(applicationId);
      const rejectedApplication = result?.application || { ...application, id: applicationId, status: "rejected", reviewedAt: remoteReviewedAt };
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: pendingCaptainApplications.map((item) =>
            item.id === applicationId ? { ...item, ...rejectedApplication } : item
          ),
          backendLive: true,
          toast: isArabic ? "تم رفض الطلب عبر الـ Backend وبقي محفوظًا للمراجعة." : "Application rejected through the Backend and kept for review."
        }
      });
      return;
    } catch (error) {
      const backendError = error?.message || "Backend unavailable";
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: pendingCaptainApplications.map((item) =>
            item.id === applicationId ? { ...item, status: "rejected", reviewedAt: remoteReviewedAt, backendError } : item
          ),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم رفض الطلب محليًا مؤقتًا." : "Backend unavailable; application rejected locally for now."
        }
      });
      return;
    }

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

  async function closeSupportTicket(ticketId) {
    try {
      await adminData.closeSupportTicketRemote({ ticketId, status: "closed" });
      dispatch({
        type: "patch",
        patch: {
          supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "closed" } : ticket)),
          backendLive: true,
          toast: isArabic ? "تم إغلاق التذكرة عبر الـ Backend." : "Ticket closed through the Backend."
        }
      });
      return;
    } catch {
      dispatch({
        type: "patch",
        patch: {
          supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "closed" } : ticket)),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم إغلاق التذكرة محليًا." : "Backend unavailable; ticket closed locally."
        }
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "closed" } : ticket)),
        toast: isArabic ? "تم إغلاق التذكرة محليًا." : "Ticket closed locally."
      }
    });
  }

  async function updatePricingRule(ruleId, patch) {
    const currentRule = pricingRules.find((rule) => rule.id === ruleId || rule.cityId === ruleId);
    const cityId = currentRule?.cityId || ruleId;
    try {
      const result = await adminData.updatePricingRuleRemote({ cityId, patch });
      const updatedRule = result?.rule || { ...currentRule, ...patch, updatedAt: new Date().toISOString() };
      dispatch({
        type: "patch",
        patch: {
          pricingRules: pricingRules.map((rule) => (rule.cityId === cityId ? updatedRule : rule)),
          backendLive: true,
          toast: isArabic ? "تم تحديث السعر عبر الـ Backend." : "Pricing updated through the Backend."
        }
      });
      return;
    } catch {
      dispatch({
        type: "patch",
        patch: {
          pricingRules: pricingRules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch, updatedAt: new Date().toISOString() } : rule)),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم تحديث السعر محليًا." : "Backend unavailable; pricing updated locally."
        }
      });
      return;
    }

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
    adminCustomers,
    adminDrivers,
    adminRides,
    supportTickets,
    pricingRules,
    backendError,
    adminLoading,
    adminMutating,
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
          logout={logout}
          activeSection={ADMIN_SECTIONS.find((section) => section.key === activeSection)}
        />
        {adminLoading && (
          <p className="admin-loading">{isArabic ? "جاري تحميل بيانات الإدارة من الـ Backend..." : "Loading admin data from the Backend..."}</p>
        )}
        {backendError && (
          <p className="admin-error">
            {isArabic ? "تعذر الاتصال بالـ Backend، يتم استخدام البيانات المحلية مؤقتًا." : "Backend is unavailable, using local data for now."}
          </p>
        )}
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
