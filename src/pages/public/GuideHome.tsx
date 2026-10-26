import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { subscribeHouseShowcase } from "../../firebase/houseShowcase";
import { useGuest } from "../../context/GuestContext";
import { PasscodeBox } from "../../components/PasscodeBox";
import type { HouseShowcase } from "../../types/content";
import golfPhoto from "../../assets/guide-golf.webp";
import restaurantsPhoto from "../../assets/guide-restaurants.jpg";

export function GuideHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { code } = useGuest();
  const [showcase, setShowcase] = useState<HouseShowcase | null>(null);

  useEffect(() => subscribeHouseShowcase(setShowcase), []);

  const showcaseImages = showcase?.images?.length
    ? [...showcase.images].sort((a, b) => a.order - b.order)
    : [];
  const heroImage = showcaseImages[0] ?? null;
  // Prefer a different photo for the Residence card than the hero, if there is one.
  const villaImage = showcaseImages[1] ?? heroImage;

  const guidebook = [
    {
      to: "/activities",
      label: t("guide.card1Label"),
      title: t("guide.feature1Title"),
      body: t("guide.feature1Body"),
      image: golfPhoto,
    },
    {
      to: "/restaurants",
      label: t("guide.card2Label"),
      title: t("guide.feature2Title"),
      body: t("guide.feature2Body"),
      image: restaurantsPhoto,
    },
    {
      to: "/house",
      label: t("guide.card3Label"),
      title: t("guide.card3Title"),
      body: t("guide.card3Body"),
      image: villaImage?.url ?? null,
    },
  ];

  const essentials = [
    { title: t("guide.essential1"), body: t("guide.amenityWifiBody") },
    { title: t("guide.essential2"), body: t("guide.amenityCheckinBody") },
    { title: t("guide.essential3"), body: t("guide.amenityParkingBody") },
    { title: t("guide.essential4"), body: t("guide.amenityLanguageBody") },
  ];

  return (
    <div>
      <section
        className="hero"
        style={heroImage ? { backgroundImage: `var(--hero-overlay), url(${heroImage.url})` } : undefined}
      >
        <div className="hero-inner">
          <p className="micro-label hero-eyebrow">{t("guide.heroEyebrow")}</p>
          <h1 className="hero-title">
            {/* One sentence per line: "Fairway Views." / "Coastal Calm." */}
            {t("guide.heroTitle")
              .split(/(?<=\.)\s+/)
              .map((line) => (
                <span key={line}>{line}</span>
              ))}
          </h1>
          <p className="hero-subtitle">{t("guide.heroSubtitle")}</p>
          <Link to="/house" className="text-link text-link--light">
            {t("guide.heroLink")} →
          </Link>
        </div>
      </section>

      <div className="container">
        <section className="home-section">
          <div className="section-heading">
            <p className="micro-label">{t("guide.guidebookEyebrow")}</p>
            <h2>{t("guide.guidebookTitle")}</h2>
          </div>
          <div className="guidebook-grid">
            {guidebook.map((card, i) => (
              <Link key={card.to} to={card.to} className="guidebook-card">
                <div className="guidebook-image">
                  {card.image && <img src={card.image} alt="" loading="lazy" />}
                </div>
                <p className="micro-label">
                  {String(i + 1).padStart(2, "0")} / {card.label}
                </p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section essentials">
          <div>
            <div className="section-heading">
              <p className="micro-label">{t("guide.essentialsEyebrow")}</p>
              <h2>{t("guide.amenitiesTitle")}</h2>
            </div>
            <ol className="ledger">
              {essentials.map((item, i) => (
                <li key={item.title} className="ledger-item">
                  <span className="ledger-number">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="manual-box">
            <p className="micro-label">{t("tracker.manual")}</p>
            <h2>{t("nav.houseManual")}</h2>
            <p>{t("guide.manualCtaBody")}</p>
            {code ? (
              <>
                <p className="manual-box-note">{t("guide.manualUnlocked")}</p>
                <Link to="/manual" className="btn-light">
                  {t("guide.manualOpen")}
                </Link>
              </>
            ) : (
              <PasscodeBox onUnlocked={() => navigate("/manual")} />
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
