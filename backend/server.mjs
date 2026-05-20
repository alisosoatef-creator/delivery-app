import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import {
  adminOverview,
  acceptRide,
  createDriverFromApplication,
  createOrUpdateCustomerUser,
  createOtpCode,
  databaseInfo,
  findOtpCode,
  findOtpCodeByPhone,
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
  listPricingRules,
  listRides,
  listSupportTickets,
  markOtpUsed,
  publicUser,
  updateCaptainApplicationStatus,
  updateCustomerStatus,
  updateDriverLocation,
  updateDriverRideStatus,
  updateDriverStatus,
  updatePricingRule,
  updateRideStatus,
  updateSystemSettings,
  updateSupportTicketStatus,
  verifyUserByPhone
} from "./db/database.mjs";
import { hashPassword, verifyPassword } from "./auth/passwords.mjs";
import { emitDriverEvent, emitRideEvent, emitSupportTicketEvent, realtimeInfo, setupRealtime } from "./realtime.mjs";

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const authConfig = { demoOtpCode: "1234" };
const sseClients = new Set();

// approvedCaptains now live in the persistent drivers table after application approval.

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS"
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

function requireAdminDev(request) {
  // TODO phase-10: replace this development placeholder with real token/session authorization for /api/admin.
  const token = request.headers.authorization || "";
  return token.startsWith("Bearer dev-admin-session-token") || process.env.NODE_ENV !== "production";
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
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

  if (request.method === "GET" && url.pathname === "/api/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    response.write("event: connected\ndata: {\"ok\":true,\"events\":[]}\n\n");
    sseClients.add(response);
    request.on("close", () => sseClients.delete(response));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/request-otp") {
    const body = await readJson(request);
    const requestId = createOtpCode({ phone: body.phone, purpose: body.role || "customer", code: authConfig.demoOtpCode });
    sendJson(response, 200, { requestId, expiresInSeconds: 120, demoCode: authConfig.demoOtpCode });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJson(request);
    if (!body.fullName || !body.phone || !body.city && !body.cityId || !body.age || !body.birthDate || !body.password) {
      sendJson(response, 400, { error: "missing_required_fields" });
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
    const body = await readJson(request);
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
    const body = await readJson(request);
    if (!body.fullName || !body.phone || !body.city || !body.age || !body.vehicleType) {
      sendJson(response, 400, { error: "missing_required_fields" });
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
    sendJson(response, 200, { quoteId: `quote_${randomUUID()}`, ...calculateQuote(body) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/rides") {
    sendJson(response, 200, { rides: listRides() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/available-rides") {
    sendJson(response, 200, { rides: listAvailableRides({ cityId: url.searchParams.get("cityId") || "" }) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/driver/my-rides") {
    sendJson(response, 200, {
      rides: listDriverRides({
        driverId: url.searchParams.get("driverId") || "",
        phone: url.searchParams.get("phone") || ""
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
    const ride = updateRideStatus(rideStatusMatch[1], body.status);
    if (!ride) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    broadcast("ride.status.changed", { ride });
    emitRideEvent(rideRealtimeEventName(ride), { ride });
    sendJson(response, 200, { ride });
    return;
  }

  const rideAcceptMatch = url.pathname.match(/^\/api\/rides\/([^/]+)\/accept$/);
  if (request.method === "PATCH" && rideAcceptMatch) {
    const body = await readJson(request);
    if (!body.driverId) {
      sendJson(response, 400, { error: "driver_id_required" });
      return;
    }
    const ride = acceptRide(rideAcceptMatch[1], body.driverId);
    if (!ride) {
      sendJson(response, 404, { error: "ride_or_driver_not_found" });
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
    if (!body.driverId) {
      sendJson(response, 400, { error: "driver_id_required" });
      return;
    }
    const ride = updateDriverRideStatus(driverRideStatusMatch[1], {
      driverId: body.driverId,
      status: body.status
    });
    if (!ride) {
      sendJson(response, 409, { error: "invalid_driver_ride_transition" });
      return;
    }
    broadcast("ride.status.changed", { ride });
    emitRideEvent(rideRealtimeEventName(ride), { ride });
    sendJson(response, 200, { ride });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/rides") {
    sendJson(response, 200, { rides: listRides() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/support/tickets") {
    const body = await readJson(request);
    if (!body.name && !body.userName) {
      sendJson(response, 400, { error: "support_name_required" });
      return;
    }
    if (!body.phone) {
      sendJson(response, 400, { error: "support_phone_required" });
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

  if (request.method === "PATCH" && url.pathname === "/api/admin/settings") {
    const body = await readJson(request);
    const settings = updateSystemSettings(body);
    sendJson(response, 200, { settings });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drivers/status") {
    const body = await readJson(request);
    const driver = updateDriverStatus(body.driverId, { online: Boolean(body.online) }) || listDrivers()[0];
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
