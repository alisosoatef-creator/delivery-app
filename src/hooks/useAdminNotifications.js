import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, subscribeToAdminEvents } from "../services/socketClient.js";

const ADMIN_NOTIFICATION_CATEGORIES = {
  applications: "applications",
  rides: "rides",
  payments: "payments",
  support: "support"
};

const SECTION_TO_NOTIFICATION_CATEGORY = {
  applications: ADMIN_NOTIFICATION_CATEGORIES.applications,
  rides: ADMIN_NOTIFICATION_CATEGORIES.rides,
  payments: ADMIN_NOTIFICATION_CATEGORIES.payments,
  support: ADMIN_NOTIFICATION_CATEGORIES.support
};

const EVENT_TO_NOTIFICATION_CATEGORY = {
  "admin:captain-application-created": ADMIN_NOTIFICATION_CATEGORIES.applications,
  "ride:created": ADMIN_NOTIFICATION_CATEGORIES.rides,
  "ride:accepted": ADMIN_NOTIFICATION_CATEGORIES.rides,
  "ride:status-updated": ADMIN_NOTIFICATION_CATEGORIES.rides,
  "ride:cancelled": ADMIN_NOTIFICATION_CATEGORIES.rides,
  "ride:completed": ADMIN_NOTIFICATION_CATEGORIES.rides,
  "payment:created": ADMIN_NOTIFICATION_CATEGORIES.payments,
  "payment:updated": ADMIN_NOTIFICATION_CATEGORIES.payments,
  "wallet:updated": ADMIN_NOTIFICATION_CATEGORIES.payments,
  "support:ticket-created": ADMIN_NOTIFICATION_CATEGORIES.support,
  "support:ticket-updated": ADMIN_NOTIFICATION_CATEGORIES.support
};

const ACTIVE_RIDE_STATUSES = new Set(["searching", "accepted", "driver_arriving", "arrived", "in_progress"]);
const REVIEW_PAYMENT_STATUSES = new Set(["pending", "failed"]);

function isPendingApplication(application) {
  return (application?.status || "pending") === "pending";
}

function isAttentionRide(ride) {
  return ACTIVE_RIDE_STATUSES.has(ride?.status || "searching");
}

function isOpenTicket(ticket) {
  return (ticket?.status || "open") === "open";
}

function isReviewPayment(payment) {
  return REVIEW_PAYMENT_STATUSES.has(payment?.status || "pending");
}

function invalidateAdminRealtimeQueries(queryClient, eventName) {
  queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

  if (eventName.startsWith("admin:captain-application")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "captainApplications"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
  }
  if (eventName.startsWith("ride:")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
    queryClient.invalidateQueries({ queryKey: ["driver", "availableRides"] });
  }
  if (eventName.startsWith("payment:") || eventName.startsWith("wallet:")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
  }
  if (eventName.startsWith("support:")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] });
  }
}

function buildNotificationItems({ counts, isArabic }) {
  const copy = {
    applications: {
      title: isArabic ? "طلبات كباتن جديدة" : "New captain applications",
      description: isArabic ? "طلبات قيد المراجعة وتحتاج قرارًا." : "Pending applications need review.",
      section: "applications",
      tone: "warning"
    },
    rides: {
      title: isArabic ? "رحلات تحتاج متابعة" : "Rides need attention",
      description: isArabic ? "رحلات نشطة أو في مرحلة البحث." : "Active or searching rides.",
      section: "rides",
      tone: "info"
    },
    payments: {
      title: isArabic ? "مدفوعات تحتاج مراجعة" : "Payments need review",
      description: isArabic ? "مدفوعات معلقة أو فشلت في بيئة التطوير." : "Pending or failed development payments.",
      section: "payments",
      tone: "danger"
    },
    support: {
      title: isArabic ? "تذاكر دعم مفتوحة" : "Open support tickets",
      description: isArabic ? "طلبات دعم تنتظر متابعة الإدارة." : "Support tickets waiting for admin follow-up.",
      section: "support",
      tone: "success"
    }
  };

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({
      id: `admin-notification-${category}`,
      category,
      count,
      ...copy[category]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function useAdminNotifications({
  enabled = true,
  activeSection = "dashboard",
  pendingCaptainApplications = [],
  adminRides = [],
  adminPayments = [],
  supportTickets = [],
  isArabic = true
} = {}) {
  const queryClient = useQueryClient();
  const [readBaselines, setReadBaselines] = useState({});
  const [eventIncrements, setEventIncrements] = useState({});
  const [socketStatus, setSocketStatus] = useState("idle");

  const baseCounts = useMemo(
    () => ({
      applications: pendingCaptainApplications.filter(isPendingApplication).length,
      rides: adminRides.filter(isAttentionRide).length,
      payments: adminPayments.filter(isReviewPayment).length,
      support: supportTickets.filter(isOpenTicket).length
    }),
    [adminPayments, adminRides, pendingCaptainApplications, supportTickets]
  );

  const counts = useMemo(() => {
    return Object.fromEntries(
      Object.entries(baseCounts).map(([category, count]) => {
        const total = count + (eventIncrements[category] || 0);
        return [category, Math.max(0, total - (readBaselines[category] || 0))];
      })
    );
  }, [baseCounts, eventIncrements, readBaselines]);

  const rawAttentionCounts = baseCounts;
  const items = useMemo(() => buildNotificationItems({ counts: rawAttentionCounts, isArabic }), [isArabic, rawAttentionCounts]);
  const unreadItems = useMemo(() => buildNotificationItems({ counts, isArabic }), [counts, isArabic]);

  useEffect(() => {
    const category = SECTION_TO_NOTIFICATION_CATEGORY[activeSection];
    if (!category) return;
    const nextBaseline = baseCounts[category] + (eventIncrements[category] || 0);
    setReadBaselines((current) => ({ ...current, [category]: nextBaseline }));
  }, [activeSection, baseCounts, eventIncrements]);

  useEffect(() => {
    if (!enabled) return undefined;
    connectSocket({
      isAdmin: true,
      onConnectionChange: (connected) => setSocketStatus(connected ? "connected" : "disconnected")
    });
    const unsubscribe = subscribeToAdminEvents((payload, eventName) => {
      const category = EVENT_TO_NOTIFICATION_CATEGORY[eventName];
      if (category) {
        setEventIncrements((current) => ({ ...current, [category]: (current[category] || 0) + 1 }));
      }
      invalidateAdminRealtimeQueries(queryClient, eventName);
    });
    return unsubscribe;
  }, [enabled, queryClient]);

  function markRead(category) {
    if (!category) return;
    setReadBaselines((current) => ({
      ...current,
      [category]: baseCounts[category] + (eventIncrements[category] || 0)
    }));
  }

  return {
    counts,
    rawAttentionCounts,
    items,
    unreadItems,
    socketStatus,
    markRead
  };
}
