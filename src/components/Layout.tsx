import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

export function Layout() {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-title">
          {t("app.title")}
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/restaurants">{t("nav.restaurants")}</NavLink>
          <NavLink to="/groceries">{t("nav.groceries")}</NavLink>
          <NavLink to="/activities">{t("nav.activities")}</NavLink>
          <NavLink to="/practical">{t("nav.practical")}</NavLink>
          <NavLink to="/manual">{t("nav.houseManual")}</NavLink>
        </nav>
        <LanguageToggle />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <NavLink to="/privacy">{t("nav.privacy")}</NavLink>
        <NavLink to="/admin">{t("nav.admin")}</NavLink>
      </footer>
    </div>
  );
}
