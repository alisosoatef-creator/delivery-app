import { apiRequest } from "./apiClient.js";

export async function api(path, options = {}) {
  return apiRequest(path, options);
}
