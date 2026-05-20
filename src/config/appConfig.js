export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || import.meta.env.APP_NAME || "Wasel",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  socketUrl: import.meta.env.VITE_SOCKET_URL || "/",
  devAdminEnabled: import.meta.env.DEV && import.meta.env.VITE_DEV_ADMIN_ENABLED !== "false",
  devDriverEnabled: import.meta.env.DEV && import.meta.env.VITE_DEV_DRIVER_ENABLED !== "false",
  otpMode: import.meta.env.VITE_OTP_MODE || "dev",
  paymentMode: import.meta.env.VITE_PAYMENT_MODE || "placeholder",
  routingProvider: import.meta.env.VITE_ROUTING_PROVIDER || "osrm-public-demo"
};
