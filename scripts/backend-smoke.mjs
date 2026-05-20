import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { io as createSocketClient } from "socket.io-client";

const port = Number(process.env.SMOKE_PORT || 3101);
const baseUrl = `http://127.0.0.1:${port}`;
const smokeDbPath = path.join(os.tmpdir(), `wasel-smoke-${process.pid}-${Date.now()}.sqlite`);

let logs = "";
let socket = null;

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

function connectSocket() {
  return new Promise((resolve, reject) => {
    const client = createSocketClient(baseUrl, {
      reconnection: false,
      timeout: 3000,
      transports: ["websocket", "polling"]
    });
    const timer = setTimeout(() => {
      client.close();
      reject(new Error("socket.io should connect to the backend"));
    }, 3500);
    client.once("connect", () => {
      clearTimeout(timer);
      resolve(client);
    });
    client.once("connect_error", (error) => {
      clearTimeout(timer);
      client.close();
      reject(error);
    });
  });
}

function waitForSocketEvent(client, eventName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`socket event not received: ${eventName}`)), 3000);
    client.once(eventName, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

let child = startServer();

try {
  const health = await waitForServer();
  assert(health.database?.engine === "sqlite", "health should report sqlite database");
  assert(health.database?.path, "health should report database path");
  socket = await connectSocket();
  assert(socket.connected, "socket.io should connect to the backend");
  socket.emit("join:admin");

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

  const rideCreatedEvent = waitForSocketEvent(socket, "ride:created");
  const searchingRide = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify(ridePayload)
  });
  const createdPayload = await rideCreatedEvent;
  const cancelledRideId = searchingRide.ride?.id;
  assert(cancelledRideId, "ride request should create ride");
  assert(createdPayload.ride?.id === cancelledRideId, "ride:created should emit the created ride");
  assert(searchingRide.ride.status === "searching", "new customer ride should start searching");
  assert(!searchingRide.ride.driverId && !searchingRide.driver, "new customer ride must not expose captain before acceptance");
  assert(searchingRide.ride.routeDistanceKm === 5.2, "ride should persist route distance");
  assert(searchingRide.ride.durationMinutes === 14, "ride should persist route duration");

  const availableBeforeCancel = await request("/api/driver/available-rides?cityId=nablus");
  assert(
    availableBeforeCancel.rides.some((availableRide) => availableRide.id === cancelledRideId && availableRide.status === "searching"),
    "driver available rides should include searching rides"
  );

  const customerRides = await request(`/api/customer/rides?phone=${encodeURIComponent(phone)}`);
  assert(
    customerRides.rides.some((customerRide) => customerRide.id === cancelledRideId),
    "customer rides should include the newly created ride"
  );

  const customerRideDetails = await request(`/api/customer/rides/${cancelledRideId}?phone=${encodeURIComponent(phone)}`);
  assert(customerRideDetails.ride?.id === cancelledRideId, "customer ride details should return the requested ride");

  const rideCancelledEvent = waitForSocketEvent(socket, "ride:cancelled");
  const cancelledRide = await request(`/api/rides/${cancelledRideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" })
  });
  const cancelledPayload = await rideCancelledEvent;
  assert(cancelledRide.ride.status === "cancelled", "ride status should update to cancelled");
  assert(cancelledPayload.ride?.id === cancelledRideId, "ride:cancelled should emit the cancelled ride");

  const ride = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify({ ...ridePayload, pickup: "Accept A", destination: "Accept B" })
  });
  const rideId = ride.ride?.id;
  assert(rideId, "ride request should create ride");
  assert(ride.ride.status === "searching", "second ride should also start searching");

  const availableBeforeAccept = await request("/api/driver/available-rides?cityId=nablus");
  assert(
    availableBeforeAccept.rides.some((availableRide) => availableRide.id === rideId),
    "driver available rides should include the ride before acceptance"
  );

  const rideAcceptedEvent = waitForSocketEvent(socket, "ride:accepted");
  const acceptedRide = await request(`/api/rides/${rideId}/accept`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id })
  });
  const acceptedPayload = await rideAcceptedEvent;
  assert(acceptedRide.ride.status === "accepted", "ride accept endpoint should set accepted status");
  assert(acceptedRide.ride.driverId === approve.captain.id, "ride accept endpoint should assign driver id");
  assert(acceptedRide.ride.driver?.id === approve.captain.id, "accepted ride should include driver details");
  assert(acceptedPayload.ride?.id === rideId, "ride:accepted should emit the accepted ride");

  socket.emit("join:ride", { rideId });
  const driverLocationEvent = waitForSocketEvent(socket, "driver:location-updated");
  socket.emit("driver:location-updated", {
    rideId,
    driverId: approve.captain.id,
    lat: 32.2222,
    lng: 35.2555,
    timestamp: "2026-05-20T12:00:00.000Z"
  });
  const driverLocationPayload = await driverLocationEvent;
  assert(driverLocationPayload.rideId === rideId, "driver:location-updated should include ride id");
  assert(driverLocationPayload.driverId === approve.captain.id, "driver:location-updated should include driver id");
  assert(driverLocationPayload.location?.lat === 32.2222, "driver:location-updated should include driver latitude");
  assert(driverLocationPayload.location?.lng === 35.2555, "driver:location-updated should include driver longitude");

  const availableAfterAccept = await request("/api/driver/available-rides?cityId=nablus");
  assert(
    !availableAfterAccept.rides.some((availableRide) => availableRide.id === rideId),
    "accepted ride should leave available driver requests"
  );

  const myRidesAfterAccept = await request(`/api/driver/my-rides?driverId=${encodeURIComponent(approve.captain.id)}`);
  assert(
    myRidesAfterAccept.rides.some((driverRide) => driverRide.id === rideId && driverRide.status === "accepted"),
    "accepted ride should appear in driver my-rides"
  );

  const rideStatusUpdatedEvent = waitForSocketEvent(socket, "ride:status-updated");
  const driverArriving = await request(`/api/driver/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id, status: "driver_arriving" })
  });
  const statusUpdatedPayload = await rideStatusUpdatedEvent;
  assert(driverArriving.ride.status === "driver_arriving", "driver should update ride to driver_arriving");
  assert(statusUpdatedPayload.ride?.status === "driver_arriving", "ride:status-updated should emit driver_arriving");

  const driverArrived = await request(`/api/driver/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id, status: "arrived" })
  });
  assert(driverArrived.ride.status === "arrived", "driver should update ride to arrived");

  const inProgress = await request(`/api/driver/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id, status: "in_progress" })
  });
  assert(inProgress.ride.status === "in_progress", "driver should update ride to in_progress");

  const rideCompletedEvent = waitForSocketEvent(socket, "ride:completed");
  const cashPaymentCreatedEvent = waitForSocketEvent(socket, "payment:created");
  const status = await request(`/api/driver/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ driverId: approve.captain.id, status: "completed" })
  });
  const completedPayload = await rideCompletedEvent;
  const cashPaymentPayload = await cashPaymentCreatedEvent;
  assert(status.ride.status === "completed", "ride status should update");
  assert(completedPayload.ride?.id === rideId, "ride:completed should emit the completed ride");
  assert(cashPaymentPayload.payment?.rideId === rideId, "completed cash ride should emit payment:created");
  assert(cashPaymentPayload.payment?.method === "cash", "completed cash ride should create a cash payment");

  const customerWallet = await request(`/api/customer/wallet?phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(login.user.id)}`);
  assert(typeof customerWallet.wallet?.balance === "number", "customer wallet should return a numeric balance");

  const savedMethod = await request("/api/customer/payment-methods", {
    method: "POST",
    body: JSON.stringify({
      userPhone: phone,
      userId: login.user.id,
      type: "visa",
      cardholderName: "Smoke Customer",
      cardNumber: "4242 4242 4242 4242",
      cvv: "123",
      expiryMonth: "12",
      expiryYear: "2029"
    })
  });
  assert(savedMethod.method?.last4 === "4242", "saved VISA placeholder should keep last4 only");
  assert(!savedMethod.method?.cardNumber && !savedMethod.method?.cvv, "saved VISA placeholder must not expose card number or CVV");

  const savedMethods = await request(`/api/customer/payment-methods?phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(login.user.id)}`);
  assert(
    savedMethods.methods.some((method) => method.id === savedMethod.method.id && method.last4 === "4242"),
    "customer payment methods should include the saved VISA placeholder"
  );

  const adminPayments = await request("/api/admin/payments");
  assert(
    adminPayments.payments.some((payment) => payment.rideId === rideId && payment.method === "cash" && payment.status === "paid"),
    "admin payments should include completed cash ride payment"
  );

  const driverEarnings = await request(`/api/driver/earnings?driverId=${encodeURIComponent(approve.captain.id)}`);
  assert(driverEarnings.summary?.totalEarnings >= status.ride.fareIls, "driver earnings should include completed ride amount");
  assert(driverEarnings.summary?.completedRides >= 1, "driver earnings should include completed rides count");

  const driverWalletTransactions = await request(`/api/driver/wallet-transactions?driverId=${encodeURIComponent(approve.captain.id)}`);
  assert(
    driverWalletTransactions.transactions.some((transaction) => transaction.referenceId === rideId && transaction.type === "credit"),
    "driver wallet transactions should include completed ride credit"
  );

  const visaRide = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify({ ...ridePayload, pickup: "Visa A", destination: "Visa B", paymentMethod: "visa" })
  });
  const visaPaymentEvent = waitForSocketEvent(socket, "payment:created");
  const paidVisaRide = await request(`/api/rides/${visaRide.ride.id}/pay`, {
    method: "POST",
    body: JSON.stringify({ method: "visa-placeholder", paymentMethodId: savedMethod.method.id })
  });
  const visaPaymentPayload = await visaPaymentEvent;
  assert(paidVisaRide.payment?.method === "visa", "ride pay should normalize VISA placeholder to visa method");
  assert(paidVisaRide.payment?.provider === "visa-placeholder", "ride pay should use visa-placeholder provider");
  assert(visaPaymentPayload.payment?.rideId === visaRide.ride.id, "ride pay should emit payment:created");

  const customerPayments = await request(`/api/customer/payments?phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(login.user.id)}`);
  assert(
    customerPayments.payments.some((payment) => payment.id === paidVisaRide.payment.id),
    "customer payments should include paid VISA placeholder ride"
  );

  const supportCreatedEvent = waitForSocketEvent(socket, "support:ticket-created");
  const ticket = await request("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ name: "Smoke Customer", phone, role: "customer", type: "ride_issue", message: "Need help", rideId })
  });
  const supportCreatedPayload = await supportCreatedEvent;
  const ticketId = ticket.ticket?.id;
  assert(ticket.ticket?.status === "open", "support ticket should start open");
  assert(ticket.ticket?.role === "customer", "customer support ticket should persist customer role");
  assert(ticket.ticket?.rideId === rideId, "customer support ticket should persist linked ride id");
  assert(supportCreatedPayload.ticket?.id === ticketId, "support:ticket-created should emit new support ticket");

  const myCustomerTickets = await request(`/api/support/my-tickets?phone=${encodeURIComponent(phone)}&role=customer`);
  assert(
    myCustomerTickets.tickets.some((supportTicket) => supportTicket.id === ticketId),
    "customer support tickets should include the customer's ticket"
  );

  const driverSupportCreatedEvent = waitForSocketEvent(socket, "support:ticket-created");
  const driverTicket = await request("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Captain",
      phone: captainPhone,
      role: "driver",
      type: "gps_issue",
      message: "GPS needs help",
      rideId
    })
  });
  await driverSupportCreatedEvent;
  assert(driverTicket.ticket?.role === "driver", "driver support ticket should persist driver role");

  const myDriverTickets = await request(`/api/support/my-tickets?phone=${encodeURIComponent(captainPhone)}&role=driver`);
  assert(
    myDriverTickets.tickets.some((supportTicket) => supportTicket.id === driverTicket.ticket.id),
    "driver support tickets should include the driver's ticket"
  );

  const supportUpdatedEvent = waitForSocketEvent(socket, "support:ticket-updated");
  const closedTicket = await request(`/api/admin/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "closed" })
  });
  const supportUpdatedPayload = await supportUpdatedEvent;
  assert(closedTicket.ticket?.status === "closed", "admin support ticket patch should close a ticket");
  assert(supportUpdatedPayload.ticket?.status === "closed", "support:ticket-updated should emit closed support ticket");

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
    persistedRides.rides.some((persistedRide) => persistedRide.id === rideId && persistedRide.status === "completed" && persistedRide.driverId === approve.captain.id),
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
  if (socket) socket.close();
  await stopServer(child);
  fs.rmSync(smokeDbPath, { force: true });
  fs.rmSync(`${smokeDbPath}-shm`, { force: true });
  fs.rmSync(`${smokeDbPath}-wal`, { force: true });
}
