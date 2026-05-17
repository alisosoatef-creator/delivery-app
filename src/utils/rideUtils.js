import { statusText } from "./i18n.js";



export function tripTimeline(isArabic) {
  return [
    { key: "searching", label: isArabic ? "طلب المشوار" : "Ride requested" },
    { key: "accepted", label: isArabic ? "تم قبول السائق" : "Driver accepted" },
    { key: "arriving", label: isArabic ? "السائق بالطريق" : "Driver on the way" },
    { key: "arrived", label: isArabic ? "وصل السائق" : "Driver arrived" },
    { key: "picked_up", label: isArabic ? "بدأت الرحلة" : "Trip started" },
    { key: "completed", label: isArabic ? "انتهت الرحلة" : "Trip completed" }
  ];
}

export function tripTimelineIndex(status) {
  const indexes = {
    searching: 0,
    accepted: 1,
    arriving: 2,
    arrived: 3,
    picked_up: 4,
    completed: 5
  };
  return indexes[status] ?? 0;
}

export function rideDisplayCode(ride) {
  if (!ride?.id) return "R-0000";
  return `R-${String(ride.id).replace("ride_", "").replace("local_", "").slice(0, 6).toUpperCase()}`;
}

export function rideStatusGroup(status) {
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "active";
}

export function rideDateLabel(ride, index, isArabic) {
  const sourceDate = ride?.createdAt || ride?.completedAt || ride?.updatedAt || ride?.startedAt;
  const fallbackDate = new Date(Date.now() - (index + 1) * 86400000);
  const date = sourceDate ? new Date(sourceDate) : fallbackDate;
  const safeDate = Number.isNaN(date.getTime()) ? fallbackDate : date;
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(safeDate);
}

export function cityNameById(cities, cityId, isArabic) {
  const city = cities.find((item) => item.id === cityId) || cities[0];
  return isArabic ? city?.ar || city?.en || "المدينة" : city?.en || city?.ar || "City";
}

export function findRideDriver(ride, state, selectedDriver) {
  const matchedDriver = state.drivers.find((driver) => driver.id === ride?.driverId);
  if (matchedDriver) return matchedDriver;
  if (ride?.driverId && selectedDriver?.id === ride.driverId) return selectedDriver;
  return null;
}

export function rideHasAcceptedDriver(ride) {
  const status = ride?.status || "";
  return Boolean(ride?.driverId) && !["searching", "cancelled", "canceled"].includes(status);
}

export function driverDisplayName(driver, isArabic) {
  if (!driver) return isArabic ? "سائق واصل" : "Wasel driver";
  return isArabic ? driver.nameAr || driver.nameEn || "سائق واصل" : driver.nameEn || driver.nameAr || "Wasel driver";
}

export function paymentMethodLabel(paymentMethod, isArabic) {
  if (paymentMethod === "visa") return "VISA";
  if (paymentMethod === "wallet") return isArabic ? "محفظة" : "Wallet";
  return isArabic ? "كاش" : "Cash";
}

export function buildRideHistory(state, selectedDriver, isArabic) {
  const currentRide = state.ride ? [{ ...state.ride, isCurrent: true }] : [];
  const sourceRides = [...currentRide, ...(state.admin.recentRides || [])];
  const seen = new Set();

  return sourceRides
    .filter((ride) => {
      const id = ride?.id || `ride_${seen.size}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((ride, index) => {
      const cityName = cityNameById(state.cities, ride.cityId || state.cityId, isArabic);
      const hasAcceptedDriver = rideHasAcceptedDriver(ride);
      const driver = hasAcceptedDriver ? findRideDriver(ride, state, selectedDriver) : null;
      const pickupFallback = isArabic ? `مركز ${cityName}` : `${cityName} center`;
      const dropoffFallback = isArabic ? `وجهة داخل ${cityName}` : `${cityName} destination`;
      const paymentMethod = ride.paymentMethod || state.paymentMethod || "cash";
      const status = ride.status || "completed";

      return {
        id: ride.id || `ride_${index}`,
        raw: ride,
        code: rideDisplayCode(ride),
        pickup: ride.pickup || (ride.isCurrent ? state.pickup : pickupFallback),
        dropoff: ride.dropoff || (ride.isCurrent ? state.dropoff : dropoffFallback),
        dateLabel: rideDateLabel(ride, index, isArabic),
        fareIls: ride.fareIls || state.quote.fareIls,
        distanceKm: ride.distanceKm || state.quote.distanceKm,
        etaMinutes: ride.etaMinutes || state.quote.etaMinutes,
        status,
        statusGroup: rideStatusGroup(status),
        statusLabel: statusText[state.language][status] || status,
        cityName,
        hasAcceptedDriver,
        driver,
        driverName: hasAcceptedDriver
          ? driverDisplayName(driver, isArabic)
          : (isArabic ? "بانتظار قبول الكابتن" : "Pending captain acceptance"),
        paymentMethod,
        paymentLabel: paymentMethodLabel(paymentMethod, isArabic)
      };
    });
}
