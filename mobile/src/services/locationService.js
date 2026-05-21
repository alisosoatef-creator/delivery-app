import * as Location from "expo-location";
import { pointFromCity } from "../utils/locationUtils";

export async function requestCurrentLocation(cityId = "nablus") {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return {
      ok: false,
      denied: true,
      fallback: pointFromCity(cityId),
      message: "لم يتم السماح بالوصول للموقع. تم استخدام موقع افتراضي للمدينة."
    };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    ok: true,
    location: {
      label: "موقعي الحالي",
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      source: "gps"
    }
  };
}

export async function startDriverLocationWatch(onLocation, onError) {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    onError?.("gps-denied");
    return null;
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 25,
      timeInterval: 8000
    },
    (position) => {
      onLocation?.({
        label: "موقع الكابتن الحالي",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
        source: "driver-gps"
      });
    }
  );
}
