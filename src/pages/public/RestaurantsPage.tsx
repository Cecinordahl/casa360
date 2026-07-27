import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import type { Locale, Restaurant } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { Disclaimer } from "../../components/Disclaimer";

export function RestaurantsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Restaurant[]>([]);
  const [sundayOnly, setSundayOnly] = useState(false);

  useEffect(() => subscribePublished<Restaurant>("restaurants", setItems), []);

  const visible = useMemo(
    () => items.filter((r) => !sundayOnly || r.openOnSunday),
    [items, sundayOnly],
  );

  return (
    <div>
      <h1>{t("restaurants.title")}</h1>
      <label className="filter-toggle">
        <input type="checkbox" checked={sundayOnly} onChange={(e) => setSundayOnly(e.target.checked)} />
        {t("common.openOnSunday")}
      </label>

      {visible.length === 0 && <p>{t("common.empty")}</p>}

      <ul className="card-list">
        {visible.map((r) => (
          <li className="card" key={r.id}>
            <ImageStrip images={r.images} />
            <h2>{r.name}</h2>
            <p className="card-meta">
              {"€".repeat(r.priceLevel)}
              {r.cuisineTags.length > 0 && " · " + r.cuisineTags.map((c) => t(`restaurants.cuisine.${c}`)).join(", ")}
            </p>
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
          </li>
        ))}
      </ul>

      <Disclaimer />
    </div>
  );
}
