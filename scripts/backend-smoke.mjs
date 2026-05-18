import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT || 3101);
const baseUrl = `http://127.0.0.1:${port}`;
const smokeDbPath = path.join(os.tmpdir(), `wasel-smoke-${process.pid}-${Date.now()}.sqlite`);

let logs = "";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function startServer() {
  const child = spawn(process.execPath, ["backend/server.mjs"], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      WASEL_DB_PATH: smokeDbPath
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => {
    logs += chunk;
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk;
  });

  return child;
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
      resolve();
    }, 1200);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill();
  });
}

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${pathname} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 8000) {
    try {
      const health = await request("/api/health");
      if (health.ok) return health;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Backend smoke server did not become ready\n${logs}`);
}

let child = startServer();

try {
  const health = await waitForServer();
  assert(health.database?.engine === "sqlite", "health should report sqlite database");
  assert(health.database?.path, "health should report database path");

  const bootstrap = await request("/api/bootstrap");
  assert(Array.isArray(bootstrap.cities), "bootstrap should include cities");
  assert(Array.isArray(bootstrap.pricingRules), "bootstrap should include pricingRules");
  assert(bootstrap.settings?.appStatus, "bootstrap should include active settings");

  const phone = `+97059000${Date.now().toString().slice(-4)}`;
  const register = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName: "Smoke Customer", phone, password: "demo123", cityId: "nablus" })
  });
  assert(register.requestId, "register should return requestId");

  const verified = await request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ requestId: register.requestId, code: "1234" })
  });
  assert(verified.user?.verified, "verify-otp should mark user verified");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, password: "demo123" })
  });
  assert(login.token, "login should return token");

  const applicationResponse = await request("/api/captain-applications", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Smoke Captain",
      phone: `+97059999${Date.now().toString().slice(-4)}`,
      city: "nablus",
      age: 31,
      vehicleType: "car",
      vehiclePlate: "SMK-1"
    })
  });
  const applicationId = applicationResponse.application?.id;
  assert(applicationId, "captain application should return id");

  const applications = await request("/api/admin/captain-applications");
  assert(applications.applications.some((application) => application.id === applicationId), "captain application should be listed");

  const approve = await request(`/api/admin/captain-applications/${applicationId}/approve`, { method: "PATCH" });
  assert(approve.application.status === "approved", "approve should update application status");
  assert(approve.captain?.applicationId === applicationId, "approve should create approved captain");

  const quote = await request("/api/rides/quote", {
    method: "POST",
    body: JSON.stringify({ cityId: "nablus", distanceKm: 5.8 })
  });
  assert(quote.fareIls, "quote should include fareIls");

  const ride = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify({ cityId: "nablus", pickup: "A", dropoff: "B", paymentMethod: "cash", distanceKm: 5.8 })
  });
  const rideId = ride.ride?.id;
  assert(rideId, "ride request should create ride");

  const status = await request(`/api/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" })
  });
  assert(status.ride.status === "completed", "ride status should update");

  const ticket = await request("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ userName: "Smoke Customer", phone, type: "general", message: "Need help" })
  });
  const ticketId = ticket.ticket?.id;
  assert(ticket.ticket?.status === "open", "support ticket should start open");

  const pricing = await request("/api/admin/pricing/nablus", {
    method: "PATCH",
    body: JSON.stringify({ baseFareIls: 13 })
  });
  assert(pricing.rule.baseFareIls === 13, "pricing patch should update base fare");

  await stopServer(child);
  child = startServer();
  await waitForServer();

  const persistedApplications = await request("/api/admin/captain-applications");
  assert(
    persistedApplications.applications.some((application) => application.id === applicationId && application.status === "approved"),
    "captain application should persist after server restart"
  );

  const persistedDrivers = await request("/api/admin/drivers");
  assert(
    persistedDrivers.drivers.some((driver) => driver.applicationId === applicationId),
    "approved captain should persist as driver after server restart"
  );

  const persistedRides = await request("/api/admin/rides");
  assert(
    persistedRides.rides.some((persistedRide) => persistedRide.id === rideId && persistedRide.status === "completed"),
    "ride should persist after server restart"
  );

  const persistedTickets = await request("/api/admin/support/tickets");
  assert(
    persistedTickets.tickets.some((persistedTicket) => persistedTicket.id === ticketId && persistedTicket.status === "open"),
    "support ticket should persist after server restart"
  );

  const persistedPricing = await request("/api/admin/pricing");
  assert(
    persistedPricing.pricingRules.some((rule) => rule.cityId === "nablus" && rule.baseFareIls === 13),
    "pricing update should persist after server restart"
  );

  console.log("backend-smoke-ok");
} finally {
  await stopServer(child);
  fs.rmSync(smokeDbPath, { force: true });
  fs.rmSync(`${smokeDbPath}-shm`, { force: true });
  fs.rmSync(`${smokeDbPath}-wal`, { force: true });
}
