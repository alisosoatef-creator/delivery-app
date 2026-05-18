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
  onMapPointChange,
  onTileError,
  isArabic,
  showDrivers
}) {
  const pickupDestinationLine = pickupLocation && destinationLocation ? [pickupLocation, destinationLocation] : null;
  const driverLine = showDrivers && driverLocation && customerLocation ? [customerLocation, driverLocation] : null;

  return (
    <MapContainer
      className="west-bank-live-map nablus-live-map"
      center={[cityCenter.lat, cityCenter.lng]}
      zoom={cityCenter.zoom || 14}
      scrollWheelZoom
    >
      <TileLayer attribution={OSM_ATTRIBUTION} eventHandlers={{ tileerror: onTileError }} maxZoom={19} url={OSM_TILE_URL} />
      <MapCityController cityCenter={cityCenter} />
      <MapClickBridge onMapPointChange={onMapPointChange} />

      <MarkerIf point={customerLocation} className="customer-location-marker" label={isArabic ? "أنا" : "Me"} />
      <MarkerIf point={pickupLocation} className="pickup-location-marker" label={isArabic ? "من" : "From"} />
      <MarkerIf point={destinationLocation} className="destination-location-marker" label={isArabic ? "إلى" : "To"} />
      {showDrivers && <MarkerIf point={driverLocation} className="driver-location-marker" label={isArabic ? "ك" : "D"} />}

      {pickupDestinationLine && (
        <Polyline
          positions={pickupDestinationLine.map((point) => [point.lat, point.lng])}
          pathOptions={{ color: "#0e9f6e", dashArray: "10 9", opacity: 0.9, weight: 4 }}
        />
      )}
      {driverLine && (
        <Polyline
          positions={driverLine.map((point) => [point.lat, point.lng])}
          pathOptions={{ color: "#c9912f", dashArray: "8 10", opacity: 0.9, weight: 4 }}
        />
      )}
    </MapContainer>
  );
}
