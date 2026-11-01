import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import type { Activity, GeoPoint } from "../types/content";
import { directionsUrl } from "../utils/coordinates";

type Pinned = Activity & { location: GeoPoint };

interface Props {
  activities: Pinned[];
  onShowDetails: (id: string) => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
// Advanced markers need a Map ID. Google's demo ID works for trying it out;
// create a real one (Google Cloud → Map management) for production.
const MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || "DEMO_MAP_ID";

// Google receives the guest's IP and may set cookies once its script loads,
// so nothing is fetched from Google until the guest agrees. The choice is
// remembered in this browser only.
const CONSENT_KEY = "casa360.googleMapsConsent";

function readConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}

function saveConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, "yes");
  } catch {
    // Private mode etc. — they'll just be asked again next visit.
  }
}

/** Re-frames the map whenever the set of visible pins changes, so picking
 * a category always zooms to what's left instead of leaving pins off-screen. */
function FitToPins({ points }: { points: GeoPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
      return;
    }
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    map.fitBounds(
      { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) },
      40,
    );
  }, [map, points]);

  return null;
}

export default function GoogleActivityMap({ activities, onShowDetails }: Props) {
  const { t } = useTranslation();
  const [consent, setConsent] = useState(readConsent);
  const [openId, setOpenId] = useState<string | null>(null);
  const points = useMemo(() => activities.map((a) => a.location), [activities]);
  const open = activities.find((a) => a.id === openId);

  if (!consent) {
    return (
      <div className="activity-map map-consent">
        <div>
          <p>{t("activities.map.consentBody")}</p>
          <button
            type="button"
            onClick={() => {
              saveConsent();
              setConsent(true);
            }}
          >
            {t("activities.map.consentButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        className="activity-map"
        mapId={MAP_ID}
        defaultCenter={{ lat: 36.29, lng: -5.3 }}
        defaultZoom={11}
        gestureHandling="cooperative"
        streetViewControl={false}
        mapTypeControl={false}
        onClick={() => setOpenId(null)}
      >
        <FitToPins points={points} />
        {activities.map((a) => (
          <AdvancedMarker
            key={a.id}
            position={a.location}
            title={a.name}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
            onClick={() => setOpenId(a.id)}
          >
            <div className="map-pin">
              <span />
            </div>
          </AdvancedMarker>
        ))}
        {open && (
          <InfoWindow position={open.location} pixelOffset={[0, -12]} onCloseClick={() => setOpenId(null)}>
            <div className="map-popup">
              <p className="micro-label">
                {open.categories.map((c) => t(`activities.category.${c}`)).join(", ")}
              </p>
              <h3>{open.name}</h3>
              <p className="card-meta">
                {open.distanceWalkMin != null && t("common.walk", { min: open.distanceWalkMin })}
                {open.distanceWalkMin != null && open.distanceDriveMin != null && " · "}
                {open.distanceDriveMin != null && t("common.drive", { min: open.distanceDriveMin })}
              </p>
              <div className="card-links">
                <a
                  href={`#activity-${open.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onShowDetails(open.id);
                  }}
                >
                  {t("activities.map.showDetails")}
                </a>
                <a href={directionsUrl(open.location)} target="_blank" rel="noreferrer">
                  {t("activities.map.directions")}
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
