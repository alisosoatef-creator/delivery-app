export function devLogStartup(message, details = {}) {
  if (typeof __DEV__ === "undefined" || !__DEV__) return;
  const safeDetails = { ...details };
  if (safeDetails.token) safeDetails.token = "exists";
  if (safeDetails.password) delete safeDetails.password;
  console.log(`[Wasel Mobile] ${message}`, safeDetails);
}
