import { io } from "socket.io-client";
import { appConfig } from "../config/appConfig";

const RIDE_EVENTS = [
  "ride:created",
  "ride:accepted",
  "ride:status-updated",
  "ride:cancelled",
  "ride:completed"
];

const DRIVER_EVENTS = ["driver:online-status-updated", ...RIDE_EVENTS];
const LOCATION_EVENTS = ["driver:location-updated", "driver:location-unavailable"];

let socket = null;
let lastSession = {};

function sessionAuth(session = {}) {
  return {
    token: session.token || "",
    role: session.role || "",
    phone: session.phone || "",
    driverId: session.driverId || "",
    userId: session.userId || session.customerId || ""
  };
}

function joinRooms(client, session = {}) {
  if (!client?.connected) return;
  const customerId = session.customerId || session.userId || "";
  const customerPhone = session.customerPhone || session.phone || "";
  const driverId = session.driverId || "";
  const rideId = session.rideId || "";

  if (session.role === "customer" && (customerId || customerPhone)) {
    client.emit("join:customer", { customerId, customerPhone });
  }
  if (session.role === "driver" && driverId) {
    client.emit("join:driver", { driverId });
  }
  if (session.isAdmin) {
    client.emit("join:admin");
  }
  if (rideId) {
    client.emit("join:ride", { rideId });
  }
}

function notifyConnection(onConnectionChange, status) {
  onConnectionChange?.(status === "connected", status);
}

export function connectMobileSocket(session = {}, { onConnectionChange } = {}) {
  lastSession = { ...lastSession, ...session };
  const auth = sessionAuth(session);

  if (!socket) {
    socket = io(appConfig.socketUrl, {
      path: "/socket.io",
      autoConnect: false,
      auth,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 4000,
      transports: ["websocket", "polling"]
    });
  }

  socket.auth = auth;
  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");
  socket.off("reconnect_attempt");
  socket.off("reconnect_error");
  socket.off("reconnect");

  socket.on("connect", () => {
    notifyConnection(onConnectionChange, "connected");
    joinRooms(socket, lastSession);
  });
  socket.on("disconnect", () => notifyConnection(onConnectionChange, "disconnected"));
  socket.on("connect_error", () => notifyConnection(onConnectionChange, "error"));
  socket.on("reconnect_attempt", () => {
    socket.auth = sessionAuth(lastSession);
    notifyConnection(onConnectionChange, "connecting");
  });
  socket.on("reconnect_error", () => notifyConnection(onConnectionChange, "error"));
  socket.on("reconnect", () => {
    notifyConnection(onConnectionChange, "connected");
    joinRooms(socket, lastSession);
  });

  if (!socket.connected && !socket.active) socket.connect();
  if (!socket.connected) notifyConnection(onConnectionChange, "connecting");
  if (socket.connected) joinRooms(socket, lastSession);

  return socket;
}

export function disconnectMobileSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  lastSession = {};
}

function subscribe(events, handler) {
  if (!socket) return () => {};
  const listeners = events.map((eventName) => {
    const wrapped = (payload) => handler(payload, eventName);
    socket.on(eventName, wrapped);
    return [eventName, wrapped];
  });

  return () => {
    for (const [eventName, wrapped] of listeners) {
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

export function subscribeToLocationEvents(handler) {
  return subscribe(LOCATION_EVENTS, handler);
}

export function joinRideRoom(rideId) {
  if (!socket?.connected || !rideId) return false;
  lastSession = { ...lastSession, rideId };
  socket.emit("join:ride", { rideId });
  return true;
}

export function emitDriverLocation({ rideId, driverId, lat, lng, timestamp = new Date().toISOString() } = {}) {
  if (!socket?.connected || !rideId || !driverId || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return false;
  }
  socket.emit("driver:location-updated", { rideId, driverId, lat: Number(lat), lng: Number(lng), timestamp });
  return true;
}

export function emitDriverLocationUnavailable({ rideId = "", driverId = "", reason = "gps-unavailable", timestamp = new Date().toISOString() } = {}) {
  if (!socket?.connected) return false;
  socket.emit("driver:location-unavailable", { rideId, driverId, reason, timestamp });
  return true;
}

export function getMobileSocketStatus() {
  return socket?.connected ? "connected" : socket?.active ? "connecting" : "disconnected";
}
