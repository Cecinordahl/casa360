// Mirrors SCHEMA.md. Keep these two in sync when the data model changes.

export interface ImageItem {
  publicId: string; // Cloudinary public_id, used for reordering keys + delete
  url: string; // Cloudinary secure_url
  order: number;
  alt_en?: string;
  alt_no?: string;
}

export interface BaseItem {
  id: string;
  images: ImageItem[];
  order: number;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type CuisineTag =
  | "spanish"
  | "seafood"
  | "tapas"
  | "italian"
  | "international"
  | "steakhouse"
  | "beach_club_food"
  | "other";

export interface Restaurant extends BaseItem {
  name: string;
  description_en: string;
  description_no: string;
  cuisineTags: CuisineTag[];
  priceLevel: 1 | 2 | 3 | 4;
  distanceWalkMin: number | null;
  distanceDriveMin: number | null;
  openingHours: string;
  openOnSunday: boolean;
  mapUrl: string | null;
  websiteUrl: string | null;
  hostNote_en: string | null;
  hostNote_no: string | null;
}

export type GroceryType = "supermarket" | "small_shop" | "pharmacy" | "other";

export interface Grocery extends BaseItem {
  name: string;
  type: GroceryType;
  distanceWalkMin: number | null;
  distanceDriveMin: number | null;
  openingHours: string;
  openOnSunday: boolean;
  mapUrl: string | null;
  note_en: string | null;
  note_no: string | null;
}

export type ActivityCategory =
  | "golf"
  | "tennis_padel"
  | "beach_club"
  | "beach"
  | "running"
  | "family"
  | "fitness"
  | "other";

export interface Activity extends BaseItem {
  name: string;
  categories: ActivityCategory[];
  description_en: string;
  description_no: string;
  distanceWalkMin: number | null;
  distanceDriveMin: number | null;
  seasonNote_en: string | null;
  seasonNote_no: string | null;
  openingHours: string | null;
  openOnSunday: boolean;
  bookingUrl: string | null;
  websiteUrl: string | null;
  hostTip_en: string | null;
  hostTip_no: string | null;
}

export type PracticalInfoKind =
  | "pharmacy"
  | "doctor"
  | "atm"
  | "petrol_station"
  | "airport"
  | "port"
  | "other";

export interface PracticalInfoItem extends BaseItem {
  kind: PracticalInfoKind;
  name: string;
  distanceKm: number | null;
  driveMin: number | null;
  note_en: string | null;
  note_no: string | null;
  mapUrl: string | null;
}

export type HouseManualSectionKey =
  | "arrival"
  | "wifi"
  | "climate"
  | "appliances"
  | "commonAreas"
  | "rulesPractical"
  | "emergency";

export const HOUSE_MANUAL_SECTION_KEYS: HouseManualSectionKey[] = [
  "arrival",
  "wifi",
  "climate",
  "appliances",
  "commonAreas",
  "rulesPractical",
  "emergency",
];

// houseManual/{guestCode}/sections/{key} — the gated body content.
// Section titles are static i18n strings (manual.sections.*), not stored
// here — see SCHEMA.md.
export interface HouseManualSectionBody {
  key: HouseManualSectionKey;
  body_en: string;
  body_no: string;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  hostPhone?: string | null;
  hospitalName?: string | null;
  hospitalMapUrl?: string | null;
  images: ImageItem[];
  order: number;
  updatedAt?: unknown;
}

export interface AppConfig {
  currentGuestCode: string;
  updatedAt?: unknown;
}

export interface AdminAllowlistEntry {
  email: string;
  addedAt?: unknown;
}

export type Locale = "en" | "no";
