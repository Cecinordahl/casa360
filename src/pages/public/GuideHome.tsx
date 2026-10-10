import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Disclaimer } from "../../components/Disclaimer";
import { subscribePublished } from "../../firebase/crud";
import { subscribeHouseShowcase } from "../../firebase/houseShowcase";
import type { Activity, Restaurant, Grocery, HouseShowcase } from "../../types/content";
import golfPhoto from "../../assets/guide-golf.webp";
import restaurantsPhoto from "../../assets/guide-restaurants.jpg";

const ICONS = {
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M2 8.5c5.5-5 14.5-5 20 0M5.5 12c3.7-3.3 9.3-3.3 13 0M9 15.5c1.7-1.5 4.3-1.5 6 0M12 19h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  language: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z" strokeLinecap="round" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M16 3l3 3M13 6l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M3 16.5V13l2-5h14l2 5v3.5M3 16.5h18M6.5 16.5v2M17.5 16.5v2M5 13h14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="16.5" r="1.2" />
      <circle cx="16.5" cy="16.5" r="1.2" />
    </svg>
  ),
};

export function GuideHome() {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showcase, setShowcase] = useState<HouseShowcase | null>(null);

  useEffect(() => subscribePublished<Restaurant>("restaurants", setRestaurants), []);
  useEffect(() => subscribePublished<Grocery>("groceries", setGroceries), []);
  useEffect(() => subscribePublished<Activity>("activities", setActivities), []);
  useEffect(() => subscribeHouseShowcase(setShowcase), []);

  const golfCount = activities.filter((a) => a.categories.includes("golf")).length;
  const heroImage = showcase?.images?.length
    ? [...showcase.images].sort((a, b) => a.order - b.order)[0]
    : null;

  return (
    <div>
      <section
        className="hero"
        style={
          heroImage
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(20,17,14,0.35) 0%, rgba(20,17,14,0.65) 100%), url(${heroImage.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <p className="hero-eyebrow">San Roque Club · Sotogrande</p>
        <h1 className="hero-title">{t("app.shortName")}</h1>
        <p className="hero-subtitle">{t("guide.heroSubtitle")}</p>
        <Link to="/manual" className="hero-cta" style={{ textDecoration: "none", display: "inline-block" }}>
          {t("guide.heroCta")}
        </Link>
        <div>
          <Link to="/house" className="feature-link" style={{ color: "inherit", borderColor: "currentColor", marginTop: "1.5rem", display: "inline-block" }}>
            {t("guide.viewHouseLink")}
          </Link>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-number">{restaurants.length}</span>
          <span className="stat-label">{t("nav.restaurants")}</span>
        </div>
        <div className="stat">
          <span className="stat-number">{activities.length}</span>
          <span className="stat-label">{t("nav.activities")}</span>
        </div>
        <div className="stat">
          <span className="stat-number">{golfCount}</span>
          <span className="stat-label">{t("guide.golfCourses")}</span>
        </div>
        <div className="stat">
          <span className="stat-number">{groceries.length}</span>
          <span className="stat-label">{t("nav.groceries")}</span>
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-visual tone-a">
          <img src={golfPhoto} alt={t("guide.feature1Title")} />
        </div>
        <div className="feature-text">
          <span className="feature-eyebrow">{t("guide.feature1Eyebrow")}</span>
          <h2>{t("guide.feature1Title")}</h2>
          <p>{t("guide.feature1Body")}</p>
          <Link to="/activities" className="feature-link">
            {t("nav.activities")} →
          </Link>
        </div>
      </div>

      <div className="feature-row reverse">
        <div className="feature-visual tone-b">
          <img src={restaurantsPhoto} alt={t("guide.feature2Title")} />
        </div>
        <div className="feature-text">
          <span className="feature-eyebrow">{t("guide.feature2Eyebrow")}</span>
          <h2>{t("guide.feature2Title")}</h2>
          <p>{t("guide.feature2Body")}</p>
          <Link to="/restaurants" className="feature-link">
            {t("nav.restaurants")} →
          </Link>
        </div>
      </div>

      <section className="amenities-section">
        <h2>{t("guide.amenitiesTitle")}</h2>
        <div className="amenities-grid">
          <div className="amenity">
            <div className="amenity-icon">{ICONS.wifi}</div>
            <h3>{t("guide.amenityWifi")}</h3>
            <p>{t("guide.amenityWifiBody")}</p>
          </div>
          <div className="amenity">
            <div className="amenity-icon">{ICONS.key}</div>
            <h3>{t("guide.amenityCheckin")}</h3>
            <p>{t("guide.amenityCheckinBody")}</p>
          </div>
          <div className="amenity">
            <div className="amenity-icon">{ICONS.car}</div>
            <h3>{t("guide.amenityParking")}</h3>
            <p>{t("guide.amenityParkingBody")}</p>
          </div>
          <div className="amenity">
            <div className="amenity-icon">{ICONS.language}</div>
            <h3>{t("guide.amenityLanguage")}</h3>
            <p>{t("guide.amenityLanguageBody")}</p>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>{t("nav.houseManual")}</h2>
        <p>{t("guide.manualCtaBody")}</p>
        <Link to="/manual" className="hero-cta" style={{ textDecoration: "none" }}>
          {t("guide.manualCtaButton")}
        </Link>
      </section>

      <Disclaimer />
    </div>
  );
}
