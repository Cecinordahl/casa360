import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Disclaimer } from "../../components/Disclaimer";

export function GuideHome() {
  const { t } = useTranslation();
  return (
    <div className="guide-home">
      <h1>{t("app.title")}</h1>
      <div className="guide-tiles">
        <Link className="guide-tile" to="/restaurants">{t("nav.restaurants")}</Link>
        <Link className="guide-tile" to="/groceries">{t("nav.groceries")}</Link>
        <Link className="guide-tile" to="/activities">{t("nav.activities")}</Link>
        <Link className="guide-tile" to="/practical">{t("nav.practical")}</Link>
        <Link className="guide-tile guide-tile-manual" to="/manual">{t("nav.houseManual")}</Link>
      </div>
      <Disclaimer />
    </div>
  );
}
