import { apiGet } from "./apiClient";

export async function searchPlaces({ city = "nablus", q = "" } = {}) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (q) params.set("q", q);
  const payload = await apiGet(`/places/search${params.toString() ? `?${params}` : ""}`);
  return payload?.places || [];
}
