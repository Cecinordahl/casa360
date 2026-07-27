import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import type { Grocery, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { Disclaimer } from "../../components/Disclaimer";

export function GroceriesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Grocery[]>([]);
  const [sundayOnly, setSundayOnly] = useState(false);

  useEffect(() => subscribePublished<Grocery>("groceries", setItems), []);

  const visible = useMemo(
    () => items.filter((g) => !sundayOnly || g.openOnSunday),
    [items, sundayOnly],
  );

  return (
    <div>
      <h1>{t("groceries.title")}</h1>
      <label className="filter-toggle">
        <input type="checkbox" checked={sundayOnly} onChange={(e) => setSundayOnly(e.target.checked)} />
        {t("common.openOnSunday")}
      </label>

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
