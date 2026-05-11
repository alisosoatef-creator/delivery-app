import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { adminRides, cities, drivers } from "./data.mjs";

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
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

function cityById(cityId) {
  return cities.find((city) => city.id === cityId) || cities[0];
}

function nearbyDrivers(cityId) {
  return drivers
    .filter((driver) => driver.cityId === cityId && driver.online)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function calculateQuote({ cityId = "nablus", distanceKm = 5.8 }) {
  const city = cityById(cityId);
  const surge = city.demand > 85 ? 1.16 : city.demand > 70 ? 1.08 : 1;
  const fareIls = Math.max(15, Math.round((city.baseFare + Number(distanceKm) * 2.35) * surge));
  const etaMinutes = Math.max(4, Math.round(Number(distanceKm) * 1.1 + 3));
  return { cityId: city.id, distanceKm: Number(distanceKm), etaMinutes, fareIls, currency: "ILS" };
}

function broadcast(event, payload) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) client.write(frame);
}

function adminOverview() {
  const activeRides = [...rides.values()].filter((ride) => ride.status !== "completed").length;
  return {
    activeRides,
    onlineDrivers: drivers.filter((driver) => driver.online).length,
    todayRevenueIls: [...rides.values()].reduce((sum, ride) => sum + (ride.fareIls || 0), 0),
    cities,
    recentRides: [...rides.values()].slice(-8).reverse()
  };
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
    sendJson(response, 200, { cities, drivers, admin: adminOverview() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    response.write("event: connected\ndata: {\"ok\":true}\n\n");
    sseClients.add(response);
    request.on("close", () => sseClients.delete(response));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/request-otp") {
    const body = await readJson(request);
    const requestId = `otp_${randomUUID()}`;
    otpRequests.set(requestId, { phone: body.phone, role: body.role, code: "1234", createdAt: Date.now() });
    sendJson(response, 200, { requestId, expiresInSeconds: 120, demoCode: "1234" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-otp") {
    const body = await readJson(request);
    const otp = otpRequests.get(body.requestId);
    if (!otp || body.code !== otp.code) {
      sendJson(response, 401, { error: "invalid_otp" });
      return;
    }
    sendJson(response, 200, {
      token: `demo_${randomUUID()}`,
      user: { id: `usr_${randomUUID()}`, phone: otp.phone, role: otp.role || "customer" }
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/rides/quote") {
    const body = await readJson(request);
    sendJson(response, 200, { quoteId: `quote_${randomUUID()}`, ...calculateQuote(body) });
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
  if (request.method === "POST" && rideStatusMatch) {
    const body = await readJson(request);
    const ride = rides.get(rideStatusMatch[1]);
    if (!ride) {
      sendJson(response, 404, { error: "ride_not_found" });
      return;
    }
    ride.status = body.status || ride.status;
    if (ride.status === "completed") ride.completedAt = new Date().toISOString();
    broadcast("ride.status.changed", { ride });
    sendJson(response, 200, { ride });
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
