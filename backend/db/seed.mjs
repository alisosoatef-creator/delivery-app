import {
  adminRides,
  cities,
  customers,
  drivers,
  pricingRules,
  supportTickets,
  systemSettings
} from "../data.mjs";

function tableCount(db, tableName) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
}

function nowIso() {
  return new Date().toISOString();
}

export function seedDatabase(db) {
  if (tableCount(db, "cities") === 0) {
    const insertCity = db.prepare(`
      INSERT INTO cities (id, arName, enName, demand, baseFare)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const city of cities) {
      insertCity.run(city.id, city.ar, city.en, city.demand, city.baseFare);
    }
  }

  if (tableCount(db, "pricing_rules") === 0) {
    const insertPricing = db.prepare(`
      INSERT INTO pricing_rules (id, cityId, cityName, baseFare, pricePerKm, minimumFare, isActive, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rule of pricingRules) {
      const city = cities.find((item) => item.id === rule.cityId);
      insertPricing.run(
        rule.id,
        rule.cityId,
        city?.en || rule.cityId,
        rule.baseFareIls,
        rule.perKmIls,
        rule.minimumFareIls,
        1,
        rule.updatedAt || nowIso()
      );
    }
  }

  if (tableCount(db, "system_settings") === 0) {
    db.prepare(`
      INSERT INTO system_settings (id, appName, appStatus, supportPhone, welcomeMessage, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "default",
      systemSettings.appName,
      systemSettings.appStatus,
      systemSettings.adminSupportPhone,
      systemSettings.welcomeMessage,
      nowIso()
    );
  }

  if (tableCount(db, "drivers") === 0) {
    const insertDriver = db.prepare(`
      INSERT INTO drivers (
        id, applicationId, fullName, phone, city, vehicleType, vehiclePlate, status,
        onlineStatus, rating, distanceKm, etaMinutes, lat, lng, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const driver of drivers) {
      insertDriver.run(
        driver.id,
        null,
        driver.nameEn || driver.nameAr,
        "",
        driver.cityId,
        driver.vehicle,
        driver.plate,
        "active",
        driver.online ? "online" : "offline",
        driver.rating,
        driver.distanceKm,
        driver.etaMinutes,
        driver.lat,
        driver.lng,
        nowIso()
      );
    }
  }

  if (tableCount(db, "users") === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, fullName, phone, city, age, birthDate, password, role, status, isVerified, trips, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const customer of customers) {
      insertUser.run(
        customer.id,
        customer.fullName,
        customer.phone,
        customer.cityId,
        null,
        "",
        "demo123",
        "customer",
        customer.status,
        1,
        customer.trips || 0,
        nowIso()
      );
    }
  }

  if (tableCount(db, "rides") === 0) {
    const insertRide = db.prepare(`
      INSERT INTO rides (
        id, customerName, customerPhone, driverId, pickup, destination, city, distanceKm,
        price, paymentMethod, status, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ride of adminRides) {
      insertRide.run(
        ride.id,
        "Seed Customer",
        "",
        ride.driverId,
        "City center",
        "Destination",
        ride.cityId,
        5.8,
        ride.fareIls,
        "cash",
        ride.status,
        nowIso(),
        nowIso()
      );
    }
  }

  if (tableCount(db, "support_tickets") === 0) {
    const insertTicket = db.prepare(`
      INSERT INTO support_tickets (id, name, phone, type, message, status, createdAt, closedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ticket of supportTickets) {
      insertTicket.run(
        ticket.id,
        ticket.userName,
        "",
        ticket.type,
        ticket.message,
        ticket.status,
        ticket.createdAt || nowIso(),
        ticket.status === "closed" ? nowIso() : null
      );
    }
  }
}
