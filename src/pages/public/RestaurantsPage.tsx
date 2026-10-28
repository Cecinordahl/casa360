import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import { distanceSortKey } from "../../utils/distance";
import type { CuisineTag, Locale, Restaurant } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { PageHeader } from "../../components/PageHeader";
import { MultiSelectFilter } from "../../components/MultiSelectFilter";

const CUISINES: CuisineTag[] = [
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
];

type SortMode = "distance" | "price";

export function RestaurantsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<CuisineTag[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("distance");

  useEffect(() => subscribePublished<Restaurant>("restaurants", setItems), []);

  const cuisinesInUse = useMemo(
    () => CUISINES.filter((c) => items.some((r) => r.cuisineTags.includes(c))),
    [items],
  );

  // Multiple cuisines selected = "match any of these" (tapas OR spanish),
  // not "must have all of them" — that's what people mean by "show me
  // tapas and spanish places".
  const filtered = useMemo(
    () =>
      items.filter(
        (r) => cuisines.length === 0 || r.cuisineTags.some((tag) => cuisines.includes(tag)),
      ),
    [items, cuisines],
  );

  const sorted = useMemo(() => {
    const key = sortMode === "price" ? (r: Restaurant) => r.priceLevel : distanceSortKey;
    return [...filtered].sort((a, b) => key(a) - key(b));
  }, [filtered, sortMode]);

  return (
    <div>
      <PageHeader tracker={t("tracker.restaurants")} title={t("restaurants.title")} />

      <div className="filters">
        <div>
          <div className="filter-group-label">{t("restaurants.filters.cuisine")}</div>
          <MultiSelectFilter
            label={t("restaurants.filters.cuisinesButton")}
            countLabel={(count) => t("restaurants.filters.cuisinesButtonCount", { count })}
            options={cuisinesInUse}
            optionLabel={(c) => t(`restaurants.cuisine.${c}`)}
            selected={cuisines}
            onChange={setCuisines}
          />
        </div>
        <div>
          <div className="filter-group-label">{t("restaurants.filters.sortBy")}</div>
          <div className="filter-segmented" role="group">
            <button
              type="button"
              className={sortMode === "distance" ? "filter-chip active" : "filter-chip"}
              aria-pressed={sortMode === "distance"}
              onClick={() => setSortMode("distance")}
            >
              {t("restaurants.filters.sortByDistance")}
            </button>
            <button
              type="button"
              className={sortMode === "price" ? "filter-chip active" : "filter-chip"}
              aria-pressed={sortMode === "price"}
              onClick={() => setSortMode("price")}
            >
              {t("restaurants.filters.sortByPrice")}
            </button>
          </div>
        </div>
      </div>

      <p className="results-count">{t("restaurants.resultCount", { count: sorted.length })}</p>

      {sorted.length === 0 && <p>{t("common.empty")}</p>}

      <ul className="listing-grid">
        {sorted.map((r) => (
          <li className="listing-card" key={r.id}>
            <ImageStrip images={r.images} cover />
            <div className="listing-body">
              <p className="micro-label">
                {"€".repeat(r.priceLevel)}
                {r.cuisineTags.length > 0 && " · " + r.cuisineTags.map((c) => t(`restaurants.cuisine.${c}`)).join(", ")}
              </p>
              <h2>{r.name}</h2>
              <p className="card-meta">
                {r.distanceWalkMin != null && t("common.walk", { min: r.distanceWalkMin })}
                {r.distanceWalkMin != null && r.distanceDriveMin != null && " · "}
                {r.distanceDriveMin != null && t("common.drive", { min: r.distanceDriveMin })}
              </p>
              <p className="card-meta">{r.openingHours}</p>
              <p className="card-meta">
                {r.openOnSunday ? t("common.openOnSunday") : t("common.closedOnSunday")}
              </p>
              <p>{localized(r, "description", lang)}</p>
              {localized(r, "hostNote", lang) && (
                <p className="host-note">
                  <strong>{t("common.hostNote")}:</strong> {localized(r, "hostNote", lang)}
                </p>
              )}
              <div className="card-links">
                {r.mapUrl && <a href={r.mapUrl} target="_blank" rel="noreferrer">{t("common.map")}</a>}
                {r.websiteUrl && <a href={r.websiteUrl} target="_blank" rel="noreferrer">{t("common.website")}</a>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
