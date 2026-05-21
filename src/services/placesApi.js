import { searchFallbackPlaces } from "../utils/localPlaces.js";
import { apiGet } from "./apiClient.js";

export async function searchPlaces({ city = "", q = "" } = {}) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (q) params.set("q", q);
  const query = params.toString();

  try {
    const payload = await apiGet(`/places/search${query ? `?${query}` : ""}`);
    return payload?.places?.length ? payload.places : searchFallbackPlaces({ city, q });
  } catch {
    return searchFallbackPlaces({ city, q });
  }
}
