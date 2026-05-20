import { Server } from "socket.io";

let io = null;

function safeRoomValue(value) {
  return String(value || "").trim();
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

export function realtimeInfo() {
  return { enabled: Boolean(io), transport: "socket.io" };
}
