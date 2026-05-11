CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'ar',
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
  fare_ils INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('searching', 'accepted', 'arriving', 'picked_up', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'wallet')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  balance_ils INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL REFERENCES wallets(id),
  ride_id TEXT REFERENCES rides(id),
  amount_ils INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('top_up', 'ride_payment', 'driver_earning', 'refund')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
