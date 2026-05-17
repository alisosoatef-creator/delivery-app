import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NABLUS_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from "../../utils/constants.js";
import {
  customerLocationFromState,
  driverLocationFromDriver,
  formatDistanceKm,
  haversineKm,
  mapLocationCopy,
  safeMapLabel
} from "../../utils/mapUtils.js";
import { driverDisplayName } from "../../utils/rideUtils.js";

function createMapIcon(className, label) {
  return L.divIcon({
    className: `wasel-map-marker ${className}`,
    html: `<span>${safeMapLabel(label)}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

export function MapBoard({ state, dispatch = () => {}, selectedDriver, t, isArabic, showDrivers = true }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const driver = showDrivers ? selectedDriver : null;
  const customerLocation = customerLocationFromState(state);
  const driverLocation = driverLocationFromDriver(driver);
  const shouldShowDriverMarker = Boolean(showDrivers && driverLocation);
  const driverDistanceKm = shouldShowDriverMarker ? haversineKm(customerLocation, driverLocation) : null;
  const locationStatus = state.locationStatus || "default";
  const locationHint = mapLocationCopy(locationStatus, isArabic);

  useEffect(() => {
    if (state.role !== "customer" || locationStatus !== "default") return undefined;
    if (!("geolocation" in navigator)) {
      dispatch({
        type: "patch",
        patch: {
          customerLocation: { ...NABLUS_CENTER },
          locationStatus: "unsupported",
          toast: isArabic
            ? "المتصفح لا يدعم تحديد الموقع، سنستخدم نابلس افتراضيًا."
            : "Location is not supported, so Nablus is used by default."
        }
      });
      return undefined;
    }

    dispatch({ type: "patch", patch: { locationStatus: "requesting" } });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            locationStatus: "granted",
            toast: isArabic ? "تم تحديد موقعك الحالي." : "Your current location is set."
          }
        });
      },
      () => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: { ...NABLUS_CENTER },
            locationStatus: "denied",
            toast: isArabic
              ? "لا مشكلة، سنستخدم موقعًا افتراضيًا في نابلس."
              : "No problem, we will use a default location in Nablus."
          }
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    return undefined;
  }, [dispatch, isArabic, locationStatus, state.role]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined;

    const map = L.map(mapRef.current, {
      center: [NABLUS_CENTER.lat, NABLUS_CENTER.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      customerMarkerRef.current = null;
      driverMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapInstanceRef.current || !("ResizeObserver" in window)) return undefined;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const customerLatLng = [customerLocation.lat, customerLocation.lng];
    const customerIcon = createMapIcon("customer-location-marker", isArabic ? "أنت" : "You");

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker(customerLatLng, { icon: customerIcon }).addTo(map);
    } else {
      customerMarkerRef.current.setLatLng(customerLatLng);
      customerMarkerRef.current.setIcon(customerIcon);
    }
    customerMarkerRef.current.bindPopup(isArabic ? "موقع الزبون" : "Customer location");

    if (shouldShowDriverMarker) {
      const driverLabel = driverDisplayName(driver, isArabic).slice(0, 1);
      const driverLatLng = [driverLocation.lat, driverLocation.lng];
      const driverIcon = createMapIcon("driver-location-marker", driverLabel);

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(driverLatLng, { icon: driverIcon }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng(driverLatLng);
        driverMarkerRef.current.setIcon(driverIcon);
      }
      driverMarkerRef.current.bindPopup(driverDisplayName(driver, isArabic));

      if (routeLineRef.current) routeLineRef.current.remove();
      routeLineRef.current = L.polyline([customerLatLng, driverLatLng], {
        color: "#c9912f",
        dashArray: "8 10",
        opacity: 0.9,
        weight: 4
      }).addTo(map);

      map.fitBounds(L.latLngBounds([customerLatLng, driverLatLng]), {
        padding: [48, 48],
        maxZoom: 15
      });
      return;
    }

    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    map.setView(customerLatLng, Math.max(map.getZoom(), 14), { animate: true });
  }, [
    customerLocation.lat,
    customerLocation.lng,
    driver,
    driverLocation?.lat,
    driverLocation?.lng,
    isArabic,
    shouldShowDriverMarker
  ]);

  return (
    <div className="map-board real-map-board">
      <div
        className="nablus-live-map"
        ref={mapRef}
        aria-label={isArabic ? "خريطة نابلس الحية" : "Live Nablus map"}
      />
      <div className="map-compass">N</div>
      <div className="map-sheet real-map-sheet">
        <span>{showDrivers ? (isArabic ? "تتبع الكابتن" : "Captain tracking") : (isArabic ? "معاينة المسار" : "Route preview")}</span>
        <strong>{driver ? driverDisplayName(driver, isArabic) : (isArabic ? "موقعك في نابلس" : "Your Nablus location")}</strong>
        <div className="map-route-summary">
          <small>{state.pickup}</small>
          <small>{state.dropoff}</small>
          {driverDistanceKm !== null && (
            <small>{isArabic ? "المسافة بين الكابتن وموقعك" : "Captain to customer distance"}: {formatDistanceKm(driverDistanceKm)} km</small>
          )}
          <small className={`location-hint ${locationStatus}`}>{locationHint}</small>
        </div>
      </div>
    </div>
  );
}
