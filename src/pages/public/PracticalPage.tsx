import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import type { Locale, PracticalInfoItem } from "../../types/content";
import { PageHeader } from "../../components/PageHeader";
import { PracticalTabs } from "../../components/PracticalTabs";

export function PracticalPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<PracticalInfoItem[]>([]);

  useEffect(() => subscribePublished<PracticalInfoItem>("practicalInfo", setItems), []);

  return (
    <div>
      <PageHeader tracker={t("tracker.practical")} title={t("practical.title")}>
        <PracticalTabs />
      </PageHeader>
      {items.length === 0 && <p>{t("common.empty")}</p>}
      <ul className="listing-grid listing-grid--3">
        {items.map((p) => (
          <li className="listing-card" key={p.id}>
            <div className="listing-body">
              <p className="micro-label">{t(`practical.kind.${p.kind}`)}</p>
              <h2>{p.name}</h2>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
