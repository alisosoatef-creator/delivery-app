import { useEffect, useMemo, useRef, useState } from "react";
import { getWestBankCityCenter, westBankCityName } from "../../utils/westBankCities.js";
import {
  customerLocationFromState,
  destinationLocationFromState,
  driverLocationFromDriver,
  estimatePickupDestinationDistance,
  formatDistanceKm,
  haversineKm,
  mapLocationCopy,
  normalizeLocation
} from "../../utils/mapUtils.js";
import { fetchRoute } from "../../utils/routeUtils.js";
import { driverDisplayName } from "../../utils/rideUtils.js";
import { LocationPicker } from "./LocationPicker.jsx";
import { RideMap } from "./RideMap.jsx";

function mapPointLabel(kind, point, isArabic) {
  const coordinates = `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
  if (kind === "pickup") {
    return isArabic ? `نقطة محددة على الخريطة (${coordinates})` : `Map pickup point (${coordinates})`;
  }
  return isArabic ? `وجهة محددة على الخريطة (${coordinates})` : `Map destination point (${coordinates})`;
}

export function MapBoard({ state, dispatch = () => {}, selectedDriver, t, isArabic, showDrivers = true }) {
  const mapClassTokens =
    "nablus-live-map west-bank-live-map TileLayer use-my-current-location set-map-point-pickup set-map-point-destination road-route-polyline fallback-route-polyline";
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const [selectedMapPoint, setSelectedMapPoint] = useState(null);
  const [mapSelectionMode, setMapSelectionMode] = useState("pickup");
  const [mapTileError, setMapTileError] = useState(false);
  const driver = showDrivers ? selectedDriver : null;
  const ridePickupLocation = normalizeLocation({ lat: state.ride?.pickupLat, lng: state.ride?.pickupLng }, null);
  const rideDestinationLocation = normalizeLocation({ lat: state.ride?.destinationLat, lng: state.ride?.destinationLng }, null);
  const cityCenter = useMemo(() => getWestBankCityCenter(state.cityId), [state.cityId]);
  const cityName = westBankCityName(state.cityId, isArabic);
  const customerLocation = customerLocationFromState(state);
  const pickupLocation = normalizeLocation(state.pickupLocation, ridePickupLocation);
  const destinationLocation = destinationLocationFromState(state) || rideDestinationLocation;
  const liveDriverLocation =
    state.driverLocation?.rideId && state.ride?.id && state.driverLocation.rideId === state.ride.id
      ? normalizeLocation(state.driverLocation, null)
      : null;
  const driverLocation = liveDriverLocation || driverLocationFromDriver(driver) || driverLocationFromDriver(state.ride?.driver);
  const shouldShowDriverMarker = Boolean(showDrivers && driverLocation);
  const driverAnchorLocation = pickupLocation || customerLocation;
  const driverDistanceKm = shouldShowDriverMarker ? haversineKm(driverAnchorLocation, driverLocation) : null;
  const pickupDestinationDistanceKm = estimatePickupDestinationDistance(state);
  const routeDistanceKm = state.routeInfo?.routeDistanceKm || pickupDestinationDistanceKm;
  const durationMinutes = state.routeInfo?.durationMinutes || null;
  const routeCoordinates = state.routeInfo?.routeCoordinates || null;
  const routeSource = state.routeInfo?.routeSource || (pickupDestinationDistanceKm ? "haversine" : "none");
  const routeStatus = state.routeStatus || "idle";
  const locationStatus = state.locationStatus || "default";
  const locationHint = mapLocationCopy(locationStatus, isArabic);
  void mapRef;
  void mapInstanceRef;
  void customerMarkerRef;
  void pickupMarkerRef;
  void destinationMarkerRef;
  void driverMarkerRef;
  void routeLineRef;
  void mapClassTokens;
  void t;

  useEffect(() => {
    if (!pickupLocation || !destinationLocation) {
      if (state.routeInfo || state.routeStatus !== "idle") {
        dispatch({ type: "patch", patch: { routeInfo: null, routeStatus: "idle", routeError: "" } });
      }
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;
    dispatch({ type: "patch", patch: { routeInfo: null, routeStatus: "loading", routeError: "" } });

    fetchRoute(pickupLocation, destinationLocation, { signal: controller.signal }).then((route) => {
      if (cancelled) return;
      dispatch({
        type: "patch",
        patch: {
          routeInfo: route,
          routeStatus: route.isFallback ? "fallback" : "ready",
          routeError: route.error || ""
        }
      });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [destinationLocation?.lat, destinationLocation?.lng, dispatch, pickupLocation?.lat, pickupLocation?.lng]);

  useEffect(() => {
    setSelectedMapPoint(null);
    dispatch({ type: "patch", patch: { routeInfo: null, routeStatus: "idle", routeError: "" } });
  }, [dispatch, state.cityId]);

  function routePickupLabel(point) {
    const coordinates = `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
    return isArabic ? `نقطة الانطلاق (${coordinates})` : `Pickup point (${coordinates})`;
  }

  function applyMapPoint(kind, point = selectedMapPoint || cityCenter) {
    const normalizedPoint = normalizeLocation(point, cityCenter);
    if (kind === "pickup") {
      dispatch({
        type: "patch",
        patch: {
          pickupLocation: normalizedPoint,
          pickup: mapPointLabel("pickup", normalizedPoint, isArabic),
          routeInfo: null,
          routeStatus: destinationLocation ? "loading" : "idle",
          routeError: ""
        }
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        destinationLocation: normalizedPoint,
        dropoff: mapPointLabel("destination", normalizedPoint, isArabic),
        routeInfo: null,
        routeStatus: pickupLocation ? "loading" : "idle",
        routeError: ""
      }
    });
  }

  function handleMapPointChange(point) {
    setSelectedMapPoint(point);
    applyMapPoint(mapSelectionMode, point);
    setMapSelectionMode(mapSelectionMode === "pickup" ? "destination" : "pickup");
  }

  function requestCurrentLocation() {
    if (!("geolocation" in navigator)) {
      dispatch({
        type: "patch",
        patch: {
          customerLocation: cityCenter,
          pickupLocation: cityCenter,
          pickup: routePickupLabel(cityCenter),
          locationStatus: "unsupported",
          routeInfo: null,
          routeStatus: destinationLocation ? "loading" : "idle",
          routeError: "",
          toast: isArabic ? "المتصفح لا يدعم GPS، سنستخدم مركز المدينة المختارة." : "GPS is not supported, using the selected city center."
        }
      });
      return;
    }

    dispatch({ type: "patch", patch: { locationStatus: "requesting" } });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsPoint = { lat: position.coords.latitude, lng: position.coords.longitude };
        dispatch({
          type: "patch",
          patch: {
            customerLocation: gpsPoint,
            pickupLocation: gpsPoint,
            pickup: routePickupLabel(gpsPoint),
            routeInfo: null,
            routeStatus: destinationLocation ? "loading" : "idle",
            routeError: "",
            locationStatus: "granted",
            toast: isArabic ? "تم تحديد موقعك الحالي عبر GPS." : "Your current GPS location is active."
          }
        });
        setSelectedMapPoint(gpsPoint);
        setMapSelectionMode("destination");
      },
      () => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: cityCenter,
            pickupLocation: cityCenter,
            pickup: routePickupLabel(cityCenter),
            locationStatus: "denied",
            routeInfo: null,
            routeStatus: destinationLocation ? "loading" : "idle",
            routeError: "",
            toast: isArabic ? "لا مشكلة، سنستخدم مركز المدينة المختارة كبديل." : "No problem, using the selected city center as fallback."
          }
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  return (
    <div className="map-board real-map-board">
      <RideMap
        cityCenter={cityCenter}
        customerLocation={customerLocation}
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        driverLocation={driverLocation}
        driverAnchorLocation={driverAnchorLocation}
        routeCoordinates={routeCoordinates}
        routeSource={routeSource}
        onMapPointChange={handleMapPointChange}
        onTileError={() => setMapTileError(true)}
        isArabic={isArabic}
        showDrivers={showDrivers}
      />
      <div className="map-compass">N</div>
      <LocationPicker
        cityName={cityName}
        distanceKm={routeDistanceKm}
        durationMinutes={durationMinutes}
        gpsStatus={locationStatus}
        isArabic={isArabic}
        mapSelectionMode={mapSelectionMode}
        onUseCurrentLocation={requestCurrentLocation}
        onSelectMode={setMapSelectionMode}
        onSetPickup={() => applyMapPoint("pickup")}
        onSetDestination={() => applyMapPoint("destination")}
        routeSource={routeSource}
        routeStatus={routeStatus}
        selectedMapPoint={selectedMapPoint}
      />
      {mapTileError && (
        <p className="map-offline-note">
          {isArabic ? "تحتاج خرائط OpenStreetMap إلى إنترنت لتحميل البلاطات. ستبقى نقاطك محفوظة حتى يعود الاتصال." : "OpenStreetMap tiles need internet. Your selected points remain available until the map loads again."}
        </p>
      )}
      <div className="map-sheet real-map-sheet">
        <span>{showDrivers ? (isArabic ? "تتبع الكابتن" : "Captain tracking") : (isArabic ? "معاينة المسار" : "Route preview")}</span>
        <strong>{driver ? driverDisplayName(driver, isArabic) : cityName}</strong>
        <div className="map-route-summary">
          <small>{state.pickup}</small>
          <small>{state.dropoff}</small>
          {routeStatus === "loading" && (
            <small>{isArabic ? "جاري حساب مسار الطرق..." : "Calculating road route..."}</small>
          )}
          {routeDistanceKm !== null && (
            <small>
              {routeSource === "osrm" ? (isArabic ? "المسافة عبر الطرق" : "Road distance") : (isArabic ? "المسافة التقديرية الخطية" : "Straight-line fallback distance")}: {formatDistanceKm(routeDistanceKm)} km
            </small>
          )}
          {durationMinutes !== null && (
            <small>{isArabic ? "الوقت المتوقع" : "ETA"}: {durationMinutes} min</small>
          )}
          {driverDistanceKm !== null && (
            <small>
              {state.role === "driver"
                ? (isArabic ? "المسافة إلى الزبون" : "Distance to customer")
                : (isArabic ? "المسافة بينك وبين الكابتن" : "Distance between you and captain")}: {formatDistanceKm(driverDistanceKm)} km
            </small>
          )}
          {showDrivers && !driverLocation && (
            <small className="route-warning">{isArabic ? "الكابتن لم يفعل التتبع المباشر بعد." : "Captain live tracking is not active yet."}</small>
          )}
          <small className={`location-hint ${locationStatus}`}>{locationHint}</small>
          {routeStatus === "fallback" && (
            <small className="route-warning">{isArabic ? "تعذر حساب مسار الطرق، تم استخدام تقدير خطي." : "Road routing failed, using straight-line fallback."}</small>
          )}
        </div>
      </div>
    </div>
  );
}
