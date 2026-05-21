import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import {
  adminOverview,
  acceptRide,
  createDriverFromApplication,
  createRidePayment,
  createOrUpdateCustomerUser,
  createOtpCode,
  databaseInfo,
  adminPaymentsOverview,
  cleanupAdminRecords,
  deleteSavedPaymentMethod,
  driverEarnings,
  ensurePaymentForRide,
  findOtpCode,
  findOtpCodeByPhone,
  getCustomerWallet,
  getDriver,
  getRide,
  findUserByPhone,
  findUserByIdentifier,
  getDriverByPhone,
  getCity,
  getPricingRule,
  getSystemSettings,
  insertCaptainApplication,
  insertRide,
  insertSupportTicket,
  listCaptainApplications,
  listAvailableRides,
  listCities,
  listCustomerRides,
  listCustomers,
  listDriverRides,
  listDriverRequests,
  listDrivers,
  listMySupportTickets,
  listPayments,
  listPricingRules,
  listRides,
  listSavedPaymentMethods,
  listSupportTickets,
  listWalletTransactions,
  markOtpUsed,
  publicUser,
  createSavedPaymentMethod,
  updateCaptainApplicationStatus,
  updateCustomerStatus,
  updateDriverLocation,
  updateDriverRideStatus,
  updateDriverStatus,
  updatePaymentStatus,
  updatePricingRule,
  updateRideStatus,
  updateSystemSettings,
  updateSupportTicketStatus,
  verifyUserByPhone
} from "./db/database.mjs";
import { searchLocalPlaces } from "./places.mjs";
import { hashPassword, verifyPassword } from "./auth/passwords.mjs";
import { backendConfig } from "./config.mjs";
import { emitDriverEvent, emitPaymentEvent, emitRideEvent, emitSupportTicketEvent, realtimeInfo, setupRealtime } from "./realtime.mjs";
import { checkRateLimit, requireAdminDev, requireAuthDev, requireCustomerDev, requireDriverDev, securityHeaders } from "./security.mjs";
import {
  ACCOUNT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  RIDE_STATUSES,
  SUPPORT_STATUSES,
  hasOnlyAllowedRole,
  isAllowedStatus,
  isFiniteNumber,
  isPhoneLike,
  isReasonableAge,
  requiredFields
} from "./validation.mjs";

const port = backendConfig.port;
const host = backendConfig.host;
const authConfig = { demoOtpCode: backendConfig.demoOtpCode };
const sseClients = new Set();
const CLEANUP_TYPES = new Set(["completedRides", "cancelledRides", "closedSupportTickets", "demoPayments", "allDemoData"]);

// approvedCaptains now live in the persistent drivers table after application approval.

function sendJson(response, status, payload, request = null) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...securityHeaders(request)
  });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function calculateQuote({ cityId = "nablus", distanceKm = 5.8, routeDistanceKm = null }) {
  const city = getCity(cityId) || getCity("nablus");
  const numericDistance = Number(routeDistanceKm || distanceKm) || 5.8;
  const rule = getPricingRule(city.id);
  const baseFare = rule?.baseFare ?? city.baseFare;
  const perKm = rule?.pricePerKm ?? 2.35;
  const minimumFare = rule?.minimumFare ?? 15;
  const surge = city.demand > 85 ? 1.16 : city.demand > 70 ? 1.08 : 1;
  const fareIls = Math.max(minimumFare, Math.round((baseFare + numericDistance * perKm) * surge));
  const etaMinutes = Math.max(4, Math.round(numericDistance * 1.1 + 3));
  return { cityId: city.id, distanceKm: numericDistance, etaMinutes, fareIls, currency: "ILS" };
}

function broadcast(event, payload) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) client.write(frame);
}

function rideRealtimeEventName(ride) {
  if (ride?.status === "cancelled" || ride?.status === "canceled") return "ride:cancelled";
  if (ride?.status === "completed") return "ride:completed";
  return "ride:status-updated";
}

function emitPaymentSideEffects(paymentResult) {
  const payment = paymentResult?.payment;
  const walletTransaction = paymentResult?.walletTransaction;
  if (!payment) return;
  emitPaymentEvent("payment:created", { payment, walletTransaction });
  if (walletTransaction) emitPaymentEvent("wallet:updated", { payment, walletTransaction });
}

function isAdminPath(pathname) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

function isDriverPath(pathname) {
  return pathname === "/api/driver" || pathname.startsWith("/api/driver/") || pathname === "/api/drivers/status";
}

function isCustomerPath(pathname) {
  return pathname === "/api/customer" || pathname.startsWith("/api/customer/");
}

function rejectUnauthorized(response, request, scope) {
  sendJson(response, 401, {
    error: "unauthorized",
    scope,
    mode: process.env.NODE_ENV === "production" ? "enforced" : "soft-dev",
    message: `${scope} session permission is invalid.`,
    messageAr: "صلاحية الجلسة غير صالحة أو لا تناسب هذا الطلب."
  }, request);
}

function rejectRateLimited(response, request) {
  sendJson(response, 429, { error: "rate_limited" }, request);
}

function requestHeader(request, name) {
  return String(request?.headers?.[name.toLowerCase()] || "").trim();
}

function requestDriverId(request, body = {}) {
  return String(body.driverId || requestHeader(request, "x-dev-driver-id") || "").trim();
}

function requestDriverPhone(request, body = {}) {
  return String(body.phone || requestHeader(request, "x-dev-phone") || "").trim();
}

function rideStatusMessage(status) {
  const labels = {
    searching: "searching",
    accepted: "accepted",
    driver_arriving: "driver_arriving",
    arrived: "arrived",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
    canceled: "cancelled"
  };
  return labels[status] || status || "unknown";
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true }, request);
    return;
  }

  if (isAdminPath(url.pathname) && !requireAdminDev(request)) {
    rejectUnauthorized(response, request, "admin");
    return;
  }

  if (isDriverPath(url.pathname) && !url.pathname.includes("/dev-login") && !url.pathname.includes("/dev-drivers") && !requireDriverDev(request)) {
    rejectUnauthorized(response, request, "driver");
    return;
  }

  if (isCustomerPath(url.pathname) && !requireCustomerDev(request)) {
    rejectUnauthorized(response, request, "customer");
    return;
  }

  if (url.pathname === "/api/support/my-tickets" && !requireAuthDev(request)) {
    rejectUnauthorized(response, request, "support");
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      service: "wasel-api",
      time: new Date().toISOString(),
      database: databaseInfo(),
      realtime: realtimeInfo()
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(response, 200, {
      cities: listCities(),
      drivers: listDrivers(),
      pricingRules: listPricingRules(),
      settings: getSystemSettings(),
      admin: adminOverview()
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/places/search") {
    sendJson(response, 200, {
      places: searchLocalPlaces({
        city: url.searchParams.get("city") || "",
        q: url.searchParams.get("q") || ""
      })
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
      ...securityHeaders(request, { "Cache-Control": "no-cache" })
    });
    response.write("event: connected\ndata: {\"ok\":true,\"events\":[]}\n\n");
    sseClients.add(response);
    request.on("close", () => sseClients.delete(response));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/request-otp") {
    if (!checkRateLimit(request, "auth:request-otp", { limit: 12, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    if (!isPhoneLike(body.phone)) {
      sendJson(response, 400, { error: "invalid_phone" });
      return;
    }
    const requestId = createOtpCode({ phone: body.phone, purpose: body.role || "customer", code: authConfig.demoOtpCode });
    sendJson(response, 200, { requestId, expiresInSeconds: 120, demoCode: authConfig.demoOtpCode });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    if (!checkRateLimit(request, "auth:register", { limit: 8, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    if (requiredFields(body, ["fullName", "phone", "age", "birthDate", "password"]).length || (!body.city && !body.cityId)) {
      sendJson(response, 400, { error: "missing_required_fields" });
      return;
    }

    if (!isPhoneLike(body.phone) || !isReasonableAge(Number(body.age)) || !hasOnlyAllowedRole(body.role || "customer")) {
      sendJson(response, 400, { error: "invalid_auth_payload" });
      return;
    }

    if (findUserByPhone(body.phone)) {
      sendJson(response, 409, { error: "phone_already_registered" });
      return;
    }

    const user = createOrUpdateCustomerUser({ ...body, passwordHash: hashPassword(body.password) });
    const requestId = createOtpCode({ phone: user.phone, purpose: "register", code: authConfig.demoOtpCode });
    sendJson(response, 201, {
      user: publicUser(user),
      requestId,
      otpRequired: true,
      message: "otp_required",
      demoCode: authConfig.demoOtpCode
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-otp") {
    if (!checkRateLimit(request, "auth:verify-otp", { limit: 15, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    if (!body.requestId && !isPhoneLike(body.phone)) {
      sendJson(response, 400, { error: "invalid_phone" });
      return;
    }
    const otp = body.requestId ? findOtpCode(body.requestId) : findOtpCodeByPhone({ phone: body.phone, code: body.code });
    if (body.code !== authConfig.demoOtpCode || (otp && otp.code !== body.code) || (!otp && !body.phone)) {
      sendJson(response, 401, { error: "invalid_otp" });
      return;
    }

    const phone = otp?.phone || body.phone;
    if (otp?.id) markOtpUsed(otp.id);
    const user = phone ? verifyUserByPhone(phone) : null;

    sendJson(response, 200, {
      token: `demo_${randomUUID()}`,
      user: publicUser(user) || {
        id: `usr_${randomUUID()}`,
        phone,
        role: otp?.purpose || "customer",
        verified: true,
        isVerified: true
      }
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    if (!checkRateLimit(request, "auth:login", { limit: 15, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    const user = findUserByIdentifier(body.identifier || body.phone || body.fullName);
    if (!user || !Number(user.isVerified) || user.status !== "active" || !verifyPassword(body.password, user.passwordHash)) {
      sendJson(response, 401, { error: "invalid_login" });
      return;
    }
    sendJson(response, 200, { token: `dev-session-token-${randomUUID()}`, user: publicUser(user) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    sendJson(response, 200, { ok: true, placeholder: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/captain-applications") {
    if (!checkRateLimit(request, "captain-application:create", { limit: 10, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    if (!body.fullName || !body.phone || !body.city || !body.age || !body.vehicleType) {
      sendJson(response, 400, { error: "missing_required_fields" });
      return;
    }
    if (!isPhoneLike(body.phone) || !isReasonableAge(Number(body.age))) {
      sendJson(response, 400, { error: "invalid_captain_application" });
      return;
    }
    const application = insertCaptainApplication(body);
    emitDriverEvent("admin:captain-application-created", { application });
    sendJson(response, 201, { application });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/captain-applications") {
    sendJson(response, 200, { applications: listCaptainApplications() });
    return;
  }

  const captainApplicationApproveMatch = url.pathname.match(/^\/api\/admin\/captain-applications\/([^/]+)\/approve$/);
  if (request.method === "PATCH" && captainApplicationApproveMatch) {
    const application = updateCaptainApplicationStatus(captainApplicationApproveMatch[1], "approved");
    if (!application) {
      sendJson(response, 404, { error: "captain_application_not_found" });
      return;
    }
    const captain = createDriverFromApplication(application);
    emitDriverEvent("admin:captain-application-reviewed", { application, captain });
    sendJson(response, 200, { application, captain });
    return;
  }

  const captainApplicationRejectMatch = url.pathname.match(/^\/api\/admin\/captain-applications\/([^/]+)\/reject$/);
  if (request.method === "PATCH" && captainApplicationRejectMatch) {
    const application = updateCaptainApplicationStatus(captainApplicationRejectMatch[1], "rejected");
    if (!application) {
      sendJson(response, 404, { error: "captain_application_not_found" });
      return;
    }
    emitDriverEvent("admin:captain-application-reviewed", { application });
    sendJson(response, 200, { application });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/customers") {
    sendJson(response, 200, { customers: listCustomers() });
    return;
  }

  const customerStatusMatch = url.pathname.match(/^\/api\/admin\/customers\/([^/]+)\/status$/);
  if (request.method === "PATCH" && customerStatusMatch) {
    const body = await readJson(request);
    if (!isAllowedStatus(body.status || "active", ACCOUNT_STATUSES)) {
      sendJson(response, 400, { error: "invalid_account_status" });
      return;
    }
    const customer = updateCustomerStatus(customerStatusMatch[1], body.status || "active");
    if (!customer) {
      sendJson(response, 404, { error: "customer_not_found" });
      return;
    }
    sendJson(response, 200, { customer });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/drivers") {
    sendJson(response, 200, { drivers: listDrivers() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/dev-drivers") {
    sendJson(response, 200, { drivers: listDrivers().filter((driver) => driver.status === "active") });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/driver/dev-login") {
    // TODO phase-14: replace this development-only driver entry with real driver auth.
    const body = await readJson(request);
    const driver = body.driverId
      ? listDrivers().find((item) => item.id === body.driverId)
      : getDriverByPhone(body.phone || "");
    if (!driver || driver.status !== "active") {
      sendJson(response, 401, { error: "driver_not_active_or_approved" });
      return;
    }
    sendJson(response, 200, {
      token: `dev-driver-session-token-${randomUUID()}`,
      user: {
        id: `driver_user_${driver.id}`,
        fullName: driver.fullName,
        name: driver.fullName,
        phone: driver.phone,
        city: driver.cityId,
        role: "driver",
        status: driver.status,
        driverId: driver.id
      },
      driver
    });
    return;
  }

  const driverStatusMatch = url.pathname.match(/^\/api\/admin\/drivers\/([^/]+)\/status$/);
  if (request.method === "PATCH" && driverStatusMatch) {
    const body = await readJson(request);
    if (body.status && !isAllowedStatus(body.status, ACCOUNT_STATUSES)) {
      sendJson(response, 400, { error: "invalid_driver_status" });
      return;
    }
    const driver = updateDriverStatus(driverStatusMatch[1], body);
    if (!driver) {
      sendJson(response, 404, { error: "driver_not_found" });
      return;
    }
    sendJson(response, 200, { driver });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rides/quote") {
    const body = await readJson(request);
    if ((body.distanceKm !== undefined && !isFiniteNumber(body.distanceKm, { min: 0, max: 500 })) ||
      (body.routeDistanceKm !== undefined && body.routeDistanceKm !== null && !isFiniteNumber(body.routeDistanceKm, { min: 0, max: 500 }))) {
      sendJson(response, 400, { error: "invalid_distance" });
      return;
    }
    sendJson(response, 200, { quoteId: `quote_${randomUUID()}`, ...calculateQuote(body) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/rides") {
    sendJson(response, 200, { rides: listRides() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/available-rides") {
    const headerDriver = getDriver(requestHeader(request, "x-dev-driver-id"));
    sendJson(response, 200, {
      rides: listAvailableRides({ cityId: url.searchParams.get("cityId") || headerDriver?.cityId || "" })
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/my-rides") {
    sendJson(response, 200, {
      rides: listDriverRides({
        driverId: url.searchParams.get("driverId") || requestHeader(request, "x-dev-driver-id") || "",
        phone: url.searchParams.get("phone") || requestHeader(request, "x-dev-phone") || ""
      })
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/customer/rides") {
    const rides = listCustomerRides({
      customerId: url.searchParams.get("customerId") || "",
      customerPhone: url.searchParams.get("phone") || url.searchParams.get("customerPhone") || ""
    });
    sendJson(response, 200, { rides });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/customer/wallet") {
    const wallet = getCustomerWallet({
      userId: url.searchParams.get("userId") || url.searchParams.get("customerId") || "",
      phone: url.searchParams.get("phone") || url.searchParams.get("customerPhone") || ""
    });
    sendJson(response, 200, { wallet });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/customer/payments") {
    const customerId = url.searchParams.get("userId") || url.searchParams.get("customerId") || "";
    const customerPhone = url.searchParams.get("phone") || url.searchParams.get("customerPhone") || "";
    sendJson(response, 200, { payments: customerId || customerPhone ? listPayments({ customerId, customerPhone }) : [] });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/customer/payment-methods") {
    sendJson(response, 200, {
      methods: listSavedPaymentMethods({
        userId: url.searchParams.get("userId") || url.searchParams.get("customerId") || "",
        phone: url.searchParams.get("phone") || url.searchParams.get("customerPhone") || ""
      })
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/customer/payment-methods") {
    const body = await readJson(request);
    if (body.type && body.type !== "visa") {
      sendJson(response, 400, { error: "invalid_payment_method_type" });
      return;
    }
    const method = createSavedPaymentMethod(body);
    if (!method) {
      sendJson(response, 400, { error: "invalid_payment_method" });
      return;
    }
    sendJson(response, 201, { method });
    return;
  }

  const paymentMethodDeleteMatch = url.pathname.match(/^\/api\/customer\/payment-methods\/([^/]+)$/);
  if (request.method === "DELETE" && paymentMethodDeleteMatch) {
    const deleted = deleteSavedPaymentMethod(paymentMethodDeleteMatch[1], {
      userId: url.searchParams.get("userId") || url.searchParams.get("customerId") || "",
      phone: url.searchParams.get("phone") || url.searchParams.get("customerPhone") || ""
    });
    if (!deleted) {
      sendJson(response, 404, { error: "payment_method_not_found" });
      return;
    }
    sendJson(response, 200, { ok: true });
    return;
  }

  const customerRideDetailsMatch = url.pathname.match(/^\/api\/customer\/rides\/([^/]+)$/);
  if (request.method === "GET" && customerRideDetailsMatch) {
    const ride = getRide(customerRideDetailsMatch[1]);
    const customerId = url.searchParams.get("customerId") || "";
    const customerPhone = url.searchParams.get("phone") || url.searchParams.get("customerPhone") || "";
    const belongsToCustomer =
      (!customerId && !customerPhone) ||
      (customerId && ride?.customerId === customerId) ||
      (customerPhone && ride?.customerPhone === customerPhone);
    if (!ride || !belongsToCustomer) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    sendJson(response, 200, { ride });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rides") {
    const body = await readJson(request);
    if ((!body.pickup && !body.pickupLabel) || (!body.destination && !body.dropoff && !body.destinationLabel)) {
      sendJson(response, 400, { error: "pickup_and_destination_required" });
      return;
    }
    if (body.customerPhone && !isPhoneLike(body.customerPhone)) {
      sendJson(response, 400, { error: "invalid_customer_phone" });
      return;
    }
    if (body.paymentMethod && !PAYMENT_METHODS.has(body.paymentMethod)) {
      sendJson(response, 400, { error: "invalid_payment_method" });
      return;
    }
    const quote = calculateQuote(body);
    const ride = insertRide(body, quote);
    broadcast("ride.created", { ride });
    emitRideEvent("ride:created", { ride });
    sendJson(response, 201, { ride });
    return;
  }

  const rideStatusMatch = url.pathname.match(/^\/api\/rides\/([^/]+)\/status$/);
  if ((request.method === "POST" || request.method === "PATCH") && rideStatusMatch) {
    const body = await readJson(request);
    if (!isAllowedStatus(body.status, RIDE_STATUSES)) {
      sendJson(response, 400, { error: "invalid_ride_status" });
      return;
    }
    const ride = updateRideStatus(rideStatusMatch[1], body.status);
    if (!ride) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    broadcast("ride.status.changed", { ride });
    emitRideEvent(rideRealtimeEventName(ride), { ride });
    if (ride.status === "completed") {
      emitPaymentSideEffects(ensurePaymentForRide(ride, { forcePaid: true }));
    }
    sendJson(response, 200, { ride });
    return;
  }

  const ridePayMatch = url.pathname.match(/^\/api\/rides\/([^/]+)\/pay$/);
  if (request.method === "POST" && ridePayMatch) {
    const body = await readJson(request);
    if (body.method && !PAYMENT_METHODS.has(body.method)) {
      sendJson(response, 400, { error: "invalid_payment_method" });
      return;
    }
    const paymentResult = createRidePayment(ridePayMatch[1], body);
    if (!paymentResult.payment) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    emitPaymentSideEffects(paymentResult);
    sendJson(response, 200, { payment: paymentResult.payment, walletTransaction: paymentResult.walletTransaction });
    return;
  }

  const rideAcceptMatch = url.pathname.match(/^\/api\/rides\/([^/]+)\/accept$/);
  if (request.method === "PATCH" && rideAcceptMatch) {
    const body = await readJson(request);
    const driverId = requestDriverId(request, body);
    if (!driverId) {
      sendJson(response, 400, {
        error: "driver_id_required",
        message: "driverId is required to accept a ride.",
        messageAr: "معرّف الكابتن مطلوب لقبول الرحلة."
      });
      return;
    }
    const currentRide = getRide(rideAcceptMatch[1]);
    const driver = getDriver(driverId);
    if (!currentRide) {
      sendJson(response, 404, {
        error: "ride_not_found",
        message: "Ride was not found.",
        messageAr: "لم يتم العثور على الرحلة."
      });
      return;
    }
    if (!driver) {
      sendJson(response, 404, {
        error: "driver_not_found",
        message: "Captain was not found.",
        messageAr: "لم يتم العثور على الكابتن."
      });
      return;
    }
    if (driver.status !== "active") {
      sendJson(response, 403, {
        error: "driver_not_active",
        message: "Captain is not active.",
        messageAr: "الكابتن غير نشط حاليًا."
      });
      return;
    }
    if (currentRide.driverId) {
      sendJson(response, 409, {
        error: "ride_already_accepted",
        message: "Ride is already accepted by another captain.",
        messageAr: "تم قبول هذه الرحلة مسبقًا من كابتن آخر.",
        driverId: currentRide.driverId,
        currentStatus: rideStatusMessage(currentRide.status)
      });
      return;
    }
    if (currentRide.status !== "searching") {
      sendJson(response, 409, {
        error: "ride_not_searching",
        message: `Ride cannot be accepted because it is ${rideStatusMessage(currentRide.status)}.`,
        messageAr: `لا يمكن قبول الرحلة لأنها بحالة ${rideStatusMessage(currentRide.status)}.`,
        currentStatus: rideStatusMessage(currentRide.status)
      });
      return;
    }
    const ride = acceptRide(rideAcceptMatch[1], driverId);
    if (!ride) {
      sendJson(response, 409, {
        error: "ride_accept_failed",
        message: "Ride could not be accepted after validation.",
        messageAr: "تعذر قبول الرحلة بعد التحقق."
      });
      return;
    }
    broadcast("ride.status.changed", { ride });
    emitRideEvent("ride:accepted", { ride });
    sendJson(response, 200, { ride });
    return;
  }

  const driverRideStatusMatch = url.pathname.match(/^\/api\/driver\/rides\/([^/]+)\/status$/);
  if (request.method === "PATCH" && driverRideStatusMatch) {
    const body = await readJson(request);
    const driverId = requestDriverId(request, body);
    if (!driverId) {
      sendJson(response, 400, {
        error: "driver_id_required",
        message: "driverId is required to update a ride.",
        messageAr: "معرّف الكابتن مطلوب لتحديث الرحلة."
      });
      return;
    }
    if (!isAllowedStatus(body.status, RIDE_STATUSES)) {
      sendJson(response, 400, {
        error: "invalid_ride_status",
        message: "Requested ride status is not supported.",
        messageAr: "حالة الرحلة المطلوبة غير مدعومة."
      });
      return;
    }
    const currentRide = getRide(driverRideStatusMatch[1]);
    const driver = getDriver(driverId);
    if (!currentRide) {
      sendJson(response, 404, {
        error: "ride_not_found",
        message: "Ride was not found.",
        messageAr: "لم يتم العثور على الرحلة."
      });
      return;
    }
    if (!driver) {
      sendJson(response, 404, {
        error: "driver_not_found",
        message: "Captain was not found.",
        messageAr: "لم يتم العثور على الكابتن."
      });
      return;
    }
    if (driver.status !== "active") {
      sendJson(response, 403, {
        error: "driver_not_active",
        message: "Captain is not active.",
        messageAr: "الكابتن غير نشط حاليًا."
      });
      return;
    }
    if (currentRide.driverId && currentRide.driverId !== driver.id) {
      sendJson(response, 409, {
        error: "driver_ride_mismatch",
        message: "This ride belongs to a different captain.",
        messageAr: "هذه الرحلة مرتبطة بكابتن آخر.",
        driverId: currentRide.driverId
      });
      return;
    }
    if (!currentRide.driverId && currentRide.status !== "searching") {
      sendJson(response, 409, {
        error: "ride_has_no_driver",
        message: "Ride has no assigned captain for this status update.",
        messageAr: "لا يوجد كابتن مرتبط بهذه الرحلة لتحديث حالتها.",
        currentStatus: rideStatusMessage(currentRide.status)
      });
      return;
    }
    const ride = updateDriverRideStatus(driverRideStatusMatch[1], {
      driverId,
      status: body.status
    });
    if (!ride) {
      sendJson(response, 409, {
        error: "invalid_driver_ride_transition",
        message: `Cannot move ride from ${rideStatusMessage(currentRide.status)} to ${rideStatusMessage(body.status)}.`,
        messageAr: `لا يمكن نقل الرحلة من ${rideStatusMessage(currentRide.status)} إلى ${rideStatusMessage(body.status)}.`,
        currentStatus: rideStatusMessage(currentRide.status),
        requestedStatus: rideStatusMessage(body.status)
      });
      return;
    }
    broadcast("ride.status.changed", { ride });
    emitRideEvent(rideRealtimeEventName(ride), { ride });
    if (ride.status === "completed") {
      emitPaymentSideEffects(ensurePaymentForRide(ride, { forcePaid: true }));
    }
    sendJson(response, 200, { ride });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/rides") {
    sendJson(response, 200, { rides: listRides() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/payments") {
    sendJson(response, 200, adminPaymentsOverview());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/wallet-transactions") {
    sendJson(response, 200, { transactions: listWalletTransactions() });
    return;
  }

  const adminPaymentStatusMatch = url.pathname.match(/^\/api\/admin\/payments\/([^/]+)\/status$/);
  if (request.method === "PATCH" && adminPaymentStatusMatch) {
    const body = await readJson(request);
    if (!isAllowedStatus(body.status || "paid", PAYMENT_STATUSES)) {
      sendJson(response, 400, { error: "invalid_payment_status" });
      return;
    }
    const paymentResult = updatePaymentStatus(adminPaymentStatusMatch[1], body.status || "paid");
    if (!paymentResult.payment) {
      sendJson(response, 404, { error: "payment_not_found" });
      return;
    }
    emitPaymentEvent("payment:updated", paymentResult);
    if (paymentResult.walletTransaction) emitPaymentEvent("wallet:updated", paymentResult);
    sendJson(response, 200, { payment: paymentResult.payment, walletTransaction: paymentResult.walletTransaction });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/earnings") {
    sendJson(response, 200, driverEarnings({
      driverId: url.searchParams.get("driverId") || "",
      phone: url.searchParams.get("phone") || ""
    }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/wallet-transactions") {
    const driverId = url.searchParams.get("driverId") || "";
    const phone = url.searchParams.get("phone") || "";
    sendJson(response, 200, { transactions: listWalletTransactions({ driverId, userPhone: phone, role: "driver" }) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/support/tickets") {
    if (!checkRateLimit(request, "support:tickets", { limit: 20, windowMs: 60_000 }).ok) {
      rejectRateLimited(response, request);
      return;
    }
    const body = await readJson(request);
    if (!body.name && !body.userName) {
      sendJson(response, 400, { error: "support_name_required" });
      return;
    }
    if (!body.phone) {
      sendJson(response, 400, { error: "support_phone_required" });
      return;
    }
    if (!isPhoneLike(body.phone) || (body.role && !["customer", "driver"].includes(body.role))) {
      sendJson(response, 400, { error: "invalid_support_payload" });
      return;
    }
    if (!body.message) {
      sendJson(response, 400, { error: "support_message_required" });
      return;
    }
    const ticket = insertSupportTicket(body);
    emitSupportTicketEvent("support:ticket-created", { ticket });
    sendJson(response, 201, { ticket });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/support/my-tickets") {
    sendJson(response, 200, {
      tickets: listMySupportTickets({
        phone: url.searchParams.get("phone") || "",
        role: url.searchParams.get("role") || ""
      })
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/support/tickets") {
    sendJson(response, 200, { tickets: listSupportTickets() });
    return;
  }

  const supportTicketStatusMatch = url.pathname.match(/^\/api\/admin\/support\/tickets\/([^/]+)\/status$/);
  if (request.method === "PATCH" && supportTicketStatusMatch) {
    const body = await readJson(request);
    if (!isAllowedStatus(body.status || "closed", SUPPORT_STATUSES)) {
      sendJson(response, 400, { error: "invalid_support_status" });
      return;
    }
    const ticket = updateSupportTicketStatus(supportTicketStatusMatch[1], body.status || "closed");
    if (!ticket) {
      sendJson(response, 404, { error: "support_ticket_not_found" });
      return;
    }
    emitSupportTicketEvent("support:ticket-updated", { ticket });
    sendJson(response, 200, { ticket });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/pricing") {
    sendJson(response, 200, { pricingRules: listPricingRules() });
    return;
  }

  const pricingPatchMatch = url.pathname.match(/^\/api\/admin\/pricing\/([^/]+)$/);
  if (request.method === "PATCH" && pricingPatchMatch) {
    const body = await readJson(request);
    if ((body.baseFareIls !== undefined && !isFiniteNumber(body.baseFareIls, { min: 0, max: 1000 })) ||
      (body.perKmIls !== undefined && !isFiniteNumber(body.perKmIls, { min: 0, max: 1000 })) ||
      (body.minimumFareIls !== undefined && !isFiniteNumber(body.minimumFareIls, { min: 0, max: 1000 }))) {
      sendJson(response, 400, { error: "invalid_pricing_payload" });
      return;
    }
    const rule = updatePricingRule(pricingPatchMatch[1], body);
    if (!rule) {
      sendJson(response, 404, { error: "pricing_rule_not_found" });
      return;
    }
    sendJson(response, 200, { rule });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/settings") {
    sendJson(response, 200, { settings: getSystemSettings() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/maintenance/cleanup") {
    const body = await readJson(request);
    const type = String(body.type || "").trim();
    if (!CLEANUP_TYPES.has(type)) {
      sendJson(response, 400, {
        error: "invalid_cleanup_type",
        message: "Unsupported cleanup type.",
        messageAr: "نوع تنظيف السجلات غير مدعوم."
      });
      return;
    }
    if (type === "allDemoData" && body.confirm !== "RESET_DEMO_DATA") {
      sendJson(response, 400, {
        error: "cleanup_confirmation_required",
        message: "RESET_DEMO_DATA confirmation is required.",
        messageAr: "يجب كتابة RESET_DEMO_DATA لتأكيد حذف بيانات الاختبار."
      });
      return;
    }
    const deletedCounts = cleanupAdminRecords(type);
    sendJson(response, 200, {
      success: true,
      deletedCounts,
      message: "Cleanup completed without deleting users, drivers, pricing, or settings.",
      messageAr: "تم تنظيف السجلات بدون حذف المستخدمين أو الكباتن أو الأسعار أو الإعدادات."
    });
    return;
  }

  if (request.method === "PATCH" && url.pathname === "/api/admin/settings") {
    const body = await readJson(request);
    const settings = updateSystemSettings(body);
    sendJson(response, 200, { settings });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drivers/status") {
    const body = await readJson(request);
    const driverId = requestDriverId(request, body);
    if (!driverId) {
      sendJson(response, 400, {
        error: "driver_id_required",
        message: "driverId is required to update captain online status.",
        messageAr: "معرّف الكابتن مطلوب لتحديث حالة الاتصال."
      });
      return;
    }
    const driver = updateDriverStatus(driverId, { online: Boolean(body.online) });
    if (!driver) {
      sendJson(response, 404, {
        error: "driver_not_found",
        message: "Captain was not found.",
        messageAr: "لم يتم العثور على الكابتن."
      });
      return;
    }
    broadcast("driver.status.changed", { driver });
    emitDriverEvent("driver:online-status-updated", { driver });
    sendJson(response, 200, { driver });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/drivers/requests") {
    const cityId = url.searchParams.get("cityId") || "nablus";
    sendJson(response, 200, { requests: listDriverRequests(cityId) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/overview") {
    sendJson(response, 200, adminOverview());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/dashboard") {
    const overview = adminOverview();
    sendJson(response, 200, {
      stats: {
        customers: overview.customers,
        captains: overview.captains,
        pendingCaptainApplications: overview.pendingCaptainApplications,
        todayRides: overview.todayRides,
        activeRides: overview.activeRides,
        estimatedRevenue: overview.estimatedRevenue,
        openSupportTickets: overview.openSupportTickets
      },
      recentRides: overview.recentRides,
      pricingRules: listPricingRules(),
      supportTickets: listSupportTickets()
    });
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

const server = http.createServer((request, response) => {
  handleApi(request, response).catch((error) => {
    console.error(error);
    sendJson(response, 500, { error: "server_error" });
  });
});

setupRealtime(server);

setInterval(() => {
  const onlineDrivers = listDrivers().filter((item) => item.online);
  for (const driver of onlineDrivers) {
    const lat = Number(driver.lat ?? 32.222) + (Math.random() - 0.5) * 0.001;
    const lng = Number(driver.lng ?? 35.262) + (Math.random() - 0.5) * 0.001;
    updateDriverLocation(driver.id, lat, lng);
    broadcast("driver.location.updated", { driverId: driver.id, lat, lng });
  }
  broadcast("admin.metrics.updated", adminOverview());
}, 3000).unref();

server.listen(port, host, () => {
  console.log(`Wasel API listening on http://${host}:${port}`);
});
