CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  status TEXT NOT NULL DEFAULT 'active',
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'auth',
  expires_at TIMESTAMP,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 5,
  online INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 0,
  last_lat REAL,
  last_lng REAL,
  last_seen_at TIMESTAMP
);

CREATE TABLE rides (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id),
  driver_id TEXT REFERENCES drivers(id),
  city TEXT NOT NULL,
  pickup_label TEXT NOT NULL,
  dropoff_label TEXT NOT NULL,
  pickup_lat REAL NOT NULL,
  pickup_lng REAL NOT NULL,
  dropoff_lat REAL NOT NULL,
  dropoff_lng REAL NOT NULL,
  distance_km REAL NOT NULL,
  route_distance_km REAL,
  duration_minutes INTEGER,
  fare_ils INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'searching', 'accepted', 'driver_arriving', 'arrived', 'in_progress', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'wallet', 'visa')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  accepted_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  balance_ils INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  rideId TEXT NOT NULL REFERENCES rides(id),
  customerId TEXT,
  customerPhone TEXT,
  driverId TEXT,
  amount REAL NOT NULL DEFAULT 0,
  method TEXT NOT NULL CHECK (method IN ('cash', 'visa', 'wallet')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  provider TEXT NOT NULL DEFAULT 'cash/manual',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE wallet_transactions (
  id TEXT PRIMARY KEY,
  userId TEXT,
  userPhone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver')) DEFAULT 'customer',
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'hold', 'release', 'refund', 'payout')),
  amount REAL NOT NULL DEFAULT 0,
  referenceType TEXT,
  referenceId TEXT,
  note TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE saved_payment_methods (
  id TEXT PRIMARY KEY,
  userId TEXT,
  userPhone TEXT,
  type TEXT NOT NULL CHECK (type IN ('visa')) DEFAULT 'visa',
  cardholderName TEXT,
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'VISA',
  expiryMonth TEXT,
  expiryYear TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  ride_id TEXT NOT NULL REFERENCES rides(id),
  from_user_id TEXT NOT NULL REFERENCES users(id),
  to_user_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver')) DEFAULT 'customer',
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  ride_id TEXT REFERENCES rides(id),
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE TABLE admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_city_online ON drivers(city, online);
CREATE INDEX idx_rides_city_status ON rides(city, status);
CREATE INDEX idx_rides_customer ON rides(customer_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_support_tickets_phone_role ON support_tickets(phone, role);
