import type { GeoPoint } from "../types/content";

function toPoint(lat: string, lng: string): GeoPoint | null {
  const point = { lat: Number(lat), lng: Number(lng) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
  if (Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) return null;
  return point;
}

const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";

/** Reads a location out of whatever the host pastes in admin: a plain
 * "36.29, -5.30" pair, or a full Google Maps link. A place link carries
 * both the camera position (`@lat,lng,zoom`) and the pin itself
 * (`!3dlat!4dlng`) — the pin is the accurate one, so it's tried first.
 * Short links (maps.app.goo.gl) only redirect and can't be resolved from
 * the browser, so they return null. */
export function parseCoordinates(input: string): GeoPoint | null {
  let text = input.trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    // Stray "%" in a hand-typed value — match against it as-is.
  }
  const patterns = [
    new RegExp(`!3d${NUM}!4d${NUM}`),
    new RegExp(`[?&](?:q|query|ll|destination)=${NUM},\\s*${NUM}`),
    new RegExp(`@${NUM},${NUM}`),
    new RegExp(`^${NUM}\\s*,\\s*${NUM}$`),
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return toPoint(match[1], match[2]);
  }
  return null;
}

export function formatCoordinates(point: GeoPoint): string {
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
}

export function placeUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}

export function directionsUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
}
