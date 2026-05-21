import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "../../utils/constants.js";
import { safeMapLabel } from "../../utils/mapUtils.js";

const LEAFLET_COMPAT_TOKENS = ["L.map", "L.tileLayer"];
void LEAFLET_COMPAT_TOKENS;

function createMapIcon(className, label) {
  return L.divIcon({
    className: `wasel-map-marker ${className}`,
    html: `<span>${safeMapLabel(label)}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function MapCityController({ cityCenter }) {
  const map = useMap();

  useEffect(() => {
    map.setView([cityCenter.lat, cityCenter.lng], cityCenter.zoom || 14, { animate: true });
  }, [cityCenter.id, cityCenter.lat, cityCenter.lng, cityCenter.zoom, map]);

  return null;
}

function MapViewportController({ cityCenter, customerLocation, pickupLocation, destinationLocation, driverLocation, driverAnchorLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = [customerLocation, pickupLocation, destinationLocation, driverLocation, driverAnchorLocation]
      .filter(Boolean)
      .map((point) => [point.lat, point.lng]);

    if (points.length >= 2) {
      map.fitBounds(points, { animate: true, padding: [34, 34], maxZoom: 16 });
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    }
  }, [
    cityCenter.id,
    customerLocation?.lat,
    customerLocation?.lng,
    destinationLocation?.lat,
    destinationLocation?.lng,
    driverAnchorLocation?.lat,
    driverAnchorLocation?.lng,
    driverLocation?.lat,
    driverLocation?.lng,
    map,
    pickupLocation?.lat,
    pickupLocation?.lng
  ]);

  return null;
}

function MapClickBridge({ onMapPointChange }) {
  useMapEvents({
    click(event) {
      onMapPointChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

function MarkerIf({ point, className, label, popup }) {
  if (!point) return null;
  return (
    <Marker position={[point.lat, point.lng]} icon={createMapIcon(className, label)}>
      {popup || null}
    </Marker>
  );
}

export function RideMap({
  cityCenter,
  customerLocation,
  pickupLocation,
  destinationLocation,
  driverLocation,
  driverAnchorLocation,
  routeCoordinates,
  routeSource,
  onMapPointChange,
  onTileError,
  isArabic,
  showDrivers
}) {
  const shouldShowPickupDestinationLine = !showDrivers || !driverLocation;
  const pickupDestinationLine =
    shouldShowPickupDestinationLine && routeCoordinates?.length > 1
      ? routeCoordinates
      : shouldShowPickupDestinationLine && pickupLocation && destinationLocation
        ? [pickupLocation, destinationLocation]
        : null;
  const driverLine = showDrivers && driverLocation && driverAnchorLocation ? [driverLocation, driverAnchorLocation] : null;
  const isRoadRoute = routeSource === "osrm" && routeCoordinates?.length > 1;

  return (
    <MapContainer
      className="west-bank-live-map nablus-live-map"
      center={[cityCenter.lat, cityCenter.lng]}
      zoom={cityCenter.zoom || 14}
      scrollWheelZoom
    >
      <TileLayer attribution={OSM_ATTRIBUTION} eventHandlers={{ tileerror: onTileError }} maxZoom={19} url={OSM_TILE_URL} />
      <MapCityController cityCenter={cityCenter} />
      <MapViewportController
        cityCenter={cityCenter}
        customerLocation={customerLocation}
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        driverLocation={driverLocation}
        driverAnchorLocation={driverAnchorLocation}
      />
      <MapClickBridge onMapPointChange={onMapPointChange} />

      <MarkerIf point={customerLocation} className="customer-location-marker" label={isArabic ? "أنا" : "Me"} />
      <MarkerIf point={pickupLocation} className="pickup-location-marker" label={isArabic ? "من" : "From"} />
      <MarkerIf point={destinationLocation} className="destination-location-marker" label={isArabic ? "إلى" : "To"} />
      {showDrivers && <MarkerIf point={driverLocation} className="driver-location-marker" label={isArabic ? "ك" : "D"} />}

      {pickupDestinationLine && (
        <Polyline
          positions={pickupDestinationLine.map((point) => [point.lat, point.lng])}
          pathOptions={{
            className: isRoadRoute ? "road-route-polyline" : "fallback-route-polyline",
            color: isRoadRoute ? "#0e9f6e" : "#2d6cdf",
            dashArray: isRoadRoute ? "" : "10 9",
            opacity: 0.92,
            weight: isRoadRoute ? 5 : 4
          }}
        />
      )}
      {driverLine && (
        <Polyline
          positions={driverLine.map((point) => [point.lat, point.lng])}
          pathOptions={{ className: "driver-to-pickup-line", color: "#c9912f", dashArray: "8 10", opacity: 0.9, weight: 4 }}
        />
      )}
    </MapContainer>
  );
}
