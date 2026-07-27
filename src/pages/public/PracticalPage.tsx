import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import type { Locale, PracticalInfoItem } from "../../types/content";

export function PracticalPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<PracticalInfoItem[]>([]);

  useEffect(() => subscribePublished<PracticalInfoItem>("practicalInfo", setItems), []);

  return (
    <div>
      <h1>{t("practical.title")}</h1>
      {items.length === 0 && <p>{t("common.empty")}</p>}
      <ul className="card-list">
        {items.map((p) => (
          <li className="card" key={p.id}>
            <h2>{p.name}</h2>
            <p className="card-meta">{t(`practical.kind.${p.kind}`)}</p>
            <p className="card-meta">
              {p.distanceKm != null && `${p.distanceKm} km`}
              {p.distanceKm != null && p.driveMin != null && " · "}
              {p.driveMin != null && t("common.drive", { min: p.driveMin })}
            </p>
            {localized(p, "note", lang) && <p>{localized(p, "note", lang)}</p>}
            {p.mapUrl && (
              <div className="card-links">
                <a href={p.mapUrl} target="_blank" rel="noreferrer">{t("common.map")}</a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
