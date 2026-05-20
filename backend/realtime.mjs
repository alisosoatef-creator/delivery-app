import { Server } from "socket.io";

let io = null;

function safeRoomValue(value) {
  return String(value || "").trim();
}

function safeCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function rideRooms(ride = {}) {
  const rooms = ["admin"];
  const customerId = safeRoomValue(ride.customerId);
  const customerPhone = safeRoomValue(ride.customerPhone);
  const driverId = safeRoomValue(ride.driverId);
  if (ride.id) rooms.push(`ride:${ride.id}`);
  if (customerId) rooms.push(`customer:${customerId}`);
  if (customerPhone) rooms.push(`customer-phone:${customerPhone}`);
  if (driverId) rooms.push(`driver:${driverId}`);
  if (ride.status === "searching") rooms.push("available-drivers");
  return rooms;
}

export function setupRealtime(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "OPTIONS"]
    }
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:ready", { ok: true, connectedAt: new Date().toISOString() });

    socket.on("join:customer", ({ customerId, customerPhone } = {}) => {
      const id = safeRoomValue(customerId);
      const phone = safeRoomValue(customerPhone);
      if (id) socket.join(`customer:${id}`);
      if (phone) socket.join(`customer-phone:${phone}`);
    });

    socket.on("join:driver", ({ driverId } = {}) => {
      const id = safeRoomValue(driverId);
      if (id) socket.join(`driver:${id}`);
      socket.join("available-drivers");
    });

    socket.on("join:admin", () => {
      socket.join("admin");
    });

    socket.on("join:ride", ({ rideId } = {}) => {
      const id = safeRoomValue(rideId);
      if (id) socket.join(`ride:${id}`);
    });

    socket.on("driver:location-updated", (payload = {}) => {
      const rideId = safeRoomValue(payload.rideId);
      const driverId = safeRoomValue(payload.driverId);
      const lat = safeCoordinate(payload.lat ?? payload.location?.lat);
      const lng = safeCoordinate(payload.lng ?? payload.location?.lng);
      const timestamp = safeRoomValue(payload.timestamp) || new Date().toISOString();

      if (!rideId || !driverId || lat === null || lng === null) {
        emitDriverLocationUnavailable({
          rideId,
          driverId,
          reason: "invalid-location-payload",
          timestamp
        });
        return;
      }

      // TODO production tracking: persist location history with retention rules if dispatch replay is needed.
      emitDriverLocationUpdated({ rideId, driverId, lat, lng, timestamp });
    });

    socket.on("driver:location-unavailable", (payload = {}) => {
      emitDriverLocationUnavailable({
        rideId: safeRoomValue(payload.rideId),
        driverId: safeRoomValue(payload.driverId),
        reason: safeRoomValue(payload.reason) || "gps-unavailable",
        timestamp: safeRoomValue(payload.timestamp) || new Date().toISOString()
      });
    });
  });

  return io;
}

export function emitRideEvent(eventName, { ride, driver = null } = {}) {
  if (!io || !ride) return;
  const payload = {
    event: eventName,
    ride,
    driver: driver || ride.driver || null,
    emittedAt: new Date().toISOString()
  };

  // TODO production realtime: tighten room authorization after real sessions/tokens are added.
  let target = io;
  for (const room of rideRooms(ride)) {
    target = target.to(room);
  }
  target.emit(eventName, payload);
}

export function emitDriverEvent(eventName, payload = {}) {
  if (!io) return;
  const driverId = safeRoomValue(payload.driver?.id || payload.driverId);
  const frame = { event: eventName, ...payload, emittedAt: new Date().toISOString() };
  let target = io.to("admin").to("available-drivers");
  if (driverId) target = target.to(`driver:${driverId}`);
  target.emit(eventName, frame);
}

export function emitDriverLocationUpdated({ rideId, driverId, lat, lng, timestamp } = {}) {
  if (!io || !rideId || !driverId) return;
  const payload = {
    event: "driver:location-updated",
    rideId,
    driverId,
    location: { lat, lng },
    lat,
    lng,
    timestamp: timestamp || new Date().toISOString(),
    emittedAt: new Date().toISOString()
  };
  io.to(`ride:${rideId}`).to(`driver:${driverId}`).to("admin").emit("driver:location-updated", payload);
}

export function emitDriverLocationUnavailable({ rideId, driverId, reason = "gps-unavailable", timestamp } = {}) {
  if (!io) return;
  const payload = {
    event: "driver:location-unavailable",
    rideId,
    driverId,
    reason,
    timestamp: timestamp || new Date().toISOString(),
    emittedAt: new Date().toISOString()
  };
  let target = io.to("admin");
  if (rideId) target = target.to(`ride:${rideId}`);
  if (driverId) target = target.to(`driver:${driverId}`);
  target.emit("driver:location-unavailable", payload);
}

export function emitSupportTicketEvent(eventName, { ticket } = {}) {
  if (!io || !ticket) return;
  const payload = {
    event: eventName,
    ticket,
    emittedAt: new Date().toISOString()
  };
  let target = io.to("admin");
  const phone = safeRoomValue(ticket.phone);
  if (phone) target = target.to(`customer-phone:${phone}`);
  target.emit(eventName, payload);
}

export function emitPaymentEvent(eventName, { payment, walletTransaction = null } = {}) {
  if (!io || !payment) return;
  const payload = {
    event: eventName,
    payment,
    walletTransaction,
    emittedAt: new Date().toISOString()
  };
  const rooms = ["admin"];
  const customerId = safeRoomValue(payment.customerId);
  const customerPhone = safeRoomValue(payment.customerPhone);
  const driverId = safeRoomValue(payment.driverId);
  const rideId = safeRoomValue(payment.rideId);
  if (customerId) rooms.push(`customer:${customerId}`);
  if (customerPhone) rooms.push(`customer-phone:${customerPhone}`);
  if (driverId) rooms.push(`driver:${driverId}`);
  if (rideId) rooms.push(`ride:${rideId}`);

  // TODO production payments: protect payment rooms with real auth and emit only sanitized finance payloads.
  let target = io;
  for (const room of rooms) {
    target = target.to(room);
  }
  target.emit(eventName, payload);
}

export function realtimeInfo() {
  return { enabled: Boolean(io), transport: "socket.io" };
}
