import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribeHouseShowcase } from "../../firebase/houseShowcase";
import { localized } from "../../utils/localized";
import { ImageStrip } from "../../components/ImageStrip";
import { HOUSE_SHOWCASE_CATEGORIES, isHighlightImage } from "../../types/content";
import type { HouseShowcase, ImageItem, Locale } from "../../types/content";
import { PageHeader } from "../../components/PageHeader";

export function HousePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [showcase, setShowcase] = useState<HouseShowcase | null>(null);

  useEffect(() => subscribeHouseShowcase(setShowcase), []);

  if (!showcase) return <p>{t("common.loading")}</p>;

  const [cover, ...rest] = [...showcase.images].sort((a, b) => a.order - b.order);

  const highlights = rest.filter(isHighlightImage);
  const grouped: { category: string; images: ImageItem[] }[] = HOUSE_SHOWCASE_CATEGORIES.map((category) => ({
    category,
    images: rest.filter((img) => img.category === category),
  })).filter((g) => g.images.length > 0);

  return (
    <div>
      <PageHeader tracker={t("tracker.villa")} title={t("nav.house")}>
        <p className="page-intro">{t("footer.tagline")}</p>
      </PageHeader>

      {cover && <img src={cover.url} alt={cover.alt_en ?? ""} className="villa-cover" />}

      <p className="villa-story">{localized(showcase, "story", lang)}</p>

      {[
        ...(highlights.length > 0 ? [{ title: t("house.highlights"), images: highlights }] : []),
        ...grouped.map((g) => ({ title: t(`house.category.${g.category}`), images: g.images })),
      ].map((section, i) => (
        <section key={section.title} className="villa-section">
          <p className="micro-label">{String(i + 1).padStart(2, "0")}</p>
          <h2>{section.title}</h2>
          <ImageStrip images={section.images} />
        </section>
      ))}

      <section className="cta-band">
        <h2>{t("house.ctaTitle")}</h2>
        <p>{t("house.ctaBody")}</p>
        <div className="cta-actions">
          {showcase.airbnbUrl && (
            <a href={showcase.airbnbUrl} target="_blank" rel="noreferrer" className="btn-light">
              {t("house.bookAirbnb")}
            </a>
          )}
          {(showcase.contactUrl || showcase.contactPhone || showcase.contactEmail) && (
            <div className="contact-card">
              {showcase.contactUrl ? (
                <a href={showcase.contactUrl} target="_blank" rel="noreferrer" className="contact-card-title">
                  {t("house.contactLabel")}
                </a>
              ) : (
                <span className="contact-card-title">{t("house.contactLabel")}</span>
              )}
              <div className="contact-card-details">
                {showcase.contactPhone && (
                  <a href={`tel:${showcase.contactPhone.replace(/\s+/g, "")}`}>{showcase.contactPhone}</a>
                )}
                {showcase.contactPhone && showcase.contactEmail && <span> · </span>}
                {showcase.contactEmail && <a href={`mailto:${showcase.contactEmail}`}>{showcase.contactEmail}</a>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
