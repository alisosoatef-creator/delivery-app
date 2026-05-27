export const ADMIN_RIDE_STATUSES = [
  "all",
  "searching",
  "accepted",
  "driver_arriving",
  "arrived",
  "in_progress",
  "completed",
  "cancelled"
];

export const ADMIN_SUPPORT_ROLES = ["all", "customer", "driver"];
export const ADMIN_TEAM_ROLES = ["owner", "admin", "support"];

export function textFor(isArabic, ar, en) {
  return isArabic ? ar : en;
}

export function formatDate(value, isArabic, options = {}) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: options.dateOnly ? undefined : "2-digit",
    minute: options.dateOnly ? undefined : "2-digit"
  }).format(date);
}

export function formatMoney(value, currency = "₪") {
  const amount = Number(value || 0);
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)} ${currency}`;
}

export function formatDistance(value) {
  if (value === undefined || value === null || value === "") return "-";
  const distance = Number(value);
  if (Number.isNaN(distance)) return `${value} km`;
  return `${distance.toFixed(distance >= 10 ? 1 : 2)} km`;
}

export function statusLabel(status, isArabic) {
  if (!isArabic) return status || "-";
  return {
    all: "الكل",
    active: "نشط",
    inactive: "معطل",
    suspended: "موقوف",
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    searching: "جاري البحث",
    accepted: "مقبولة",
    driver_arriving: "الكابتن بالطريق",
    arrived: "وصل الكابتن",
    in_progress: "قيد التنفيذ",
    completed: "مكتملة",
    cancelled: "ملغاة",
    open: "مفتوحة",
    closed: "مغلقة",
    paid: "مدفوعة",
    failed: "فشلت",
    refunded: "مسترجعة",
    wallet: "محفظة",
    cash: "كاش",
    visa: "VISA تجريبي",
    customer: "زبون",
    driver: "كابتن",
    owner: "Owner",
    admin: "Admin",
    support: "Support",
    online: "متاح",
    offline: "غير متاح"
  }[status] || status || "-";
}

export function paymentMethodLabel(method, isArabic) {
  const normalized = method || "cash";
  if (!isArabic) {
    return normalized === "visa" || normalized === "visa-placeholder"
      ? "VISA placeholder"
      : normalized === "wallet"
        ? "Wallet"
        : "Cash";
  }
  if (normalized === "visa" || normalized === "visa-placeholder") return "بطاقة تجريبية";
  if (normalized === "wallet") return "المحفظة";
  return "نقدًا";
}

export function adminStatusTone(status) {
  if (["active", "approved", "completed", "paid", "closed", "online"].includes(status)) return "success";
  if (["cancelled", "rejected", "suspended", "failed"].includes(status)) return "danger";
  if (["driver_arriving", "arrived", "in_progress", "accepted", "open", "pending", "searching"].includes(status)) return "warning";
  return "neutral";
}

export function normalizeCustomer(customer = {}) {
  return {
    ...customer,
    id: customer.id,
    name: customer.name || customer.fullName || "-",
    phone: customer.phone || "-",
    city: customer.city || customer.cityLabel || customer.cityId || "-",
    age: customer.age ?? "-",
    trips: customer.trips ?? customer.ridesCount ?? customer.rideCount ?? 0,
    status: customer.status || "active",
    isVerified: Boolean(customer.verified || customer.isVerified),
    createdAt: customer.createdAt || ""
  };
}

export function normalizeDriver(driver = {}, cityLabel = "-") {
  const status = driver.status || "active";
  const onlineStatus = status === "active" && (driver.onlineStatus || driver.availability || (driver.online ? "online" : "offline")) === "online"
    ? "online"
    : "offline";
  return {
    ...driver,
    id: driver.id,
    name: driver.nameAr || driver.nameEn || driver.fullName || driver.name || "-",
    phone: driver.phone || "-",
    city: driver.cityLabel || cityLabel || driver.city || driver.cityId || "-",
    vehicle: driver.vehicle || driver.vehicleType || "-",
    plate: driver.plate || driver.vehiclePlate || "-",
    status,
    onlineStatus,
    rating: driver.ratingAverage ?? driver.rating ?? "-",
    ratingAverage: driver.ratingAverage ?? driver.rating ?? "-",
    ratingCount: driver.ratingCount ?? 0,
    ridesCount: driver.ridesCount ?? driver.trips ?? 0,
    earnings: driver.earningsIls ?? driver.earnings ?? 0,
    createdAt: driver.createdAt || driver.approvedAt || ""
  };
}

export function normalizeRide(ride = {}) {
  const rideRating = ride.rating || ride.rideRating || null;
  const ratingValue = rideRating?.rating || rideRating?.value || ride.ratingValue || "";
  return {
    ...ride,
    id: ride.id,
    customer: ride.customer || ride.customerName || "Customer",
    customerPhone: ride.customerPhone || "",
    captain: ride.driver?.fullName || ride.driverName || ride.captain || ride.driverId || "",
    driverId: ride.driverId || ride.driver?.id || "",
    pickup: ride.pickup || "-",
    dropoff: ride.dropoff || ride.destination || "-",
    city: ride.city || ride.cityId || "-",
    distanceKm: ride.routeDistanceKm ?? ride.distanceKm ?? "",
    durationMinutes: ride.durationMinutes ?? ride.etaMinutes ?? "",
    fareIls: ride.fareIls ?? ride.price ?? 0,
    paymentMethod: ride.paymentMethod || "cash",
    paymentStatus: ride.paymentStatus || ride.payment?.status || "",
    status: ride.status || "searching",
    rating: rideRating,
    ratingValue,
    review: rideRating?.comment || rideRating?.review || ride.review || "",
    ratedAt: rideRating?.ratedAt || ride.ratedAt || "",
    createdAt: ride.createdAt || ride.time || "",
    acceptedAt: ride.acceptedAt || "",
    cancelledAt: ride.cancelledAt || "",
    completedAt: ride.completedAt || ride.updatedAt || ""
  };
}

export function normalizeApplication(application = {}) {
  return {
    ...application,
    id: application.id,
    fullName: application.fullName || "-",
    phone: application.phone || "-",
    city: application.cityLabel || application.city || "-",
    age: application.age ?? "-",
    vehicleType: application.vehicleType || "-",
    vehiclePlate: application.vehiclePlate || "-",
    experienceYears: application.experienceYears || "-",
    notes: application.notes || "-",
    status: application.status || "pending",
    createdAt: application.createdAt || "",
    reviewedAt: application.reviewedAt || ""
  };
}

export function normalizeTicket(ticket = {}) {
  return {
    ...ticket,
    id: ticket.id,
    name: ticket.userName || ticket.name || "-",
    phone: ticket.phone || "-",
    role: ticket.role || "customer",
    city: ticket.city || ticket.cityLabel || ticket.cityId || "",
    type: ticket.type || "-",
    message: ticket.message || "-",
    status: ticket.status || "open",
    rideId: ticket.rideId || "",
    createdAt: ticket.createdAt || "",
    updatedAt: ticket.updatedAt || ticket.closedAt || ""
  };
}

export function normalizePayment(payment = {}) {
  return {
    ...payment,
    id: payment.id,
    rideId: payment.rideId || payment.id,
    customerName: payment.customerName || payment.customerPhone || "-",
    driverName: payment.driverName || payment.driverId || "-",
    method: payment.method || "cash",
    provider: payment.provider || (payment.method === "visa" ? "visa-placeholder" : "cash/manual"),
    amount: payment.amountIls ?? payment.amount ?? 0,
    status: payment.status || "pending",
    createdAt: payment.createdAt || ""
  };
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export function exportRowsToCsv(filename, rows, columns) {
  const header = columns.map((column) => csvEscape(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => {
      const value = typeof column.value === "function" ? column.value(row) : row[column.key];
      return csvEscape(value);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
