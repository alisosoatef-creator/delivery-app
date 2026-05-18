import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hashPassword } from "../auth/passwords.mjs";
import { createSchema } from "./schema.mjs";
import { seedDatabase } from "./seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Default local database file: backend/dev.sqlite
const defaultDbPath = path.resolve(__dirname, "../dev.sqlite");

export const dbPath = process.env.WASEL_DB_PATH || defaultDbPath;
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

createSchema(db);
migrateDatabase(db);
seedDatabase(db);

function tableColumns(database, tableName) {
  return database.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function migrateDatabase(database) {
  const userColumns = tableColumns(database, "users");
  if (!userColumns.includes("passwordHash")) {
    database.exec("ALTER TABLE users ADD COLUMN passwordHash TEXT;");
  }

  const legacyUsers = database
    .prepare("SELECT id, password FROM users WHERE password IS NOT NULL AND password != '' AND (passwordHash IS NULL OR passwordHash = '')")
    .all();
  const updateUserPassword = database.prepare("UPDATE users SET passwordHash = ?, password = '' WHERE id = ?");
  for (const user of legacyUsers) {
    updateUserPassword.run(hashPassword(user.password), user.id);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function bool(value) {
  return Boolean(Number(value));
}

function one(sql, ...params) {
  return db.prepare(sql).get(...params);
}

function many(sql, ...params) {
  return db.prepare(sql).all(...params);
}

function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}

function cityRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    ar: row.arName,
    en: row.enName,
    demand: row.demand,
    baseFare: row.baseFare
  };
}

function pricingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cityId: row.cityId,
    cityName: row.cityName,
    baseFare: row.baseFare,
    baseFareIls: row.baseFare,
    pricePerKm: row.pricePerKm,
    perKmIls: row.pricePerKm,
    minimumFare: row.minimumFare,
    minimumFareIls: row.minimumFare,
    isActive: bool(row.isActive),
    updatedAt: row.updatedAt
  };
}

export function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, isVerified, city, ...safeUser } = user;
  return {
    ...safeUser,
    city,
    cityId: city,
    name: user.fullName,
    verified: bool(isVerified),
    isVerified: bool(isVerified)
  };
}

function captainApplicationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    city: row.city,
    cityLabel: row.cityName || row.city,
    age: row.age,
    vehicleType: row.vehicleType,
    vehiclePlate: row.vehiclePlate || "",
    experienceYears: row.experienceYears ?? "",
    notes: row.notes || "",
    status: row.status,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt || undefined
  };
}

function driverRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    applicationId: row.applicationId || undefined,
    fullName: row.fullName,
    nameAr: row.fullName,
    nameEn: row.fullName,
    phone: row.phone || "",
    city: row.city,
    cityId: row.city,
    cityLabel: row.cityName || row.city,
    vehicle: row.vehicleType,
    vehicleType: row.vehicleType,
    plate: row.vehiclePlate || "Not provided",
    vehiclePlate: row.vehiclePlate || "",
    status: row.status,
    onlineStatus: row.onlineStatus,
    online: row.onlineStatus === "online",
    availability: row.onlineStatus,
    rating: row.rating,
    distanceKm: row.distanceKm,
    etaMinutes: row.etaMinutes,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.createdAt
  };
}

function rideRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    customer: row.customerName || "Customer",
    customerName: row.customerName || "Customer",
    customerPhone: row.customerPhone || "",
    driverId: row.driverId || null,
    captain: row.driverId || "Pending captain acceptance",
    pickup: row.pickup,
    destination: row.destination,
    dropoff: row.destination,
    city: row.city,
    cityId: row.city,
    distanceKm: row.distanceKm,
    price: row.price,
    fareIls: row.price,
    paymentMethod: row.paymentMethod,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function supportTicketRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    userName: row.name,
    phone: row.phone || "",
    type: row.type,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    closedAt: row.closedAt || undefined
  };
}

export function databaseInfo() {
  return { engine: "sqlite", path: dbPath };
}

export function listCities() {
  return many("SELECT * FROM cities ORDER BY id").map(cityRow);
}

export function getCity(cityId = "nablus") {
  return cityRow(one("SELECT * FROM cities WHERE id = ?", cityId)) || listCities()[0];
}

export function listPricingRules() {
  return many("SELECT * FROM pricing_rules ORDER BY cityId").map(pricingRow);
}

export function getPricingRule(cityId = "nablus") {
  return pricingRow(one("SELECT * FROM pricing_rules WHERE cityId = ? AND isActive = 1", cityId));
}

export function updatePricingRule(cityId, patch) {
  const current = getPricingRule(cityId);
  if (!current) return null;
  const nextBaseFare = patch.baseFareIls ?? patch.baseFare ?? current.baseFare;
  const nextPricePerKm = patch.perKmIls ?? patch.pricePerKm ?? current.pricePerKm;
  const nextMinimumFare = patch.minimumFareIls ?? patch.minimumFare ?? current.minimumFare;
  const updatedAt = nowIso();
  run(
    `
      UPDATE pricing_rules
      SET baseFare = ?, pricePerKm = ?, minimumFare = ?, updatedAt = ?
      WHERE cityId = ?
    `,
    nextBaseFare,
    nextPricePerKm,
    nextMinimumFare,
    updatedAt,
    cityId
  );
  return getPricingRule(cityId);
}

export function getSystemSettings() {
  const row = one("SELECT * FROM system_settings WHERE id = 'default'");
  return {
    appName: row.appName,
    appStatus: row.appStatus,
    supportPhone: row.supportPhone,
    adminSupportPhone: row.supportPhone,
    welcomeMessage: row.welcomeMessage,
    notificationsPlaceholder: true,
    updatedAt: row.updatedAt
  };
}

export function createOtpCode({ phone, purpose = "auth", code = "1234" }) {
  const id = `otp_${randomUUID()}`;
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  run(
    `
      INSERT INTO otp_codes (id, phone, code, purpose, expiresAt, usedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    phone,
    code,
    purpose,
    expiresAt,
    null,
    createdAt
  );
  return id;
}

export function findOtpCode(id) {
  return one("SELECT * FROM otp_codes WHERE id = ?", id);
}

export function findOtpCodeByPhone({ phone, code }) {
  return one(
    `
      SELECT * FROM otp_codes
      WHERE phone = ? AND code = ? AND usedAt IS NULL
      ORDER BY createdAt DESC
      LIMIT 1
    `,
    phone,
    code
  );
}

export function markOtpUsed(id) {
  run("UPDATE otp_codes SET usedAt = ? WHERE id = ?", nowIso(), id);
}

export function findUserByPhone(phone) {
  return one("SELECT * FROM users WHERE phone = ?", phone);
}

export function createOrUpdateCustomerUser(body) {
  const createdAt = nowIso();
  run(
    `
      INSERT INTO users (id, fullName, phone, city, age, birthDate, password, passwordHash, role, status, isVerified, trips, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, '', ?, 'customer', 'active', 0, 0, ?)
    `,
    `usr_${randomUUID()}`,
    body.fullName,
    body.phone,
    body.cityId || body.city || "nablus",
    body.age ?? null,
    body.birthDate || "",
    body.passwordHash,
    createdAt
  );
  return one("SELECT * FROM users WHERE phone = ?", body.phone);
}

export function findUserByIdentifier(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return one(
    `
      SELECT * FROM users
      WHERE lower(phone) = ? OR lower(fullName) = ? OR lower(id) = ?
      LIMIT 1
    `,
    normalized,
    normalized,
    normalized
  );
}

export function verifyUserByPhone(phone) {
  run("UPDATE users SET isVerified = 1 WHERE phone = ?", phone);
  return one("SELECT * FROM users WHERE phone = ?", phone);
}

export function listCustomers() {
  return many("SELECT * FROM users WHERE role = 'customer' ORDER BY createdAt DESC").map(publicUser);
}

export function updateCustomerStatus(customerId, status = "active") {
  run("UPDATE users SET status = ? WHERE id = ? AND role = 'customer'", status, customerId);
  return publicUser(one("SELECT * FROM users WHERE id = ? AND role = 'customer'", customerId));
}

export function insertCaptainApplication(body) {
  const id = `captain_app_${randomUUID()}`;
  run(
    `
      INSERT INTO captain_applications (
        id, fullName, phone, city, age, vehicleType, vehiclePlate, experienceYears, notes, status, createdAt, reviewedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `,
    id,
    body.fullName,
    body.phone,
    body.city,
    Number(body.age),
    body.vehicleType,
    body.vehiclePlate || "",
    body.experienceYears === "" || body.experienceYears == null ? null : Number(body.experienceYears),
    body.notes || "",
    nowIso(),
    null
  );
  return getCaptainApplication(id);
}

export function getCaptainApplication(applicationId) {
  return captainApplicationRow(one(
    `
      SELECT captain_applications.*, cities.enName AS cityName
      FROM captain_applications
      LEFT JOIN cities ON cities.id = captain_applications.city
      WHERE captain_applications.id = ?
    `,
    applicationId
  ));
}

export function listCaptainApplications() {
  return many(`
    SELECT captain_applications.*, cities.enName AS cityName
    FROM captain_applications
    LEFT JOIN cities ON cities.id = captain_applications.city
    ORDER BY captain_applications.createdAt DESC
  `).map(captainApplicationRow);
}

export function updateCaptainApplicationStatus(applicationId, status) {
  run(
    "UPDATE captain_applications SET status = ?, reviewedAt = ? WHERE id = ?",
    status,
    nowIso(),
    applicationId
  );
  return getCaptainApplication(applicationId);
}

export function createDriverFromApplication(application) {
  const existing = one("SELECT * FROM drivers WHERE applicationId = ?", application.id);
  if (existing) return driverRow(existing);
  const id = `captain_${application.id}`;
  run(
    `
      INSERT INTO drivers (
        id, applicationId, fullName, phone, city, vehicleType, vehiclePlate, status,
        onlineStatus, rating, distanceKm, etaMinutes, lat, lng, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'offline', 4.8, 2.4, 7, ?, ?, ?)
    `,
    id,
    application.id,
    application.fullName,
    application.phone,
    application.city,
    application.vehicleType,
    application.vehiclePlate || "",
    null,
    null,
    nowIso()
  );
  return getDriver(id);
}

export function getDriver(driverId) {
  return driverRow(one(
    `
      SELECT drivers.*, cities.enName AS cityName
      FROM drivers
      LEFT JOIN cities ON cities.id = drivers.city
      WHERE drivers.id = ?
    `,
    driverId
  ));
}

export function listDrivers() {
  return many(`
    SELECT drivers.*, cities.enName AS cityName
    FROM drivers
    LEFT JOIN cities ON cities.id = drivers.city
    ORDER BY drivers.createdAt ASC
  `).map(driverRow);
}

export function updateDriverStatus(driverId, patch = {}) {
  const current = getDriver(driverId);
  if (!current) return null;
  const status = patch.status || current.status || "active";
  const onlineStatus =
    typeof patch.online === "boolean" ? (patch.online ? "online" : "offline") : patch.onlineStatus || current.onlineStatus || "offline";
  run("UPDATE drivers SET status = ?, onlineStatus = ? WHERE id = ?", status, onlineStatus, driverId);
  return getDriver(driverId);
}

export function updateDriverLocation(driverId, lat, lng) {
  run("UPDATE drivers SET lat = ?, lng = ? WHERE id = ?", lat, lng, driverId);
  return getDriver(driverId);
}

export function listNearbyDrivers(cityId = "nablus") {
  return listDrivers()
    .filter((driver) => driver.cityId === cityId && driver.online)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function insertRide(body, quote, driver = null) {
  const id = `ride_${randomUUID()}`;
  const createdAt = nowIso();
  run(
    `
      INSERT INTO rides (
        id, customerName, customerPhone, driverId, pickup, destination, city, distanceKm,
        price, paymentMethod, status, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    body.customerName || body.customer || "Customer",
    body.customerPhone || body.phone || "",
    driver?.id || null,
    body.pickup || "An-Najah University",
    body.dropoff || body.destination || "Rafidia",
    quote.cityId,
    quote.distanceKm,
    quote.fareIls,
    body.paymentMethod || "cash",
    driver ? "accepted" : "searching",
    createdAt,
    createdAt
  );
  return getRide(id);
}

export function getRide(rideId) {
  return rideRow(one("SELECT * FROM rides WHERE id = ?", rideId));
}

export function listRides() {
  return many("SELECT * FROM rides ORDER BY createdAt DESC").map(rideRow);
}

export function listDriverRequests(cityId = "nablus") {
  return many("SELECT * FROM rides WHERE city = ? AND status = 'searching' ORDER BY createdAt DESC", cityId).map(rideRow);
}

export function updateRideStatus(rideId, status) {
  run("UPDATE rides SET status = ?, updatedAt = ? WHERE id = ?", status, nowIso(), rideId);
  return getRide(rideId);
}

export function insertSupportTicket(body) {
  const id = `support_${randomUUID()}`;
  run(
    `
      INSERT INTO support_tickets (id, name, phone, type, message, status, createdAt, closedAt)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `,
    id,
    body.userName || body.name || "Guest",
    body.phone || "",
    body.type || "general",
    body.message || "",
    nowIso(),
    null
  );
  return getSupportTicket(id);
}

export function getSupportTicket(ticketId) {
  return supportTicketRow(one("SELECT * FROM support_tickets WHERE id = ?", ticketId));
}

export function listSupportTickets() {
  return many("SELECT * FROM support_tickets ORDER BY createdAt DESC").map(supportTicketRow);
}

export function updateSupportTicketStatus(ticketId, status = "closed") {
  run(
    "UPDATE support_tickets SET status = ?, closedAt = ? WHERE id = ?",
    status,
    status === "closed" ? nowIso() : null,
    ticketId
  );
  return getSupportTicket(ticketId);
}

export function adminOverview() {
  const activeRides = one("SELECT COUNT(*) AS count FROM rides WHERE status != 'completed'").count;
  const todayRevenueIls = one("SELECT COALESCE(SUM(price), 0) AS total FROM rides").total;
  const pendingCaptainApplications = one("SELECT COUNT(*) AS count FROM captain_applications WHERE status = 'pending'").count;
  const openSupportTickets = one("SELECT COUNT(*) AS count FROM support_tickets WHERE status = 'open'").count;
  return {
    activeRides,
    onlineDrivers: listDrivers().filter((driver) => driver.online).length,
    todayRevenueIls,
    customers: listCustomers().length,
    captains: listDrivers().length,
    pendingCaptainApplications,
    openSupportTickets,
    cities: listCities(),
    recentRides: listRides().slice(0, 8)
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  console.log(`wasel-db-ready ${dbPath}`);
}
