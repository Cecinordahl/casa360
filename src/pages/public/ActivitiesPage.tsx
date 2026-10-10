import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import { distanceSortKey } from "../../utils/distance";
import type { Activity, ActivityCategory, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { Disclaimer } from "../../components/Disclaimer";
import { FormattedText } from "../../components/FormattedText";

const CATEGORIES: ActivityCategory[] = [
  "golf",
  "tennis_padel",
  "beach_club",
  "beach",
  "running",
  "family",
  "fitness",
  "other",
];

type SortMode = "distance" | "price";

function priceSortKey(a: Activity): number {
  return a.priceFrom ?? Infinity;
}

export function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Activity[]>([]);
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("distance");

  useEffect(() => subscribePublished<Activity>("activities", setItems), []);

  const filtered = useMemo(
    () => items.filter((a) => category === "all" || a.categories.includes(category)),
    [items, category],
  );

  const anyPriceInFiltered = filtered.some((a) => a.priceFrom != null);

  // If the category filter changes to a set of activities where none have
  // a price on file, the Price chip disappears (below) — fall back to
  // distance so sortMode never points at a hidden control.
  useEffect(() => {
    if (sortMode === "price" && !anyPriceInFiltered) setSortMode("distance");
  }, [sortMode, anyPriceInFiltered]);

  const visible = useMemo(() => {
    const key = sortMode === "price" ? priceSortKey : distanceSortKey;
    return [...filtered].sort((a, b) => key(a) - key(b));
  }, [filtered, sortMode]);

  const somePricesMissing = sortMode === "price" && filtered.some((a) => a.priceFrom == null);

  return (
    <div>
      <h1>{t("activities.title")}</h1>

      <div className="filters">
        <div>
          <div className="filter-group-label">{t("activities.filters.category")}</div>
          <div className="filter-chip-row">
            <button
              type="button"
              className={category === "all" ? "filter-chip active" : "filter-chip"}
              onClick={() => setCategory("all")}
            >
              {t("common.all")}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={category === c ? "filter-chip active" : "filter-chip"}
                onClick={() => setCategory(c)}
              >
                {t(`activities.category.${c}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="filter-group-label">{t("activities.filters.sortBy")}</div>
          <div className="filter-chip-row">
            <button
              type="button"
              className={sortMode === "distance" ? "filter-chip active" : "filter-chip"}
              onClick={() => setSortMode("distance")}
            >
              {t("activities.filters.sortByDistance")}
            </button>
            {anyPriceInFiltered && (
              <button
                type="button"
                className={sortMode === "price" ? "filter-chip active" : "filter-chip"}
                onClick={() => setSortMode("price")}
              >
                {t("activities.filters.sortByPrice")}
              </button>
            )}
          </div>
          {somePricesMissing && <p className="hint">{t("activities.filters.priceIncompleteNote")}</p>}
        </div>
      </div>

      {category === "golf" && (
        <div className="host-note golf-tip">
          <p>
            <strong>{t("activities.golfTip.title")}:</strong> {t("activities.golfTip.body")}
          </p>
          <p>{t("activities.golfTip.example")}</p>
          <p>
            <strong>{t("activities.golfTip.warningLabel")}:</strong> {t("activities.golfTip.warning")}
          </p>
          <p>{t("activities.golfTip.autumnOffer")}</p>
          <div className="card-links">
            <a href="https://www.golfamore.com/" target="_blank" rel="noreferrer">
              {t("activities.golfTip.link")}
            </a>
          </div>
        </div>
      )}

      <p className="results-count">{t("activities.resultCount", { count: visible.length })}</p>

      {visible.length === 0 && <p>{t("common.empty")}</p>}

      <ul className="card-list">
        {visible.map((a) => (
          <li className="card" key={a.id}>
            <ImageStrip images={a.images} />
            <h2>{a.name}</h2>
            <p className="card-meta">
              {a.categories.map((c) => t(`activities.category.${c}`)).join(", ")}
            </p>
            <p className="card-meta">
              {a.distanceWalkMin != null && t("common.walk", { min: a.distanceWalkMin })}
              {a.distanceWalkMin != null && a.distanceDriveMin != null && " · "}
              {a.distanceDriveMin != null && t("common.drive", { min: a.distanceDriveMin })}
            </p>
            {a.priceFrom != null && (
              <p className="card-meta">{t("activities.priceFromLabel", { price: a.priceFrom })}</p>
            )}
            {a.openingHours && <p className="card-meta">{a.openingHours}</p>}
            {localized(a, "seasonNote", lang) && (
              <p className="card-meta">
                {t("activities.season")}: {localized(a, "seasonNote", lang)}
              </p>
            )}
            <FormattedText text={localized(a, "description", lang)} />
            {localized(a, "hostTip", lang) && (
              <p className="host-note">
                <strong>{t("common.hostNote")}:</strong> {localized(a, "hostTip", lang)}
              </p>
            )}
            <div className="card-links">
              {a.bookingUrl && <a href={a.bookingUrl} target="_blank" rel="noreferrer">{t("common.book")}</a>}
              {a.websiteUrl && <a href={a.websiteUrl} target="_blank" rel="noreferrer">{t("common.website")}</a>}
            </div>
          </li>
        ))}
      </ul>

      <Disclaimer />
    </div>
  );
}
