import { io } from "socket.io-client";

const RIDE_EVENTS = [
  "ride:created",
  "ride:accepted",
  "ride:status-updated",
  "ride:cancelled",
  "ride:completed"
];

const DRIVER_EVENTS = ["driver:online-status-updated"];
const DRIVER_LOCATION_EVENTS = ["driver:location-updated", "driver:location-unavailable"];
const SUPPORT_EVENTS = ["support:ticket-created", "support:ticket-updated"];
const PAYMENT_EVENTS = ["payment:created", "payment:updated", "wallet:updated"];
const ADMIN_EVENTS = [
  "admin:captain-application-created",
  "admin:captain-application-reviewed",
  ...RIDE_EVENTS,
  ...DRIVER_EVENTS,
  ...DRIVER_LOCATION_EVENTS,
  ...SUPPORT_EVENTS,
  ...PAYMENT_EVENTS
];

let socket = null;

export function connectSocket({ customerId = "", customerPhone = "", driverId = "", rideId = "", isAdmin = false, onConnectionChange } = {}) {
  if (!socket) {
    socket = io("/", {
      path: "/socket.io",
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 3000,
      transports: ["websocket", "polling"]
    });
  }

  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");

  socket.on("connect", () => {
    onConnectionChange?.(true);
    if (customerId || customerPhone) socket.emit("join:customer", { customerId, customerPhone });
    if (driverId) socket.emit("join:driver", { driverId });
    if (rideId) socket.emit("join:ride", { rideId });
    if (isAdmin) socket.emit("join:admin");
  });

  socket.on("disconnect", () => onConnectionChange?.(false));
  socket.on("connect_error", () => onConnectionChange?.(false));

  if (!socket.connected && !socket.active) socket.connect();
  if (socket.connected) {
    if (customerId || customerPhone) socket.emit("join:customer", { customerId, customerPhone });
    if (driverId) socket.emit("join:driver", { driverId });
    if (rideId) socket.emit("join:ride", { rideId });
    if (isAdmin) socket.emit("join:admin");
  }

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

function subscribe(events, handler) {
  if (!socket) return () => {};
  const wrappedHandlers = events.map((eventName) => {
    const wrapped = (payload) => handler(payload, eventName);
    socket.on(eventName, wrapped);
    return [eventName, wrapped];
  });
  return () => {
    for (const [eventName, wrapped] of wrappedHandlers) {
      socket?.off(eventName, wrapped);
    }
  };
}

export function subscribeToRideEvents(handler) {
  return subscribe(RIDE_EVENTS, handler);
}

export function subscribeToDriverEvents(handler) {
  return subscribe(DRIVER_EVENTS, handler);
}

export function subscribeToDriverLocationEvents(handler) {
  return subscribe(DRIVER_LOCATION_EVENTS, handler);
}

export function subscribeToSupportEvents(handler) {
  return subscribe(SUPPORT_EVENTS, handler);
}

export function subscribeToPaymentEvents(handler) {
  return subscribe(PAYMENT_EVENTS, handler);
}

export function subscribeToAdminEvents(handler) {
  return subscribe(ADMIN_EVENTS, handler);
}

export function sendDriverLocationUpdate({ rideId, driverId, lat, lng, timestamp = new Date().toISOString() } = {}) {
  if (!socket?.connected || !rideId || !driverId) return false;
  socket.emit("driver:location-updated", { rideId, driverId, lat, lng, timestamp });
  return true;
}

export function sendDriverLocationUnavailable({ rideId = "", driverId = "", reason = "gps-unavailable", timestamp = new Date().toISOString() } = {}) {
  if (!socket?.connected) return false;
  socket.emit("driver:location-unavailable", { rideId, driverId, reason, timestamp });
  return true;
}

export function getSocketConnectionState() {
  return Boolean(socket?.connected);
}
