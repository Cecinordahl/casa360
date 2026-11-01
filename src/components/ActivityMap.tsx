import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Activity, GeoPoint } from "../types/content";
import { directionsUrl } from "../utils/coordinates";

type Pinned = Activity & { location: GeoPoint };

interface Props {
  activities: Pinned[];
  onShowDetails: (id: string) => void;
}

// Leaflet's default marker loads PNGs by a path Vite doesn't rewrite, so
// pins are plain CSS (see .map-pin in index.css) — also lets them match
// the site's square-cornered ink style.
const pinIcon = divIcon({
  className: "map-pin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

/** Re-frames the map whenever the set of visible pins changes, so picking
 * a category always zooms to what's left instead of leaving pins off-screen. */
function FitToPins({ points }: { points: GeoPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, points]);

  return null;
}

export default function ActivityMap({ activities, onShowDetails }: Props) {
  const { t } = useTranslation();
  const points = useMemo(() => activities.map((a) => a.location), [activities]);

  return (
    <MapContainer
      className="activity-map"
      center={[36.29, -5.3]}
      zoom={11}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPins points={points} />
      {activities.map((a) => (
        <Marker key={a.id} position={a.location} icon={pinIcon} title={a.name}>
          <Popup>
            <div className="map-popup">
              <p className="micro-label">
                {a.categories.map((c) => t(`activities.category.${c}`)).join(", ")}
              </p>
              <h3>{a.name}</h3>
              <p className="card-meta">
                {a.distanceWalkMin != null && t("common.walk", { min: a.distanceWalkMin })}
                {a.distanceWalkMin != null && a.distanceDriveMin != null && " · "}
                {a.distanceDriveMin != null && t("common.drive", { min: a.distanceDriveMin })}
              </p>
              <div className="card-links">
                <a
                  href={`#activity-${a.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onShowDetails(a.id);
                  }}
                >
                  {t("activities.map.showDetails")}
                </a>
                <a href={directionsUrl(a.location)} target="_blank" rel="noreferrer">
                  {t("activities.map.directions")}
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
