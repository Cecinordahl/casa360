// Config-driven form definitions so every admin CRUD screen (restaurants,
// groceries, activities, practicalInfo) shares one form/list implementation
// instead of four near-duplicate ones. See ItemForm.tsx / ItemList.tsx.

export type SelectOption = { value: string; labelKey: string };

export type FieldConfig =
  | { key: string; type: "text"; labelKey: string; required?: boolean }
  | { key: string; type: "bilingualText"; labelKey: string; multiline?: boolean }
  | { key: string; type: "number"; labelKey: string }
  | { key: string; type: "boolean"; labelKey: string }
  | { key: string; type: "url"; labelKey: string }
  | { key: string; type: "select"; labelKey: string; options: SelectOption[] }
  | { key: string; type: "multiselect"; labelKey: string; options: SelectOption[] };

export const CUISINE_OPTIONS: SelectOption[] = [
  "spanish",
  "seafood",
  "tapas",
  "italian",
  "french",
  "asian",
  "indian",
  "international",
  "steakhouse",
  "beach_club_food",
  "other",
].map((v) => ({ value: v, labelKey: `restaurants.cuisine.${v}` }));

export const ACTIVITY_CATEGORY_OPTIONS: SelectOption[] = [
  "golf",
  "tennis_padel",
  "beach_club",
  "beach",
  "running",
  "family",
  "fitness",
  "other",
].map((v) => ({ value: v, labelKey: `activities.category.${v}` }));

export const GROCERY_TYPE_OPTIONS: SelectOption[] = [
  "supermarket",
  "small_shop",
  "pharmacy",
  "other",
].map((v) => ({ value: v, labelKey: `groceries.type.${v}` }));

export const PRACTICAL_KIND_OPTIONS: SelectOption[] = [
  "pharmacy",
  "doctor",
  "atm",
  "petrol_station",
  "airport",
  "port",
  "other",
].map((v) => ({ value: v, labelKey: `practical.kind.${v}` }));

export const restaurantFields: FieldConfig[] = [
  { key: "name", type: "text", labelKey: "field.name", required: true },
  { key: "description", type: "bilingualText", labelKey: "field.description", multiline: true },
  { key: "cuisineTags", type: "multiselect", labelKey: "field.cuisineTags", options: CUISINE_OPTIONS },
  {
    key: "priceLevel",
    type: "select",
    labelKey: "field.priceLevel",
    options: [1, 2, 3, 4].map((n) => ({ value: String(n), labelKey: `field.priceLevel${n}` })),
  },
  { key: "distanceWalkMin", type: "number", labelKey: "field.distanceWalkMin" },
  { key: "distanceDriveMin", type: "number", labelKey: "field.distanceDriveMin" },
  { key: "openingHours", type: "text", labelKey: "field.openingHours" },
  { key: "openOnSunday", type: "boolean", labelKey: "field.openOnSunday" },
  { key: "mapUrl", type: "url", labelKey: "field.mapUrl" },
  { key: "websiteUrl", type: "url", labelKey: "field.websiteUrl" },
  { key: "hostNote", type: "bilingualText", labelKey: "field.hostNote", multiline: true },
];

export const groceryFields: FieldConfig[] = [
  { key: "name", type: "text", labelKey: "field.name", required: true },
  { key: "type", type: "select", labelKey: "field.type", options: GROCERY_TYPE_OPTIONS },
  { key: "distanceWalkMin", type: "number", labelKey: "field.distanceWalkMin" },
  { key: "distanceDriveMin", type: "number", labelKey: "field.distanceDriveMin" },
  { key: "openingHours", type: "text", labelKey: "field.openingHours" },
  { key: "openOnSunday", type: "boolean", labelKey: "field.openOnSunday" },
  { key: "mapUrl", type: "url", labelKey: "field.mapUrl" },
  { key: "note", type: "bilingualText", labelKey: "field.note", multiline: true },
];

export const activityFields: FieldConfig[] = [
  { key: "name", type: "text", labelKey: "field.name", required: true },
  { key: "categories", type: "multiselect", labelKey: "field.categories", options: ACTIVITY_CATEGORY_OPTIONS },
  { key: "description", type: "bilingualText", labelKey: "field.description", multiline: true },
  { key: "distanceWalkMin", type: "number", labelKey: "field.distanceWalkMin" },
  { key: "distanceDriveMin", type: "number", labelKey: "field.distanceDriveMin" },
  { key: "seasonNote", type: "bilingualText", labelKey: "field.seasonNote" },
  { key: "openingHours", type: "text", labelKey: "field.openingHours" },
  { key: "openOnSunday", type: "boolean", labelKey: "field.openOnSunday" },
  { key: "bookingUrl", type: "url", labelKey: "field.bookingUrl" },
  { key: "websiteUrl", type: "url", labelKey: "field.websiteUrl" },
  { key: "hostTip", type: "bilingualText", labelKey: "field.hostTip", multiline: true },
  { key: "priceFrom", type: "number", labelKey: "field.priceFrom" },
];

export const practicalFields: FieldConfig[] = [
  { key: "kind", type: "select", labelKey: "field.kind", options: PRACTICAL_KIND_OPTIONS },
  { key: "name", type: "text", labelKey: "field.name", required: true },
  { key: "distanceKm", type: "number", labelKey: "field.distanceKm" },
  { key: "driveMin", type: "number", labelKey: "field.driveMin" },
  { key: "mapUrl", type: "url", labelKey: "field.mapUrl" },
  { key: "note", type: "bilingualText", labelKey: "field.note", multiline: true },
];
