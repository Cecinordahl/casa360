import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import { distanceSortKey } from "../../utils/distance";
import type { Grocery, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { PageHeader } from "../../components/PageHeader";
import { PracticalTabs } from "../../components/PracticalTabs";

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
      <PageHeader tracker={t("tracker.groceries")} title={t("groceries.title")}>
        <PracticalTabs />
      </PageHeader>
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

      <ul className="listing-grid listing-grid--3">
        {visible.map((g) => (
          <li className="listing-card" key={g.id}>
            <ImageStrip images={g.images} cover />
            <div className="listing-body">
              <p className="micro-label">{t(`groceries.type.${g.type}`)}</p>
              <h2>{g.name}</h2>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
