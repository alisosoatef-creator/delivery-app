export function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      arName TEXT NOT NULL,
      enName TEXT NOT NULL,
      demand INTEGER NOT NULL DEFAULT 0,
      baseFare REAL NOT NULL DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      city TEXT,
      age INTEGER,
      birthDate TEXT,
      password TEXT NOT NULL DEFAULT '',
      passwordHash TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      status TEXT NOT NULL DEFAULT 'active',
      isVerified INTEGER NOT NULL DEFAULT 0,
      trips INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'auth',
      expiresAt TEXT,
      usedAt TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS captain_applications (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      age INTEGER NOT NULL,
      vehicleType TEXT NOT NULL,
      vehiclePlate TEXT,
      experienceYears INTEGER,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      reviewedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      applicationId TEXT UNIQUE,
      fullName TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      vehicleType TEXT,
      vehiclePlate TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      onlineStatus TEXT NOT NULL DEFAULT 'offline',
      rating REAL NOT NULL DEFAULT 4.8,
      distanceKm REAL NOT NULL DEFAULT 2.4,
      etaMinutes INTEGER NOT NULL DEFAULT 7,
      lat REAL,
      lng REAL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rides (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      customerName TEXT,
      customerPhone TEXT,
      driverId TEXT,
      pickup TEXT NOT NULL,
      destination TEXT NOT NULL,
      city TEXT NOT NULL,
      pickupLat REAL,
      pickupLng REAL,
      destinationLat REAL,
      destinationLng REAL,
      distanceKm REAL NOT NULL DEFAULT 0,
      routeDistanceKm REAL,
      durationMinutes INTEGER,
      price REAL NOT NULL DEFAULT 0,
      paymentMethod TEXT NOT NULL DEFAULT 'cash',
      status TEXT NOT NULL DEFAULT 'searching',
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      acceptedAt TEXT,
      cancelledAt TEXT,
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      type TEXT NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      rideId TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      closedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      cityId TEXT NOT NULL UNIQUE,
      cityName TEXT NOT NULL,
      baseFare REAL NOT NULL,
      pricePerKm REAL NOT NULL,
      minimumFare REAL NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      appName TEXT NOT NULL,
      appStatus TEXT NOT NULL,
      supportPhone TEXT NOT NULL,
      welcomeMessage TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}
