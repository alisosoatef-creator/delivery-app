import { apiGet } from "./apiClient.js";

export function fetchBootstrap() {
  return apiGet("/bootstrap");
}
