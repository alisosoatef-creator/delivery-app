import { lazy, Suspense, useMemo, useState } from "react";
import { ErrorState, LoadingSkeleton, Toast } from "../../components/ui/index.js";
import { useAdminData } from "../../hooks/useAdminData.js";
import { useCaptainApplications } from "../../hooks/useCaptainApplications.js";
import { APP_ROUTE_PATHS } from "../../routes/index.js";
import { isAuthApiError, isNetworkApiError } from "../../services/apiClient.js";
import { AdminHeader } from "./AdminHeader.jsx";
import { AdminSidebar } from "./AdminSidebar.jsx";
import { mockCustomers, mockPaymentRecords, mockRideRecords } from "./adminMockData.js";

const AdminCustomers = lazy(() => import("./AdminCustomers.jsx").then((module) => ({ default: module.AdminCustomers })));
const AdminDashboard = lazy(() => import("./AdminDashboard.jsx").then((module) => ({ default: module.AdminDashboard })));
const AdminDriverApplications = lazy(() => import("./AdminDriverApplications.jsx").then((module) => ({ default: module.AdminDriverApplications })));
const AdminDrivers = lazy(() => import("./AdminDrivers.jsx").then((module) => ({ default: module.AdminDrivers })));
const AdminPayments = lazy(() => import("./AdminPayments.jsx").then((module) => ({ default: module.AdminPayments })));
const AdminPermissions = lazy(() => import("./AdminPermissions.jsx").then((module) => ({ default: module.AdminPermissions })));
const AdminPricing = lazy(() => import("./AdminPricing.jsx").then((module) => ({ default: module.AdminPricing })));
const AdminRides = lazy(() => import("./AdminRides.jsx").then((module) => ({ default: module.AdminRides })));
const AdminSettings = lazy(() => import("./AdminSettings.jsx").then((module) => ({ default: module.AdminSettings })));
const AdminSupport = lazy(() => import("./AdminSupport.jsx").then((module) => ({ default: module.AdminSupport })));

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

function AdminSectionFallback({ isArabic }) {
  return (
    <div className="admin-section-loading lazy-screen-fallback" role="status">
      <span />
      <strong>{isArabic ? "جاري تحميل قسم الإدارة..." : "Loading admin section..."}</strong>
      <LoadingSkeleton lines={3} />
    </div>
  );
}

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

function adminBackendErrorCopy(error, isArabic) {
  if (isAuthApiError(error)) {
    return {
      title: isArabic ? "صلاحية جلسة الأدمن غير صالحة" : "Admin session permission is invalid",
      description: isArabic
        ? "سجل دخول الأدمن من مدخل التطوير مرة أخرى حتى تُرسل صلاحيات admin أو owner مع الطلبات."
        : "Sign in through the admin development entry again so admin or owner permissions are sent with requests."
    };
  }
  if (isNetworkApiError(error)) {
    return {
      title: isArabic ? "تعذر الاتصال بالـ Backend" : "Backend unavailable",
      description: isArabic
        ? "يتم استخدام البيانات المحلية مؤقتًا لأن الطلب لم يصل إلى السيرفر. تأكد من تشغيل npm.cmd run api."
        : "Local data is being used because the request could not reach the server. Make sure npm.cmd run api is running."
    };
  }
  return {
    title: isArabic ? "تعذر تحميل بيانات الإدارة" : "Unable to load admin data",
    description: isArabic
      ? (error?.payload?.messageAr || "السيرفر متصل لكنه رفض الطلب أو أعاد خطأ تحقق. راجع Console للتفاصيل.")
      : (error?.payload?.message || error?.message || "The server is reachable but rejected the request or returned a validation error.")
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
  const adminEnabled = ["admin", "owner"].includes(state.role) && Boolean(state.session);
  const captainApplicationsQuery = useCaptainApplications({ enabled: adminEnabled });
  const adminData = useAdminData({ enabled: adminEnabled });
  const backendError = captainApplicationsQuery.backendError || adminData.backendError;
  const backendErrorCopy = backendError ? adminBackendErrorCopy(backendError, isArabic) : null;
  const canUseRemoteData = adminEnabled && !backendError;
  const pendingCaptainApplications = useMemo(
    () => mergeById(state.pendingCaptainApplications || [], captainApplicationsQuery.applications || []),
    [captainApplicationsQuery.applications, state.pendingCaptainApplications]
  );
  const approvedCaptains = state.approvedCaptains || [];
  const supportTickets = canUseRemoteData ? adminData.supportTickets : state.supportTickets || [];
  const pricingRules = canUseRemoteData ? adminData.pricingRules : state.pricingRules || [];
  const adminSettings = canUseRemoteData && adminData.settings ? adminData.settings : state.systemSettings;
  const adminCustomers = canUseRemoteData ? adminData.customers : mockCustomers;
  const fallbackDrivers = useMemo(
    () => [
      ...state.drivers.map((driver) => ({ ...driver, status: "active", availability: driver.online ? "online" : "offline" })),
      ...approvedCaptains
    ],
    [approvedCaptains, state.drivers]
  );
  const adminDrivers = canUseRemoteData ? adminData.drivers : fallbackDrivers;
  const adminRides = canUseRemoteData ? adminData.rides : null;
  const adminLoading = captainApplicationsQuery.isLoading || adminData.isLoading;
  const adminMutating = captainApplicationsQuery.isMutating || adminData.isMutating;

  const dashboardStats = useMemo(() => {
    if (adminData.dashboardStats) {
      return {
        customers: adminData.dashboardStats.customers ?? 0,
        captains: adminData.dashboardStats.captains ?? 0,
        pendingCaptainApplications: adminData.dashboardStats.pendingCaptainApplications ?? 0,
        todayRides: adminData.dashboardStats.todayRides ?? 0,
        activeRides: adminData.dashboardStats.activeRides ?? 0,
        estimatedRevenue: adminData.dashboardStats.estimatedRevenue ?? 0,
        openSupportTickets: adminData.dashboardStats.openSupportTickets ?? 0
      };
    }
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
  }, [adminData.dashboardStats, adminCustomers.length, adminDrivers.length, adminRides, pendingCaptainApplications, state.admin.activeRides, state.admin.todayRevenueIls, state.ride, supportTickets]);

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

  async function updateCustomerStatus(customerId, status) {
    try {
      const result = await adminData.updateCustomerStatusRemote({ customerId, status });
      dispatch({
        type: "patch",
        patch: {
          backendLive: true,
          toast: isArabic ? "تم تحديث حالة الزبون عبر Backend." : "Customer status updated through the Backend."
        }
      });
      return result;
    } catch {
      dispatch({
        type: "patch",
        patch: {
          backendLive: false,
          toast: isArabic ? "تعذر تحديث حالة الزبون عبر Backend." : "Backend unavailable; customer status was not updated."
        }
      });
      return null;
    }
  }

  async function updateDriverStatus(driverId, patch) {
    try {
      const result = await adminData.updateDriverStatusRemote({ driverId, patch });
      dispatch({
        type: "patch",
        patch: {
          approvedCaptains: approvedCaptains.map((driver) => (driver.id === driverId ? { ...driver, ...patch } : driver)),
          backendLive: true,
          toast: isArabic ? "تم تحديث حالة الكابتن عبر Backend." : "Captain status updated through the Backend."
        }
      });
      return result;
    } catch {
      dispatch({
        type: "patch",
        patch: {
          approvedCaptains: approvedCaptains.map((driver) => (driver.id === driverId ? { ...driver, ...patch } : driver)),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم تحديث الكابتن محليًا." : "Backend unavailable; captain status updated locally."
        }
      });
      return null;
    }
  }

  async function closeSupportTicket(ticketId, status = "closed") {
    try {
      await adminData.closeSupportTicketRemote({ ticketId, status });
      dispatch({
        type: "patch",
        patch: {
          supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
          backendLive: true,
          toast: isArabic ? "تم إغلاق التذكرة عبر الـ Backend." : "Ticket closed through the Backend."
        }
      });
      return;
    } catch {
      dispatch({
        type: "patch",
        patch: {
          supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم إغلاق التذكرة محليًا." : "Backend unavailable; ticket closed locally."
        }
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        supportTickets: supportTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
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
          pricingRules: pricingRules.map((rule) => (rule.id === ruleId || rule.cityId === cityId ? { ...rule, ...patch, updatedAt: new Date().toISOString() } : rule)),
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم تحديث السعر محليًا." : "Backend unavailable; pricing updated locally."
        }
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        pricingRules: pricingRules.map((rule) => (rule.id === ruleId || rule.cityId === cityId ? { ...rule, ...patch, updatedAt: new Date().toISOString() } : rule)),
        toast: isArabic ? "تم تحديث السعر محليًا." : "Pricing updated locally."
      }
    });
  }

  function updateSystemSettingsLocal(patch) {
    dispatch({
      type: "patch",
      patch: {
        systemSettings: { ...state.systemSettings, ...patch },
        toast: isArabic ? "تم تحديث إعدادات النظام محليًا." : "System settings updated locally."
      }
    });
  }

  async function updateSystemSettings(patch) {
    try {
      const result = await adminData.updateSystemSettingsRemote(patch);
      dispatch({
        type: "patch",
        patch: {
          systemSettings: result?.settings || { ...adminSettings, ...patch },
          backendLive: true,
          toast: isArabic ? "تم تحديث إعدادات النظام عبر Backend." : "System settings updated through the Backend."
        }
      });
      return result;
    } catch {
      updateSystemSettingsLocal(patch);
      dispatch({
        type: "patch",
        patch: {
          systemSettings: { ...adminSettings, ...patch },
          backendLive: false,
          toast: isArabic ? "تعذر الاتصال بالـ Backend، تم تحديث الإعدادات محليًا." : "Backend unavailable; settings updated locally."
        }
      });
      return null;
    }
  }

  async function cleanupRecords(payload) {
    try {
      const result = await adminData.cleanupRecordsRemote(payload);
      const counts = result?.deletedCounts || {};
      const totalDeleted = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
      dispatch({
        type: "patch",
        patch: {
          backendLive: true,
          toast: isArabic ? `تم تنظيف السجلات. عدد العناصر المحذوفة: ${totalDeleted}.` : `Records cleaned. Deleted items: ${totalDeleted}.`
        }
      });
      return result;
    } catch (error) {
      dispatch({
        type: "patch",
        patch: {
          backendLive: false,
          toast: isArabic
            ? (error?.payload?.messageAr || "تعذر تنظيف السجلات عبر Backend.")
            : (error?.payload?.message || error?.message || "Unable to clean records through Backend.")
        }
      });
      throw error;
    }
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
    adminSettings,
    supportTickets,
    pricingRules,
    backendError,
    adminLoading,
    adminMutating,
    cityName,
    approveCaptainApplication,
    rejectCaptainApplication,
    updateCustomerStatus,
    updateDriverStatus,
    closeSupportTicket,
    updatePricingRule,
    updateSystemSettings,
    cleanupRecords,
    cleanupResult: adminData.cleanupResult,
    cleanupError: adminData.cleanupError,
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
          <ErrorState
            className="admin-error compact-error-state"
            title={backendErrorCopy.title}
            description={backendErrorCopy.description}
          />
        )}
        <Suspense fallback={<AdminSectionFallback isArabic={isArabic} />}>
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
        </Suspense>
      </section>
      <Toast message={state.toast} />
    </main>
  );
}
