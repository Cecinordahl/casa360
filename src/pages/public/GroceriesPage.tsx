import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import { distanceSortKey } from "../../utils/distance";
import type { Grocery, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { Disclaimer } from "../../components/Disclaimer";

export function GroceriesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Grocery[]>([]);
  const [sundayOnly, setSundayOnly] = useState(false);

  useEffect(() => subscribePublished<Grocery>("groceries", setItems), []);

  const visible = useMemo(() => {
    const filtered = items.filter((g) => !sundayOnly || g.openOnSunday);
    return [...filtered].sort((a, b) => distanceSortKey(a) - distanceSortKey(b));
  }, [items, sundayOnly]);

  return (
    <div>
      <h1>{t("groceries.title")}</h1>
      <div className="filters">
        <div className="filter-chip-row">
          <button
            type="button"
            className={sundayOnly ? "filter-chip active" : "filter-chip"}
            onClick={() => setSundayOnly((v) => !v)}
          >
            {t("common.openOnSunday")}
          </button>
        </div>
      </div>

      <p className="results-count">{t("groceries.resultCount", { count: visible.length })}</p>

      {visible.length === 0 && <p>{t("common.empty")}</p>}

      <ul className="card-list">
        {visible.map((g) => (
          <li className="card" key={g.id}>
            <ImageStrip images={g.images} />
            <h2>{g.name}</h2>
            <p className="card-meta">{t(`groceries.type.${g.type}`)}</p>
            <p className="card-meta">
              {g.distanceWalkMin != null && t("common.walk", { min: g.distanceWalkMin })}
              {g.distanceWalkMin != null && g.distanceDriveMin != null && " · "}
              {g.distanceDriveMin != null && t("common.drive", { min: g.distanceDriveMin })}
            </p>
            <p className="card-meta">{g.openingHours}</p>
            <p className="card-meta">
              {g.openOnSunday ? t("common.openOnSunday") : t("common.closedOnSunday")}
            </p>
            {localized(g, "note", lang) && <p>{localized(g, "note", lang)}</p>}
            {g.mapUrl && (
              <div className="card-links">
                <a href={g.mapUrl} target="_blank" rel="noreferrer">{t("common.map")}</a>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Disclaimer />
    </div>
  );
}
