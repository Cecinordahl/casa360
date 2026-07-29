import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribeHouseShowcase } from "../../firebase/houseShowcase";
import { localized } from "../../utils/localized";
import { ImageStrip } from "../../components/ImageStrip";
import { HOUSE_SHOWCASE_CATEGORIES } from "../../types/content";
import type { HouseShowcase, ImageItem, Locale } from "../../types/content";

export function HousePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [showcase, setShowcase] = useState<HouseShowcase | null>(null);

  useEffect(() => subscribeHouseShowcase(setShowcase), []);

  if (!showcase) return <p>{t("common.loading")}</p>;

  const [cover, ...rest] = [...showcase.images].sort((a, b) => a.order - b.order);

  const highlights = rest.filter((img) => !img.category || !HOUSE_SHOWCASE_CATEGORIES.includes(img.category));
  const grouped: { category: string; images: ImageItem[] }[] = HOUSE_SHOWCASE_CATEGORIES.map((category) => ({
    category,
    images: rest.filter((img) => img.category === category),
  })).filter((g) => g.images.length > 0);

  return (
    <div>
      {cover && (
        <div
          className="hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(20,17,14,0.15) 0%, rgba(20,17,14,0.55) 100%), url(${cover.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="hero-eyebrow">San Roque Club · Sotogrande</p>
          <h1 className="hero-title">{t("app.shortName")}</h1>
        </div>
      )}

      <p style={{ whiteSpace: "pre-line", maxWidth: "65ch", margin: "0 auto 2rem" }}>
        {localized(showcase, "story", lang)}
      </p>

      {highlights.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>{t("house.highlights")}</h2>
          <ImageStrip images={highlights} />
        </div>
      )}

      {grouped.map((g) => (
        <div key={g.category} style={{ marginBottom: "2rem" }}>
          <h2>{t(`house.category.${g.category}`)}</h2>
          <ImageStrip images={g.images} />
        </div>
      ))}

      <section className="cta-band">
        <h2>{t("house.ctaTitle")}</h2>
        <p>{t("house.ctaBody")}</p>
        <div className="cta-actions">
          {showcase.airbnbUrl && (
            <a href={showcase.airbnbUrl} target="_blank" rel="noreferrer" className="hero-cta" style={{ textDecoration: "none" }}>
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
