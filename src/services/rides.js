import { estimatePickupDestinationDistance } from "../utils/mapUtils.js";

export function localQuote(state) {
  const city = state.cities.find((item) => item.id === state.cityId) || state.cities[0];
  const distanceKm = state.routeInfo?.routeDistanceKm || estimatePickupDestinationDistance(state) || 5.8;
  const surge = city.demand > 85 ? 1.16 : city.demand > 70 ? 1.08 : 1;
  return {
    fareIls: Math.max(15, Math.round((city.baseFare + distanceKm * 2.35) * surge)),
    distanceKm,
    etaMinutes: 7
  };
}
