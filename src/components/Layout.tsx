import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

export function Layout() {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-title">
          {t("app.shortName")}
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/house">{t("nav.house")}</NavLink>
          <NavLink to="/restaurants">{t("nav.restaurants")}</NavLink>
          <NavLink to="/groceries">{t("nav.groceries")}</NavLink>
          <NavLink to="/activities">{t("nav.activities")}</NavLink>
          <NavLink to="/practical">{t("nav.practical")}</NavLink>
          <NavLink to="/manual">{t("nav.houseManual")}</NavLink>
        </nav>
        <LanguageToggle />
        <NavLink to="/admin" className="admin-signin-btn-header">
          {t("nav.admin")}
        </NavLink>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span className="app-title" style={{ color: "inherit" }}>
          {t("app.shortName")}
        </span>
        <div className="app-footer-links">
          <NavLink to="/privacy">{t("nav.privacy")}</NavLink>
        </div>
      </footer>
    </div>
  );
}
