import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import type { Activity, ActivityCategory, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { Disclaimer } from "../../components/Disclaimer";

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

export function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Activity[]>([]);
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [sundayOnly, setSundayOnly] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  useEffect(() => subscribePublished<Activity>("activities", setItems), []);

  const visible = useMemo(() => {
    let list = items.filter((a) => category === "all" || a.categories.includes(category));
    if (sundayOnly) list = list.filter((a) => a.openOnSunday);
    if (sortByDistance) {
      list = [...list].sort(
        (a, b) => (a.distanceDriveMin ?? Infinity) - (b.distanceDriveMin ?? Infinity),
      );
    }
    return list;
  }, [items, category, sundayOnly, sortByDistance]);

  return (
    <div>
      <h1>{t("activities.title")}</h1>

      <div className="filters">
        <label className="filter-field">
          {t("activities.filters.category")}
          <select value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory | "all")}>
            <option value="all">{t("common.all")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`activities.category.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-toggle">
          <input type="checkbox" checked={sundayOnly} onChange={(e) => setSundayOnly(e.target.checked)} />
          {t("activities.filters.sunday")}
        </label>
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={sortByDistance}
            onChange={(e) => setSortByDistance(e.target.checked)}
          />
          {t("activities.filters.sortByDistance")}
        </label>
      </div>

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
            {a.openingHours && <p className="card-meta">{a.openingHours}</p>}
            {localized(a, "seasonNote", lang) && (
              <p className="card-meta">
                {t("activities.season")}: {localized(a, "seasonNote", lang)}
              </p>
            )}
            <p>{localized(a, "description", lang)}</p>
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
