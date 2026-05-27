import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hashPassword } from "../auth/passwords.mjs";
import { backendConfig } from "../config.mjs";
import { RIDE_STATUSES, isTerminalRideStatus, isValidRideStatus, normalizeRideStatus } from "../rideStatus.mjs";
import { createSchema } from "./schema.mjs";
import { seedDatabase } from "./seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Default local database file: backend/dev.sqlite
const defaultDbPath = path.resolve(__dirname, "../dev.sqlite");

export const dbPath = backendConfig.sqliteDbPath || defaultDbPath;
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

createSchema(db);
migrateDatabase(db);
seedDatabase(db);
normalizeExistingCityReferences();

function tableColumns(database, tableName) {
  return database.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function migrateDatabase(database) {
  const userColumns = tableColumns(database, "users");
  if (!userColumns.includes("passwordHash")) {
    database.exec("ALTER TABLE users ADD COLUMN passwordHash TEXT;");
  }

  const rideColumns = tableColumns(database, "rides");
  const rideMigrations = [
    ["customerId", "TEXT"],
    ["pickupLat", "REAL"],
    ["pickupLng", "REAL"],
    ["destinationLat", "REAL"],
    ["destinationLng", "REAL"],
    ["routeDistanceKm", "REAL"],
    ["durationMinutes", "INTEGER"],
    ["acceptedAt", "TEXT"],
    ["cancelledAt", "TEXT"],
    ["completedAt", "TEXT"]
  ];

  for (const [columnName, columnType] of rideMigrations) {
    if (!rideColumns.includes(columnName)) {
      database.exec(`ALTER TABLE rides ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  const supportColumns = tableColumns(database, "support_tickets");
  const supportMigrations = [
    ["role", "TEXT NOT NULL DEFAULT 'customer'"],
    ["rideId", "TEXT"],
    ["updatedAt", "TEXT"]
  ];

  for (const [columnName, columnType] of supportMigrations) {
    if (!supportColumns.includes(columnName)) {
      database.exec(`ALTER TABLE support_tickets ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  const paymentColumns = tableColumns(database, "payments");
  const paymentMigrations = [
    ["customerId", "TEXT"],
    ["customerPhone", "TEXT"],
    ["driverId", "TEXT"],
    ["provider", "TEXT NOT NULL DEFAULT 'cash/manual'"],
    ["updatedAt", "TEXT"]
  ];

  for (const [columnName, columnType] of paymentMigrations) {
    if (!paymentColumns.includes(columnName)) {
      database.exec(`ALTER TABLE payments ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  const walletColumns = tableColumns(database, "wallet_transactions");
  const walletMigrations = [
    ["userId", "TEXT"],
    ["userPhone", "TEXT"],
    ["role", "TEXT NOT NULL DEFAULT 'customer'"],
    ["referenceType", "TEXT"],
    ["referenceId", "TEXT"],
    ["note", "TEXT"]
  ];

  for (const [columnName, columnType] of walletMigrations) {
    if (!walletColumns.includes(columnName)) {
      database.exec(`ALTER TABLE wallet_transactions ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  const savedPaymentMethodColumns = tableColumns(database, "saved_payment_methods");
  const savedPaymentMethodMigrations = [
    ["userId", "TEXT"],
    ["userPhone", "TEXT"],
    ["cardholderName", "TEXT"],
    ["last4", "TEXT NOT NULL DEFAULT ''"],
    ["brand", "TEXT NOT NULL DEFAULT 'VISA'"],
    ["expiryMonth", "TEXT"],
    ["expiryYear", "TEXT"]
  ];

  for (const [columnName, columnType] of savedPaymentMethodMigrations) {
    if (!savedPaymentMethodColumns.includes(columnName)) {
      database.exec(`ALTER TABLE saved_payment_methods ADD COLUMN ${columnName} ${columnType};`);
    }
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

function numberOrNull(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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

function normalizeLookupValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeCityId(value, fallback = "nablus") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  const comparable = normalizeLookupValue(raw);
  const cities = many("SELECT id, arName, enName FROM cities");
  const match = cities.find((city) =>
    normalizeLookupValue(city.id) === comparable ||
    normalizeLookupValue(city.arName) === comparable ||
    normalizeLookupValue(city.enName) === comparable
  );
  return match?.id || raw;
}

function normalizeExistingCityReferences() {
  const cityTables = [
    ["users", "city"],
    ["drivers", "city"],
    ["captain_applications", "city"],
    ["rides", "city"]
  ];
  for (const [tableName, columnName] of cityTables) {
    const rows = many(`SELECT id, ${columnName} AS city FROM ${tableName}`);
    const update = db.prepare(`UPDATE ${tableName} SET ${columnName} = ? WHERE id = ?`);
    for (const row of rows) {
      const normalizedCity = normalizeCityId(row.city, row.city || "nablus");
      if (normalizedCity && normalizedCity !== row.city) {
        update.run(normalizedCity, row.id);
      }
    }
  }
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
  const onlineStatus = row.status === "active" && row.onlineStatus === "online" ? "online" : "offline";
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
    onlineStatus,
    online: onlineStatus === "online",
    availability: onlineStatus,
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
  const routeDistanceKm = row.routeDistanceKm ?? row.distanceKm ?? 0;
  const durationMinutes = row.durationMinutes ?? null;
  const hasAcceptedDriver = Boolean(row.driverId) && !["searching", "cancelled", "canceled"].includes(row.status);
  const driver = hasAcceptedDriver ? getDriver(row.driverId) : null;
  return {
    id: row.id,
    customerId: row.customerId || "",
    customer: row.customerName || "Customer",
    customerName: row.customerName || "Customer",
    customerPhone: row.customerPhone || "",
    driverId: row.driverId || null,
    driver,
    driverName: driver?.fullName || driver?.nameAr || "",
    captain: hasAcceptedDriver ? driver?.fullName || row.driverId : "Pending captain acceptance",
    pickup: row.pickup,
    destination: row.destination,
    dropoff: row.destination,
    city: row.city,
    cityId: row.city,
    pickupLat: row.pickupLat ?? null,
    pickupLng: row.pickupLng ?? null,
    destinationLat: row.destinationLat ?? null,
    destinationLng: row.destinationLng ?? null,
    distanceKm: row.distanceKm,
    routeDistanceKm,
    durationMinutes,
    etaMinutes: durationMinutes,
    price: row.price,
    fareIls: row.price,
    paymentMethod: row.paymentMethod,
    status: row.status,
    dispatchStatus: row.driverId ? "assigned" : row.status === "searching" ? "searching" : "not_assigned",
    hasAcceptedDriver,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    acceptedAt: row.acceptedAt || undefined,
    cancelledAt: row.cancelledAt || undefined,
    completedAt: row.completedAt || undefined
  };
}

function supportTicketRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    userName: row.name,
    phone: row.phone || "",
    role: row.role || "customer",
    type: row.type,
    message: row.message,
    rideId: row.rideId || "",
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt || undefined,
    closedAt: row.closedAt || undefined
  };
}

function paymentRow(row) {
  if (!row) return null;
  const amount = Number(row.amount || 0);
  return {
    id: row.id,
    rideId: row.rideId,
    customerId: row.customerId || "",
    customerPhone: row.customerPhone || "",
    customerName: row.customerName || "",
    driverId: row.driverId || "",
    driverName: row.driverName || "",
    amount,
    amountIls: amount,
    method: row.method || "cash",
    status: row.status || "pending",
    provider: row.provider || "cash/manual",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt || row.createdAt
  };
}

function walletTransactionRow(row) {
  if (!row) return null;
  const amount = Number(row.amount || 0);
  return {
    id: row.id,
    userId: row.userId || "",
    userPhone: row.userPhone || "",
    role: row.role || "customer",
    type: row.type,
    amount,
    amountIls: amount,
    referenceType: row.referenceType || "",
    referenceId: row.referenceId || "",
    note: row.note || "",
    createdAt: row.createdAt
  };
}

function savedPaymentMethodRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId || "",
    userPhone: row.userPhone || "",
    type: row.type || "visa",
    cardholderName: row.cardholderName || "",
    last4: row.last4 || "",
    brand: row.brand || "VISA",
    expiryMonth: row.expiryMonth || "",
    expiryYear: row.expiryYear || "",
    createdAt: row.createdAt
  };
}

function normalizePaymentMethod(method = "cash") {
  const normalized = String(method || "cash").trim().toLowerCase();
  if (normalized === "visa-placeholder" || normalized === "visa") return "visa";
  if (normalized === "wallet") return "wallet";
  return "cash";
}

function paymentProvider(method = "cash", requestedMethod = "") {
  const requested = String(requestedMethod || "").trim().toLowerCase();
  if (requested === "visa-placeholder" || method === "visa") return "visa-placeholder";
  if (method === "wallet") return "wallet/internal";
  return "cash/manual";
}

function paidWalletTypes() {
  return new Set(["credit", "refund", "release"]);
}

const ACTIVE_DRIVER_RIDE_STATUSES = new Set([
  RIDE_STATUSES.accepted,
  RIDE_STATUSES.driverArriving,
  RIDE_STATUSES.arrived,
  RIDE_STATUSES.inProgress
]);

function validDispatchCoordinate(point) {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function dispatchCoordinateFromRide(ride) {
  const lat = Number(ride?.pickupLat);
  const lng = Number(ride?.pickupLng);
  return validDispatchCoordinate({ lat, lng }) ? { lat, lng } : null;
}

function haversineDispatchKm(from, to) {
  if (!validDispatchCoordinate(from) || !validDispatchCoordinate(to)) return null;
  const earthRadiusKm = 6371;
  const toRadians = (value) => (Number(value) * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rankDispatchRides(rides, driverLocation = null) {
  if (!validDispatchCoordinate(driverLocation)) return rides;
  return rides
    .map((ride) => {
      const pickupPoint = dispatchCoordinateFromRide(ride);
      const dispatchDistanceKm = haversineDispatchKm(driverLocation, pickupPoint);
      return {
        ...ride,
        dispatchDistanceKm: dispatchDistanceKm === null ? null : Number(dispatchDistanceKm.toFixed(2))
      };
    })
    .sort((first, second) => {
      const firstDistance = Number.isFinite(first.dispatchDistanceKm) ? first.dispatchDistanceKm : Number.POSITIVE_INFINITY;
      const secondDistance = Number.isFinite(second.dispatchDistanceKm) ? second.dispatchDistanceKm : Number.POSITIVE_INFINITY;
      if (firstDistance !== secondDistance) return firstDistance - secondDistance;
      return String(first.createdAt || "").localeCompare(String(second.createdAt || ""));
    });
}

export function normalizeDispatchCityId(value = "") {
  const normalizedCity = normalizeCityId(value, "");
  if (!normalizedCity) return "";
  const city = one("SELECT id FROM cities WHERE id = ?", normalizedCity);
  return city?.id || "";
}

export function databaseInfo() {
  return { engine: "sqlite", path: dbPath };
}

export function listCities() {
  return many("SELECT * FROM cities ORDER BY id").map(cityRow);
}

export function getCity(cityId = "nablus") {
  return cityRow(one("SELECT * FROM cities WHERE id = ?", normalizeCityId(cityId))) || listCities()[0];
}

export function listPricingRules() {
  return many("SELECT * FROM pricing_rules ORDER BY cityId").map(pricingRow);
}

export function getPricingRule(cityId = "nablus") {
  return pricingRow(one("SELECT * FROM pricing_rules WHERE cityId = ? AND isActive = 1", normalizeCityId(cityId)));
}

export function getPricingRuleByCity(cityId = "nablus") {
  return pricingRow(one("SELECT * FROM pricing_rules WHERE cityId = ?", normalizeCityId(cityId)));
}

export function updatePricingRule(cityId, patch) {
  const normalizedCityId = normalizeCityId(cityId);
  const current = getPricingRuleByCity(normalizedCityId);
  if (!current) return null;
  const nextBaseFare = patch.baseFareIls ?? patch.baseFare ?? current.baseFare;
  const nextPricePerKm = patch.perKmIls ?? patch.pricePerKm ?? current.pricePerKm;
  const nextMinimumFare = patch.minimumFareIls ?? patch.minimumFare ?? current.minimumFare;
  const nextIsActive = typeof patch.isActive === "boolean" ? (patch.isActive ? 1 : 0) : current.isActive ? 1 : 0;
  const updatedAt = nowIso();
  run(
    `
      UPDATE pricing_rules
      SET baseFare = ?, pricePerKm = ?, minimumFare = ?, isActive = ?, updatedAt = ?
      WHERE cityId = ?
    `,
    nextBaseFare,
    nextPricePerKm,
    nextMinimumFare,
    nextIsActive,
    updatedAt,
    normalizedCityId
  );
  return getPricingRuleByCity(normalizedCityId);
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

export function updateSystemSettings(patch = {}) {
  const current = getSystemSettings();
  const nextSettings = {
    appName: patch.appName ?? current.appName,
    appStatus: patch.appStatus ?? current.appStatus,
    supportPhone: patch.supportPhone ?? patch.adminSupportPhone ?? current.supportPhone,
    welcomeMessage: patch.welcomeMessage ?? current.welcomeMessage
  };

  run(
    `
      UPDATE system_settings
      SET appName = ?, appStatus = ?, supportPhone = ?, welcomeMessage = ?, updatedAt = ?
      WHERE id = 'default'
    `,
    nextSettings.appName,
    nextSettings.appStatus,
    nextSettings.supportPhone,
    nextSettings.welcomeMessage,
    nowIso()
  );

  return getSystemSettings();
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
    normalizeCityId(body.cityId || body.city || "nablus"),
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
    normalizeCityId(body.city),
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
  const existingUser = findUserByPhone(application.phone);
  if (!existingUser) {
    run(
      `
        INSERT INTO users (id, fullName, phone, city, age, birthDate, password, passwordHash, role, status, isVerified, trips, createdAt)
        VALUES (?, ?, ?, ?, ?, '', '', '', 'driver', 'active', 1, 0, ?)
      `,
      `usr_driver_${randomUUID()}`,
      application.fullName,
      application.phone,
      normalizeCityId(application.city),
      application.age ?? null,
      nowIso()
    );
  }
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
    normalizeCityId(application.city),
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

export function getDriverByPhone(phone) {
  return driverRow(one(
    `
      SELECT drivers.*, cities.enName AS cityName
      FROM drivers
      LEFT JOIN cities ON cities.id = drivers.city
      WHERE drivers.phone = ?
      LIMIT 1
    `,
    phone
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
  const requestedOnlineStatus =
    typeof patch.online === "boolean"
      ? (patch.online ? "online" : "offline")
      : patch.onlineStatus || current.onlineStatus || "offline";
  const onlineStatus = status === "active" && requestedOnlineStatus === "online" ? "online" : "offline";
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

export function insertRide(body, quote) {
  const id = `ride_${randomUUID()}`;
  const createdAt = nowIso();
  const distanceKm = numberOrNull(body.distanceKm) ?? numberOrNull(quote.distanceKm) ?? 0;
  const routeDistanceKm = numberOrNull(body.routeDistanceKm) ?? distanceKm;
  const durationMinutes = numberOrNull(body.durationMinutes) ?? numberOrNull(quote.etaMinutes);
  const pickupLabel = body.pickupLabel || body.pickup || "Pickup point";
  const destinationLabel = body.destinationLabel || body.destination || body.dropoff || "Destination point";
  run(
    `
      INSERT INTO rides (
        id, customerId, customerName, customerPhone, driverId, pickup, destination, city,
        pickupLat, pickupLng, destinationLat, destinationLng, distanceKm, routeDistanceKm, durationMinutes,
        price, paymentMethod, status, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    body.customerId || "",
    body.customerName || body.customer || "Customer",
    body.customerPhone || body.phone || "",
    null,
    pickupLabel,
    destinationLabel,
    quote.cityId,
    numberOrNull(body.pickupLat),
    numberOrNull(body.pickupLng),
    numberOrNull(body.destinationLat),
    numberOrNull(body.destinationLng),
    distanceKm,
    routeDistanceKm,
    durationMinutes,
    quote.fareIls,
    body.paymentMethod || "cash",
    RIDE_STATUSES.searching,
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

export function listAvailableRides({ cityId = "", driverLocation = null } = {}) {
  const normalizedCity = cityId ? normalizeCityId(cityId) : "";
  const query = normalizedCity
    ? "SELECT * FROM rides WHERE status = 'searching' AND driverId IS NULL AND city = ? ORDER BY createdAt ASC"
    : "SELECT * FROM rides WHERE status = 'searching' AND driverId IS NULL ORDER BY createdAt ASC";
  const rides = (normalizedCity ? many(query, normalizedCity) : many(query)).map(rideRow);
  return rankDispatchRides(rides, driverLocation);
}

export function listCustomerRides({ customerId = "", customerPhone = "" } = {}) {
  const normalizedCustomerId = String(customerId || "").trim();
  const normalizedPhone = String(customerPhone || "").trim();
  if (!normalizedCustomerId && !normalizedPhone) return [];
  return many(
    `
      SELECT * FROM rides
      WHERE (? != '' AND customerId = ?) OR (? != '' AND customerPhone = ?)
      ORDER BY createdAt DESC
    `,
    normalizedCustomerId,
    normalizedCustomerId,
    normalizedPhone,
    normalizedPhone
  ).map(rideRow);
}

export function listDriverRequests(cityId = "nablus") {
  return listAvailableRides({ cityId });
}

export function updateRideStatus(rideId, status) {
  const current = getRide(rideId);
  if (!current) return null;
  const nextStatus = normalizeRideStatus(status);
  if (!isValidRideStatus(nextStatus)) return null;
  if (isTerminalRideStatus(current.status) && normalizeRideStatus(current.status) !== nextStatus) return null;
  const updatedAt = nowIso();
  run(
    `
      UPDATE rides
      SET status = ?,
          updatedAt = ?,
          cancelledAt = CASE WHEN ? = 'cancelled' THEN ? ELSE cancelledAt END,
          completedAt = CASE WHEN ? = 'completed' THEN ? ELSE completedAt END
      WHERE id = ?
    `,
    nextStatus,
    updatedAt,
    nextStatus,
    updatedAt,
    nextStatus,
    updatedAt,
    rideId
  );
  return getRide(rideId);
}

export function acceptRide(rideId, driverId) {
  const current = getRide(rideId);
  const driver = getDriver(driverId);
  if (!current || !driver || driver.status !== "active" || driver.onlineStatus !== "online" || current.status !== RIDE_STATUSES.searching || current.driverId) return null;
  const updatedAt = nowIso();
  run(
    `
      UPDATE rides
      SET driverId = ?, status = 'accepted', acceptedAt = ?, updatedAt = ?
      WHERE id = ?
    `,
    driver.id,
    updatedAt,
    updatedAt,
    rideId
  );
  return getRide(rideId);
}

const DRIVER_RIDE_STATUS_TRANSITIONS = Object.freeze({
  [RIDE_STATUSES.accepted]: [RIDE_STATUSES.driverArriving, RIDE_STATUSES.cancelled],
  [RIDE_STATUSES.driverArriving]: [RIDE_STATUSES.arrived],
  [RIDE_STATUSES.arrived]: [RIDE_STATUSES.inProgress],
  [RIDE_STATUSES.inProgress]: [RIDE_STATUSES.completed],
  [RIDE_STATUSES.searching]: [RIDE_STATUSES.cancelled]
});

export function listDriverRides({ driverId = "", phone = "" } = {}) {
  const driver = driverId ? getDriver(driverId) : phone ? getDriverByPhone(phone) : null;
  if (!driver) return [];
  return many("SELECT * FROM rides WHERE driverId = ? ORDER BY createdAt DESC", driver.id).map(rideRow);
}

export function listDriverActiveRides({ driverId = "", phone = "" } = {}) {
  const driver = driverId ? getDriver(driverId) : phone ? getDriverByPhone(phone) : null;
  if (!driver) return [];
  return many(
    `
      SELECT * FROM rides
      WHERE driverId = ?
        AND status IN ('accepted', 'driver_arriving', 'arrived', 'in_progress')
      ORDER BY updatedAt DESC, createdAt DESC
    `,
    driver.id
  ).map(rideRow);
}

export function getDriverActiveRide(driverId = "") {
  return listDriverActiveRides({ driverId }).find((ride) => ACTIVE_DRIVER_RIDE_STATUSES.has(ride.status)) || null;
}

export function updateDriverRideStatus(rideId, { driverId, status }) {
  const current = getRide(rideId);
  const driver = getDriver(driverId);
  const nextStatus = normalizeRideStatus(status);
  if (!current || !driver || !isValidRideStatus(nextStatus)) return null;
  if (current.driverId && current.driverId !== driver.id) return null;
  if (!current.driverId && current.status !== RIDE_STATUSES.searching) return null;
  const allowedNextStatuses = DRIVER_RIDE_STATUS_TRANSITIONS[normalizeRideStatus(current.status)] || [];
  if (!allowedNextStatuses.includes(nextStatus)) return null;

  const updatedAt = nowIso();
  const nextDriverId = current.driverId || driver.id;
  run(
    `
      UPDATE rides
      SET driverId = ?,
          status = ?,
          updatedAt = ?,
          acceptedAt = CASE WHEN ? = 'accepted' AND acceptedAt IS NULL THEN ? ELSE acceptedAt END,
          cancelledAt = CASE WHEN ? = 'cancelled' THEN ? ELSE cancelledAt END,
          completedAt = CASE WHEN ? = 'completed' THEN ? ELSE completedAt END
      WHERE id = ?
    `,
    nextDriverId,
    nextStatus,
    updatedAt,
    nextStatus,
    updatedAt,
    nextStatus,
    updatedAt,
    nextStatus,
    updatedAt,
    rideId
  );
  return getRide(rideId);
}

export function insertSupportTicket(body) {
  const id = `support_${randomUUID()}`;
  const createdAt = nowIso();
  const role = ["customer", "driver"].includes(body.role) ? body.role : "customer";
  run(
    `
      INSERT INTO support_tickets (id, name, phone, role, type, message, rideId, status, createdAt, updatedAt, closedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)
    `,
    id,
    body.userName || body.name || "Guest",
    body.phone || "",
    role,
    body.type || "general",
    body.message || "",
    body.rideId || "",
    createdAt,
    createdAt,
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

export function listMySupportTickets({ phone = "", role = "" } = {}) {
  const normalizedPhone = String(phone || "").trim();
  const normalizedRole = String(role || "").trim();
  if (!normalizedPhone) return [];
  return many(
    `
      SELECT * FROM support_tickets
      WHERE phone = ? AND (? = '' OR role = ?)
      ORDER BY createdAt DESC
    `,
    normalizedPhone,
    normalizedRole,
    normalizedRole
  ).map(supportTicketRow);
}

export function updateSupportTicketStatus(ticketId, status = "closed") {
  const nextStatus = status === "open" ? "open" : "closed";
  const updatedAt = nowIso();
  run(
    "UPDATE support_tickets SET status = ?, updatedAt = ?, closedAt = ? WHERE id = ?",
    nextStatus,
    updatedAt,
    nextStatus === "closed" ? updatedAt : null,
    ticketId
  );
  return getSupportTicket(ticketId);
}

export function getPayment(paymentId) {
  return paymentRow(one(
    `
      SELECT payments.*, rides.customerName, drivers.fullName AS driverName
      FROM payments
      LEFT JOIN rides ON rides.id = payments.rideId
      LEFT JOIN drivers ON drivers.id = payments.driverId
      WHERE payments.id = ?
    `,
    paymentId
  ));
}

export function getPaymentByRide(rideId) {
  return paymentRow(one(
    `
      SELECT payments.*, rides.customerName, drivers.fullName AS driverName
      FROM payments
      LEFT JOIN rides ON rides.id = payments.rideId
      LEFT JOIN drivers ON drivers.id = payments.driverId
      WHERE payments.rideId = ?
      ORDER BY payments.createdAt DESC
      LIMIT 1
    `,
    rideId
  ));
}

export function listPayments({ customerId = "", customerPhone = "", driverId = "" } = {}) {
  const filters = [];
  const params = [];
  if (customerId) {
    filters.push("(payments.customerId = ? OR rides.customerId = ?)");
    params.push(customerId, customerId);
  }
  if (customerPhone) {
    filters.push("(payments.customerPhone = ? OR rides.customerPhone = ?)");
    params.push(customerPhone, customerPhone);
  }
  if (driverId) {
    filters.push("(payments.driverId = ? OR rides.driverId = ?)");
    params.push(driverId, driverId);
  }
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return many(
    `
      SELECT payments.*, rides.customerName, drivers.fullName AS driverName
      FROM payments
      LEFT JOIN rides ON rides.id = payments.rideId
      LEFT JOIN drivers ON drivers.id = payments.driverId
      ${whereClause}
      ORDER BY payments.createdAt DESC
    `,
    ...params
  ).map(paymentRow);
}

export function createWalletTransaction(body = {}) {
  const id = `wallet_tx_${randomUUID()}`;
  run(
    `
      INSERT INTO wallet_transactions (
        id, userId, userPhone, role, type, amount, referenceType, referenceId, note, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    body.userId || "",
    body.userPhone || "",
    body.role || "customer",
    body.type || "credit",
    Number(body.amount || 0),
    body.referenceType || "",
    body.referenceId || "",
    body.note || "",
    nowIso()
  );
  return walletTransactionRow(one("SELECT * FROM wallet_transactions WHERE id = ?", id));
}

function ensureDriverEarningForPayment(payment) {
  if (!payment?.driverId || payment.status !== "paid") return null;
  const existing = one(
    `
      SELECT * FROM wallet_transactions
      WHERE role = 'driver' AND type = 'credit' AND referenceType = 'ride' AND referenceId = ? AND userId = ?
      LIMIT 1
    `,
    payment.rideId,
    payment.driverId
  );
  if (existing) return walletTransactionRow(existing);

  const driver = getDriver(payment.driverId);
  return createWalletTransaction({
    userId: payment.driverId,
    userPhone: driver?.phone || "",
    role: "driver",
    type: "credit",
    amount: payment.amount,
    referenceType: "ride",
    referenceId: payment.rideId,
    note: `Development earning for ride ${payment.rideId}`
  });
}

export function ensurePaymentForRide(rideOrId, options = {}) {
  const ride = typeof rideOrId === "string" ? getRide(rideOrId) : rideOrId;
  if (!ride?.id) return { payment: null, walletTransaction: null, created: false };

  const requestedMethod = options.method || options.paymentMethod || ride.paymentMethod || "cash";
  const method = normalizePaymentMethod(requestedMethod);
  const provider = options.provider || paymentProvider(method, requestedMethod);
  const amount = Number(options.amount ?? ride.fareIls ?? ride.price ?? 0);
  const nextStatus = options.status || options.paymentStatus || (ride.status === RIDE_STATUSES.completed || options.forcePaid ? "paid" : "pending");
  const timestamp = nowIso();
  const existing = one("SELECT * FROM payments WHERE rideId = ? ORDER BY createdAt DESC LIMIT 1", ride.id);

  if (existing) {
    const shouldPromote = nextStatus === "paid" && existing.status !== "paid";
    if (
      shouldPromote ||
      existing.method !== method ||
      existing.provider !== provider ||
      existing.driverId !== (ride.driverId || "")
    ) {
      run(
        `
          UPDATE payments
          SET method = ?, status = ?, provider = ?, driverId = ?, amount = ?, updatedAt = ?
          WHERE id = ?
        `,
        method,
        shouldPromote ? "paid" : existing.status,
        provider,
        ride.driverId || "",
        amount,
        timestamp,
        existing.id
      );
    }
    const payment = getPayment(existing.id);
    return { payment, walletTransaction: ensureDriverEarningForPayment(payment), created: false };
  }

  const id = `payment_${randomUUID()}`;
  run(
    `
      INSERT INTO payments (
        id, rideId, customerId, customerPhone, driverId, amount, method, status, provider, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    ride.id,
    ride.customerId || "",
    ride.customerPhone || "",
    ride.driverId || "",
    amount,
    method,
    nextStatus,
    provider,
    timestamp,
    timestamp
  );

  const payment = getPayment(id);
  return { payment, walletTransaction: ensureDriverEarningForPayment(payment), created: true };
}

export function createRidePayment(rideId, body = {}) {
  return ensurePaymentForRide(rideId, {
    method: body.method || body.paymentMethod || "cash",
    status: "paid",
    forcePaid: true,
    provider: body.provider
  });
}

export function updatePaymentStatus(paymentId, status = "paid") {
  const nextStatus = ["pending", "paid", "failed", "refunded"].includes(status) ? status : "paid";
  run("UPDATE payments SET status = ?, updatedAt = ? WHERE id = ?", nextStatus, nowIso(), paymentId);
  const payment = getPayment(paymentId);
  const walletTransaction = ensureDriverEarningForPayment(payment);
  return { payment, walletTransaction };
}

export function listWalletTransactions({ userId = "", userPhone = "", role = "", driverId = "" } = {}) {
  let normalizedUserId = String(userId || "").trim();
  let normalizedPhone = String(userPhone || "").trim();
  let normalizedRole = String(role || "").trim();

  if (driverId) {
    const driver = getDriver(driverId);
    normalizedUserId = driver?.id || driverId;
    normalizedPhone = driver?.phone || normalizedPhone;
    normalizedRole = "driver";
  }

  const filters = [];
  const params = [];
  if (normalizedUserId) {
    filters.push("userId = ?");
    params.push(normalizedUserId);
  }
  if (normalizedPhone) {
    filters.push("userPhone = ?");
    params.push(normalizedPhone);
  }
  if (normalizedRole) {
    filters.push("role = ?");
    params.push(normalizedRole);
  }
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return many(
    `
      SELECT * FROM wallet_transactions
      ${whereClause}
      ORDER BY createdAt DESC
    `,
    ...params
  ).map(walletTransactionRow);
}

export function getCustomerWallet({ userId = "", phone = "" } = {}) {
  const transactions = listWalletTransactions({ userId, userPhone: phone, role: "customer" });
  const positiveTypes = paidWalletTypes();
  const devStartingBalance = 120;
  const balance = transactions.reduce((sum, transaction) => {
    const amount = Number(transaction.amount || 0);
    return positiveTypes.has(transaction.type) ? sum + amount : sum - amount;
  }, devStartingBalance);
  return {
    userId,
    phone,
    role: "customer",
    currency: "ILS",
    balance,
    balanceIls: balance,
    transactions
  };
}

export function createSavedPaymentMethod(body = {}) {
  const digits = String(body.cardNumber || body.last4 || "").replace(/\D/g, "");
  const last4 = digits.slice(-4);
  if (!last4 || last4.length !== 4) return null;

  const id = `pay_method_${randomUUID()}`;
  run(
    `
      INSERT INTO saved_payment_methods (
        id, userId, userPhone, type, cardholderName, last4, brand, expiryMonth, expiryYear, createdAt
      )
      VALUES (?, ?, ?, 'visa', ?, ?, ?, ?, ?, ?)
    `,
    id,
    body.userId || "",
    body.userPhone || body.phone || "",
    body.cardholderName || "",
    last4,
    body.brand || "VISA",
    body.expiryMonth || "",
    body.expiryYear || "",
    nowIso()
  );
  return savedPaymentMethodRow(one("SELECT * FROM saved_payment_methods WHERE id = ?", id));
}

export function listSavedPaymentMethods({ userId = "", phone = "" } = {}) {
  const normalizedUserId = String(userId || "").trim();
  const normalizedPhone = String(phone || "").trim();
  if (!normalizedUserId && !normalizedPhone) return [];
  return many(
    `
      SELECT * FROM saved_payment_methods
      WHERE (? != '' AND userId = ?) OR (? != '' AND userPhone = ?)
      ORDER BY createdAt DESC
    `,
    normalizedUserId,
    normalizedUserId,
    normalizedPhone,
    normalizedPhone
  ).map(savedPaymentMethodRow);
}

export function deleteSavedPaymentMethod(methodId, { userId = "", phone = "" } = {}) {
  const method = savedPaymentMethodRow(one("SELECT * FROM saved_payment_methods WHERE id = ?", methodId));
  if (!method) return false;
  const canDelete =
    (!userId && !phone) ||
    (userId && method.userId === userId) ||
    (phone && method.userPhone === phone);
  if (!canDelete) return false;
  run("DELETE FROM saved_payment_methods WHERE id = ?", methodId);
  return true;
}

export function driverEarnings({ driverId = "", phone = "" } = {}) {
  const driver = driverId ? getDriver(driverId) : phone ? getDriverByPhone(phone) : null;
  if (!driver) {
    return {
      driver: null,
      summary: { totalEarnings: 0, todayEarnings: 0, completedRides: 0, currency: "ILS" },
      transactions: []
    };
  }

  const payments = listPayments({ driverId: driver.id }).filter((payment) => payment.status === "paid");
  const transactions = listWalletTransactions({ driverId: driver.id });
  const completedRides = many("SELECT * FROM rides WHERE driverId = ? AND status = 'completed'", driver.id).map(rideRow);
  const totalEarnings = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayEarnings = payments
    .filter((payment) => String(payment.createdAt || "").startsWith(today))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return {
    driver,
    summary: {
      totalEarnings,
      totalEarningsIls: totalEarnings,
      todayEarnings,
      todayEarningsIls: todayEarnings,
      completedRides: completedRides.length,
      currency: "ILS"
    },
    payments,
    transactions
  };
}

export function adminPaymentsOverview() {
  const payments = listPayments();
  const walletTransactions = listWalletTransactions();
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const sumByMethod = (method) =>
    paidPayments
      .filter((payment) => payment.method === method)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return {
    payments,
    walletTransactions,
    summary: {
      cashTotal: sumByMethod("cash"),
      visaTotal: sumByMethod("visa"),
      walletTotal: sumByMethod("wallet"),
      totalPaid: paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      paymentCount: payments.length,
      pendingCount: payments.filter((payment) => payment.status === "pending").length,
      currency: "ILS"
    }
  };
}

function cleanupDelete(sql, ...params) {
  const result = run(sql, ...params);
  return Number(result?.changes || 0);
}

export function cleanupAdminRecords(type = "") {
  const deletedCounts = {
    rides: 0,
    supportTickets: 0,
    payments: 0,
    walletTransactions: 0,
    savedPaymentMethods: 0
  };

  if (type === "completedRides") {
    deletedCounts.payments += cleanupDelete("DELETE FROM payments WHERE rideId IN (SELECT id FROM rides WHERE status = 'completed')");
    deletedCounts.walletTransactions += cleanupDelete("DELETE FROM wallet_transactions WHERE referenceId IN (SELECT id FROM rides WHERE status = 'completed')");
    deletedCounts.supportTickets += cleanupDelete("DELETE FROM support_tickets WHERE rideId IN (SELECT id FROM rides WHERE status = 'completed')");
    deletedCounts.rides += cleanupDelete("DELETE FROM rides WHERE status = 'completed'");
    return deletedCounts;
  }

  if (type === "cancelledRides") {
    deletedCounts.payments += cleanupDelete("DELETE FROM payments WHERE rideId IN (SELECT id FROM rides WHERE status IN ('cancelled', 'canceled'))");
    deletedCounts.walletTransactions += cleanupDelete("DELETE FROM wallet_transactions WHERE referenceId IN (SELECT id FROM rides WHERE status IN ('cancelled', 'canceled'))");
    deletedCounts.supportTickets += cleanupDelete("DELETE FROM support_tickets WHERE rideId IN (SELECT id FROM rides WHERE status IN ('cancelled', 'canceled'))");
    deletedCounts.rides += cleanupDelete("DELETE FROM rides WHERE status IN ('cancelled', 'canceled')");
    return deletedCounts;
  }

  if (type === "closedSupportTickets") {
    deletedCounts.supportTickets += cleanupDelete("DELETE FROM support_tickets WHERE status = 'closed'");
    return deletedCounts;
  }

  if (type === "demoPayments") {
    deletedCounts.walletTransactions += cleanupDelete(
      "DELETE FROM wallet_transactions WHERE referenceType = 'payment' AND referenceId IN (SELECT id FROM payments WHERE provider = 'visa-placeholder' OR method = 'visa')"
    );
    deletedCounts.payments += cleanupDelete("DELETE FROM payments WHERE provider = 'visa-placeholder' OR method = 'visa'");
    deletedCounts.savedPaymentMethods += cleanupDelete("DELETE FROM saved_payment_methods WHERE type = 'visa'");
    return deletedCounts;
  }

  if (type === "allDemoData") {
    deletedCounts.walletTransactions += cleanupDelete("DELETE FROM wallet_transactions");
    deletedCounts.payments += cleanupDelete("DELETE FROM payments");
    deletedCounts.savedPaymentMethods += cleanupDelete("DELETE FROM saved_payment_methods");
    deletedCounts.supportTickets += cleanupDelete("DELETE FROM support_tickets");
    deletedCounts.rides += cleanupDelete("DELETE FROM rides");
    return deletedCounts;
  }

  return null;
}

export function adminOverview() {
  const activeRides = one("SELECT COUNT(*) AS count FROM rides WHERE status NOT IN ('completed', 'cancelled', 'canceled')").count;
  const todayRevenueIls = one("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'").total;
  const todayRides = one("SELECT COUNT(*) AS count FROM rides").count;
  const pendingCaptainApplications = one("SELECT COUNT(*) AS count FROM captain_applications WHERE status = 'pending'").count;
  const openSupportTickets = one("SELECT COUNT(*) AS count FROM support_tickets WHERE status = 'open'").count;
  return {
    activeRides,
    onlineDrivers: listDrivers().filter((driver) => driver.online).length,
    todayRevenueIls,
    todayRides,
    estimatedRevenue: todayRevenueIls,
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
