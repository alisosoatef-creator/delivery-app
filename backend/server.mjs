import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import {
  adminRides,
  approvedCaptains,
  captainApplications,
  cities,
  customers,
  drivers,
  pricingRules,
  supportTickets,
  systemSettings,
  users
} from "./data.mjs";

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const authConfig = { demoOtpCode: "1234" };
const otpRequests = new Map();
const rides = new Map(adminRides.map((ride) => [ride.id, { ...ride }]));
const sseClients = new Set();

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

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
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

function cityById(cityId) {
  return cities.find((city) => city.id === cityId) || cities[0];
}

function cityLabel(cityId) {
  const city = cityById(cityId);
  return city.en || city.id;
}

function nearbyDrivers(cityId) {
  return drivers
    .filter((driver) => driver.cityId === cityId && driver.online)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function calculateQuote({ cityId = "nablus", distanceKm = 5.8 }) {
  const city = cityById(cityId);
  const numericDistance = Number(distanceKm) || 5.8;
  const rule = pricingRules.find((item) => item.cityId === city.id);
  const baseFare = rule?.baseFareIls ?? city.baseFare;
  const perKm = rule?.perKmIls ?? 2.35;
  const minimumFare = rule?.minimumFareIls ?? 15;
  const surge = city.demand > 85 ? 1.16 : city.demand > 70 ? 1.08 : 1;
  const fareIls = Math.max(minimumFare, Math.round((baseFare + numericDistance * perKm) * surge));
  const etaMinutes = Math.max(4, Math.round(numericDistance * 1.1 + 3));
  return { cityId: city.id, distanceKm: numericDistance, etaMinutes, fareIls, currency: "ILS" };
}

function broadcast(event, payload) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) client.write(frame);
}

function allDrivers() {
  return [...drivers, ...approvedCaptains];
}

function adminOverview() {
  const activeRides = [...rides.values()].filter((ride) => ride.status !== "completed").length;
  return {
    activeRides,
    onlineDrivers: allDrivers().filter((driver) => driver.online || driver.availability === "online").length,
    todayRevenueIls: [...rides.values()].reduce((sum, ride) => sum + (ride.fareIls || 0), 0),
    customers: customers.length + users.filter((user) => user.role === "customer").length,
    captains: allDrivers().length,
    pendingCaptainApplications: captainApplications.filter((application) => application.status === "pending").length,
    openSupportTickets: supportTickets.filter((ticket) => ticket.status === "open").length,
    cities,
    recentRides: [...rides.values()].slice(-8).reverse()
  };
}

function createOtpRequest({ phone, role = "customer", userId = "" }) {
  const requestId = `otp_${randomUUID()}`;
  otpRequests.set(requestId, {
    phone,
    role,
    userId,
    code: authConfig.demoOtpCode,
    createdAt: Date.now()
  });
  return requestId;
}

function findUserByIdentifier(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return users.find((user) =>
    [user.phone, user.fullName, user.id].some((value) => String(value || "").trim().toLowerCase() === normalized)
  );
}

function createCaptainFromApplication(application) {
  return {
    id: `captain_${application.id}`,
    applicationId: application.id,
    fullName: application.fullName,
    nameAr: application.fullName,
    nameEn: application.fullName,
    phone: application.phone,
    cityId: application.city,
    cityLabel: application.cityLabel,
    vehicle: application.vehicleType,
    vehicleType: application.vehicleType,
    plate: application.vehiclePlate || "Not provided",
    experienceYears: application.experienceYears,
    online: false,
    availability: "offline",
    status: "active",
    approvedAt: new Date().toISOString()
  };
}

function updateItemStatus(collection, id, patch = {}) {
  const item = collection.find((entry) => entry.id === id);
  if (!item) return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  return item;
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "wasel-api", time: new Date().toISOString() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(response, 200, {
      cities,
      drivers: allDrivers(),
      pricingRules,
      settings: systemSettings,
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
    const requestId = createOtpRequest({ phone: body.phone, role: body.role });
    sendJson(response, 200, { requestId, expiresInSeconds: 120, demoCode: authConfig.demoOtpCode });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJson(request);
    if (!body.fullName || !body.phone || !body.password) {
      sendJson(response, 400, { error: "missing_required_fields" });
      return;
    }

    let user = users.find((item) => item.phone === body.phone);
    if (!user) {
      user = {
        id: `usr_${randomUUID()}`,
        fullName: body.fullName,
        phone: body.phone,
        password: body.password,
        cityId: body.cityId || body.city || "nablus",
        role: "customer",
        verified: false,
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }

    const requestId = createOtpRequest({ phone: user.phone, role: user.role, userId: user.id });
    sendJson(response, 201, { user: publicUser(user), requestId, demoCode: authConfig.demoOtpCode });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-otp") {
    const body = await readJson(request);
    if (body.code !== authConfig.demoOtpCode) {
      sendJson(response, 401, { error: "invalid_otp" });
      return;
    }

    const otp = body.requestId ? otpRequests.get(body.requestId) : null;
    const user = users.find((item) => item.id === body.userId || item.id === otp?.userId || item.phone === body.phone || item.phone === otp?.phone);
    if (user) user.verified = true;

    sendJson(response, 200, {
      token: `demo_${randomUUID()}`,
      user: publicUser(user) || {
        id: `usr_${randomUUID()}`,
        phone: otp?.phone || body.phone,
        role: otp?.role || "customer",
        verified: true
      }
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJson(request);
    const user = findUserByIdentifier(body.identifier || body.phone || body.fullName);
    if (!user || user.password !== body.password || !user.verified) {
      sendJson(response, 401, { error: "invalid_login" });
      return;
    }
    sendJson(response, 200, { token: `demo_${randomUUID()}`, user: publicUser(user) });
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
    const application = {
      id: `captain_app_${randomUUID()}`,
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      cityLabel: body.cityLabel || cityLabel(body.city),
      age: Number(body.age),
      vehicleType: body.vehicleType,
      vehiclePlate: body.vehiclePlate || "",
      experienceYears: body.experienceYears || "",
      notes: body.notes || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    captainApplications.push(application);
    sendJson(response, 201, { application });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/captain-applications") {
    sendJson(response, 200, { applications: captainApplications });
    return;
  }

  const captainApplicationApproveMatch = url.pathname.match(/^\/api\/admin\/captain-applications\/([^/]+)\/approve$/);
  if (request.method === "PATCH" && captainApplicationApproveMatch) {
    const application = captainApplications.find((item) => item.id === captainApplicationApproveMatch[1]);
    if (!application) {
      sendJson(response, 404, { error: "captain_application_not_found" });
      return;
    }
    application.status = "approved";
    application.reviewedAt = new Date().toISOString();
    let captain = approvedCaptains.find((item) => item.applicationId === application.id);
    if (!captain) {
      captain = createCaptainFromApplication(application);
      approvedCaptains.push(captain);
    }
    sendJson(response, 200, { application, captain });
    return;
  }

  const captainApplicationRejectMatch = url.pathname.match(/^\/api\/admin\/captain-applications\/([^/]+)\/reject$/);
  if (request.method === "PATCH" && captainApplicationRejectMatch) {
    const application = captainApplications.find((item) => item.id === captainApplicationRejectMatch[1]);
    if (!application) {
      sendJson(response, 404, { error: "captain_application_not_found" });
      return;
    }
    application.status = "rejected";
    application.reviewedAt = new Date().toISOString();
    sendJson(response, 200, { application });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/customers") {
    sendJson(response, 200, { customers: [...customers, ...users.filter((user) => user.role === "customer").map(publicUser)] });
    return;
  }

  const customerStatusMatch = url.pathname.match(/^\/api\/admin\/customers\/([^/]+)\/status$/);
  if (request.method === "PATCH" && customerStatusMatch) {
    const body = await readJson(request);
    const customer = updateItemStatus(customers, customerStatusMatch[1], { status: body.status || "active" });
    if (!customer) {
      sendJson(response, 404, { error: "customer_not_found" });
      return;
    }
    sendJson(response, 200, { customer, placeholder: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/drivers") {
    sendJson(response, 200, { drivers: allDrivers() });
    return;
  }

  const driverStatusMatch = url.pathname.match(/^\/api\/admin\/drivers\/([^/]+)\/status$/);
  if (request.method === "PATCH" && driverStatusMatch) {
    const body = await readJson(request);
    const driver = allDrivers().find((item) => item.id === driverStatusMatch[1]);
    if (!driver) {
      sendJson(response, 404, { error: "driver_not_found" });
      return;
    }
    driver.status = body.status || driver.status || "active";
    if (typeof body.online === "boolean") {
      driver.online = body.online;
      driver.availability = body.online ? "online" : "offline";
    }
    driver.updatedAt = new Date().toISOString();
    sendJson(response, 200, { driver, placeholder: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rides/quote") {
    const body = await readJson(request);
    sendJson(response, 200, { quoteId: `quote_${randomUUID()}`, ...calculateQuote(body) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/rides") {
    sendJson(response, 200, { rides: [...rides.values()] });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rides") {
    const body = await readJson(request);
    const availableDrivers = nearbyDrivers(body.cityId || "nablus");
    const driver = availableDrivers[0] || null;
    const quote = calculateQuote(body);
    const ride = {
      id: `ride_${randomUUID()}`,
      cityId: quote.cityId,
      status: driver ? "accepted" : "searching",
      pickup: body.pickup || "An-Najah University",
      dropoff: body.dropoff || "Rafidia",
      paymentMethod: body.paymentMethod || "cash",
      driverId: driver?.id || null,
      fareIls: quote.fareIls,
      distanceKm: quote.distanceKm,
      etaMinutes: driver?.etaMinutes || quote.etaMinutes,
      createdAt: new Date().toISOString()
    };
    rides.set(ride.id, ride);
    broadcast("ride.driver.matched", { ride, driver });
    sendJson(response, 201, { ride, driver });
    return;
  }

  const rideStatusMatch = url.pathname.match(/^\/api\/rides\/([^/]+)\/status$/);
  if ((request.method === "POST" || request.method === "PATCH") && rideStatusMatch) {
    const body = await readJson(request);
    const ride = rides.get(rideStatusMatch[1]);
    if (!ride) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    ride.status = body.status || ride.status;
    ride.updatedAt = new Date().toISOString();
    if (ride.status === "completed") ride.completedAt = new Date().toISOString();
    broadcast("ride.status.changed", { ride });
    sendJson(response, 200, { ride });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/rides") {
    sendJson(response, 200, { rides: [...rides.values()].slice().reverse() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/support/tickets") {
    const body = await readJson(request);
    const ticket = {
      id: `support_${randomUUID()}`,
      userName: body.userName || body.name || "Guest",
      type: body.type || "general",
      message: body.message || "",
      status: "open",
      createdAt: new Date().toISOString()
    };
    supportTickets.push(ticket);
    sendJson(response, 201, { ticket });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/support/tickets") {
    sendJson(response, 200, { tickets: supportTickets });
    return;
  }

  const supportTicketStatusMatch = url.pathname.match(/^\/api\/admin\/support\/tickets\/([^/]+)\/status$/);
  if (request.method === "PATCH" && supportTicketStatusMatch) {
    const body = await readJson(request);
    const ticket = updateItemStatus(supportTickets, supportTicketStatusMatch[1], { status: body.status || "closed" });
    if (!ticket) {
      sendJson(response, 404, { error: "support_ticket_not_found" });
      return;
    }
    sendJson(response, 200, { ticket });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/pricing") {
    sendJson(response, 200, { pricingRules });
    return;
  }

  const pricingPatchMatch = url.pathname.match(/^\/api\/admin\/pricing\/([^/]+)$/);
  if (request.method === "PATCH" && pricingPatchMatch) {
    const body = await readJson(request);
    const rule = pricingRules.find((item) => item.cityId === pricingPatchMatch[1]);
    if (!rule) {
      sendJson(response, 404, { error: "pricing_rule_not_found" });
      return;
    }
    Object.assign(rule, {
      baseFareIls: body.baseFareIls ?? rule.baseFareIls,
      perKmIls: body.perKmIls ?? rule.perKmIls,
      minimumFareIls: body.minimumFareIls ?? rule.minimumFareIls,
      updatedAt: new Date().toISOString()
    });
    sendJson(response, 200, { rule });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/drivers/status") {
    const body = await readJson(request);
    const driver = drivers.find((item) => item.id === body.driverId) || drivers[0];
    driver.online = Boolean(body.online);
    if (body.lat && body.lng) {
      driver.lat = body.lat;
      driver.lng = body.lng;
    }
    broadcast("driver.status.changed", { driver });
    sendJson(response, 200, { driver });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/drivers/requests") {
    const cityId = url.searchParams.get("cityId") || "nablus";
    sendJson(response, 200, { requests: [...rides.values()].filter((ride) => ride.cityId === cityId && ride.status === "searching") });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/overview") {
    sendJson(response, 200, adminOverview());
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

setInterval(() => {
  for (const driver of drivers.filter((item) => item.online)) {
    driver.lat += (Math.random() - 0.5) * 0.001;
    driver.lng += (Math.random() - 0.5) * 0.001;
    broadcast("driver.location.updated", { driverId: driver.id, lat: driver.lat, lng: driver.lng });
  }
  broadcast("admin.metrics.updated", adminOverview());
}, 3000).unref();

server.listen(port, host, () => {
  console.log(`Wasel API listening on http://${host}:${port}`);
});
