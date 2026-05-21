import { useEffect, useMemo, useRef, useState } from "react";
import { getWestBankCityCenter, westBankCityName } from "../../utils/westBankCities.js";
import {
  customerLocationFromState,
  destinationLocationFromState,
  driverLocationFromDriver,
  estimatePickupDestinationDistance,
  formatDistanceKm,
  haversineKm,
  normalizeLocation
} from "../../utils/mapUtils.js";
import { fetchRoute } from "../../utils/routeUtils.js";
import { LocationPicker } from "./LocationPicker.jsx";
import { RideMap } from "./RideMap.jsx";

function mapPointLabel(kind, point, isArabic) {
  void point;
  if (kind === "pickup") {
    return isArabic ? "نقطة انطلاق محددة من الخريطة" : "Pickup selected on map";
  }
  return isArabic ? "وجهة محددة من الخريطة" : "Destination selected on map";
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
    void point;
    return isArabic ? "موقعي الحالي / نقطة الانطلاق" : "My current location / pickup";
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
      <div className="map-sheet real-map-sheet compact-map-distance-badge">
        {driverDistanceKm !== null ? (
          <strong>
            {state.role === "driver" ? (isArabic ? "إلى الزبون" : "To customer") : (isArabic ? "الكابتن" : "Captain")}: {formatDistanceKm(driverDistanceKm)} km
          </strong>
        ) : routeDistanceKm !== null ? (
          <strong>{formatDistanceKm(routeDistanceKm)} km</strong>
        ) : (
          <strong>{routeStatus === "loading" ? (isArabic ? "حساب المسافة" : "Calculating") : cityName}</strong>
        )}
        {showDrivers && !driverLocation && (
          <small>{isArabic ? "بانتظار تفعيل موقع الكابتن المباشر." : "Waiting for captain live location."}</small>
        )}
      </div>
    </div>
  );
}
