import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

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

async function requestRaw(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  return { response, payload };
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
    body: JSON.stringify({
      fullName: "Smoke Customer",
      phone,
      password: "demo123",
      city: "nablus",
      age: 30,
      birthDate: "1996-01-01"
    })
  });
  assert(register.requestId, "register should return requestId");
  assert(register.otpRequired === true, "register should require OTP instead of logging in directly");
  assert(!register.token, "register should not return a session token");

  const smokeDb = new DatabaseSync(smokeDbPath, { readOnly: true });
  const storedUser = smokeDb.prepare("SELECT password, passwordHash, isVerified FROM users WHERE phone = ?").get(phone);
  smokeDb.close();
  assert(storedUser?.isVerified === 0, "registered user should start unverified");
  assert(storedUser?.passwordHash?.startsWith("$2"), "user should store a bcrypt passwordHash");
  assert(storedUser.password !== "demo123", "database must not store the plain password");

  const loginBeforeVerification = await requestRaw("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, password: "demo123" })
  });
  assert(loginBeforeVerification.response.status === 401, "login before OTP verification should be rejected");

  const duplicate = await requestRaw("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Smoke Customer Duplicate",
      phone,
      password: "demo123",
      city: "nablus",
      age: 30,
      birthDate: "1996-01-01"
    })
  });
  assert(duplicate.response.status === 409, "duplicate phone should be blocked");

  const verified = await request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code: "1234" })
  });
  assert(verified.user?.verified, "verify-otp should mark user verified");

  const wrongPassword = await requestRaw("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, password: "wrong-password" })
  });
  assert(wrongPassword.response.status === 401, "wrong password should be rejected");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, password: "demo123" })
  });
  assert(login.token, "login should return token");
  assert(login.user?.role === "customer", "login should return a customer session user");

  const customers = await request("/api/admin/customers");
  const smokeCustomer = customers.customers.find((customer) => customer.phone === phone);
  assert(smokeCustomer?.id, "admin customers should include registered database customers");

  const suspendedCustomer = await request(`/api/admin/customers/${smokeCustomer.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "suspended" })
  });
  assert(suspendedCustomer.customer.status === "suspended", "admin customer status patch should suspend customer");

  const activeCustomer = await request(`/api/admin/customers/${smokeCustomer.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "active" })
  });
  assert(activeCustomer.customer.status === "active", "admin customer status patch should reactivate customer");

  const captainPhone = `+97059999${Date.now().toString().slice(-4)}`;
  const applicationResponse = await request("/api/captain-applications", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Smoke Captain",
      phone: captainPhone,
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
  const smokeDriverDb = new DatabaseSync(smokeDbPath, { readOnly: true });
  const driverUser = smokeDriverDb.prepare("SELECT role, status FROM users WHERE phone = ?").get(captainPhone);
  smokeDriverDb.close();
  assert(driverUser?.role === "driver" && driverUser.status === "active", "approved captain should prepare an active driver user");

  const suspendedDriver = await request(`/api/admin/drivers/${approve.captain.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "suspended" })
  });
  assert(suspendedDriver.driver.status === "suspended", "admin driver status patch should suspend driver");

  const activeDriver = await request(`/api/admin/drivers/${approve.captain.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "active" })
  });
  assert(activeDriver.driver.status === "active", "admin driver status patch should reactivate driver");

  const quote = await request("/api/rides/quote", {
    method: "POST",
    body: JSON.stringify({ cityId: "nablus", distanceKm: 5.8 })
  });
  assert(quote.fareIls, "quote should include fareIls");

  const ridePayload = {
    customerId: login.user.id,
    customerName: "Smoke Customer",
    customerPhone: phone,
    cityId: "nablus",
    pickup: "A",
    destination: "B",
    pickupLat: 32.2211,
    pickupLng: 35.2544,
    destinationLat: 32.225,
    destinationLng: 35.26,
    paymentMethod: "cash",
    distanceKm: 4.1,
    routeDistanceKm: 5.2,
    durationMinutes: 14
  };

  const searchingRide = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify(ridePayload)
  });
  const cancelledRideId = searchingRide.ride?.id;
  assert(cancelledRideId, "ride request should create ride");
  assert(searchingRide.ride.status === "searching", "new customer ride should start searching");
  assert(!searchingRide.ride.driverId && !searchingRide.driver, "new customer ride must not expose captain before acceptance");
  assert(searchingRide.ride.routeDistanceKm === 5.2, "ride should persist route distance");
  assert(searchingRide.ride.durationMinutes === 14, "ride should persist route duration");

  const customerRides = await request(`/api/customer/rides?phone=${encodeURIComponent(phone)}`);
  assert(
    customerRides.rides.some((customerRide) => customerRide.id === cancelledRideId),
    "customer rides should include the newly created ride"
  );

  const customerRideDetails = await request(`/api/customer/rides/${cancelledRideId}?phone=${encodeURIComponent(phone)}`);
  assert(customerRideDetails.ride?.id === cancelledRideId, "customer ride details should return the requested ride");

  const cancelledRide = await request(`/api/rides/${cancelledRideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" })
  });
  assert(cancelledRide.ride.status === "cancelled", "ride status should update to cancelled");

  const ride = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify({ ...ridePayload, pickup: "Accept A", destination: "Accept B" })
  });
  const rideId = ride.ride?.id;
  assert(rideId, "ride request should create ride");
  assert(ride.ride.status === "searching", "second ride should also start searching");

  const acceptedRide = await request(`/api/rides/${rideId}/accept`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id })
  });
  assert(acceptedRide.ride.status === "accepted", "ride accept endpoint should set accepted status");
  assert(acceptedRide.ride.driverId === approve.captain.id, "ride accept endpoint should assign driver id");

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

  const closedTicket = await request(`/api/admin/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "closed" })
  });
  assert(closedTicket.ticket?.status === "closed", "admin support ticket patch should close a ticket");

  const reopenedTicket = await request(`/api/admin/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "open" })
  });
  assert(reopenedTicket.ticket?.status === "open", "admin support ticket patch should reopen a ticket");

  const pricing = await request("/api/admin/pricing/nablus", {
    method: "PATCH",
    body: JSON.stringify({ baseFareIls: 13, perKmIls: 4, minimumFareIls: 18, isActive: false })
  });
  assert(pricing.rule.baseFareIls === 13, "pricing patch should update base fare");
  assert(pricing.rule.perKmIls === 4, "pricing patch should update per-km fare");
  assert(pricing.rule.minimumFareIls === 18, "pricing patch should update minimum fare");
  assert(pricing.rule.isActive === false, "pricing patch should update active state");

  const settings = await request("/api/admin/settings");
  assert(settings.settings?.appName, "admin settings endpoint should return system settings");
  const settingsPatch = await request("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ appName: "Wasel Smoke", appStatus: "maintenance", supportPhone: "+970599900001", welcomeMessage: "Smoke hello" })
  });
  assert(settingsPatch.settings.appName === "Wasel Smoke", "admin settings patch should update app name");
  assert(settingsPatch.settings.appStatus === "maintenance", "admin settings patch should update app status");

  const dashboard = await request("/api/admin/dashboard");
  assert(dashboard.stats?.customers >= 1, "admin dashboard should include database customer count");
  assert(dashboard.stats?.captains >= 1, "admin dashboard should include database captain count");
  assert(dashboard.stats?.pendingCaptainApplications >= 0, "admin dashboard should include pending captain applications");
  assert(typeof dashboard.stats?.estimatedRevenue === "number", "admin dashboard should include estimated revenue");

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
    persistedPricing.pricingRules.some((rule) => rule.cityId === "nablus" && rule.baseFareIls === 13 && rule.isActive === false),
    "pricing update should persist after server restart"
  );

  const persistedSettings = await request("/api/admin/settings");
  assert(persistedSettings.settings.appName === "Wasel Smoke", "settings update should persist after server restart");

  console.log("backend-smoke-ok");
} finally {
  await stopServer(child);
  fs.rmSync(smokeDbPath, { force: true });
  fs.rmSync(`${smokeDbPath}-shm`, { force: true });
  fs.rmSync(`${smokeDbPath}-wal`, { force: true });
}
