import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSqliteDbPath = path.resolve(__dirname, "dev.sqlite");

function flag(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sqlitePathFromDatabaseUrl(value = "") {
  const url = String(value || "").trim();
  if (!url.startsWith("sqlite:")) return "";
  return url.replace(/^sqlite:(\/\/)?/, "");
}

function list(value, fallback = []) {
  const parsed = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : fallback;
}

const nodeEnv = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL || "";

export const backendConfig = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  host: process.env.HOST || "0.0.0.0",
  port: number(process.env.PORT, 3001),
  appName: process.env.APP_NAME || "Wasel",
  devAdminEnabled: flag(process.env.DEV_ADMIN_ENABLED, nodeEnv !== "production"),
  devDriverEnabled: flag(process.env.DEV_DRIVER_ENABLED, nodeEnv !== "production"),
  otpMode: process.env.OTP_MODE || "dev",
  demoOtpCode: process.env.DEV_OTP_CODE || "1234",
  paymentMode: process.env.PAYMENT_MODE || "placeholder",
  routingProvider: process.env.ROUTING_PROVIDER || "osrm-public-demo",
  databaseUrl,
  sqliteDbPath:
    process.env.SQLITE_DB_PATH ||
    process.env.WASEL_DB_PATH ||
    sqlitePathFromDatabaseUrl(databaseUrl) ||
    defaultSqliteDbPath,
  allowedOrigins: list(process.env.CORS_ORIGINS, [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:4173",
    "http://localhost:4173"
  ])
};
