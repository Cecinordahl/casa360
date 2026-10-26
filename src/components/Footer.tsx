import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Disclaimer } from "./Disclaimer";
import { Monogram } from "./Monogram";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <Monogram className="footer-mark" />
          <div>
            <div className="footer-name">{t("app.shortName")}</div>
            <div className="micro-label">{t("footer.tagline")}</div>
          </div>
        </div>
        <Disclaimer />
        <div className="footer-links">
          <NavLink to="/privacy">{t("nav.privacy")}</NavLink>
          <NavLink to="/admin">{t("nav.admin")}</NavLink>
        </div>
      </div>
    </footer>
  );
}
