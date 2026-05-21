export const appConfig = {
  appName: process.env.EXPO_PUBLIC_APP_NAME || "وصل",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001/api",
  otpMode: process.env.EXPO_PUBLIC_OTP_MODE || "dev",
  paymentMode: process.env.EXPO_PUBLIC_PAYMENT_MODE || "placeholder"
};

// Mobile API URL notes:
// - Expo Web/local desktop can use http://127.0.0.1:3001/api.
// - Android emulator usually needs http://10.0.2.2:3001/api.
// - A real phone needs your computer LAN IP, for example http://192.168.1.20:3001/api.
// Keep this client-side value non-secret; Expo exposes EXPO_PUBLIC_* variables.

export function normalizeApiPath(path) {
  const rawPath = String(path || "");
  const withoutApi = rawPath === "/api" ? "" : rawPath.startsWith("/api/") ? rawPath.slice(4) : rawPath;
  return withoutApi.startsWith("/") ? withoutApi : `/${withoutApi}`;
}
