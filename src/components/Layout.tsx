import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically whenever the route changes, so it
  // never stays open covering the new page after tapping a link.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-title">
          {t("app.shortName")}
        </NavLink>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={menuOpen ? "app-nav-group open" : "app-nav-group"}>
          <nav className="app-nav">
            <NavLink to="/house">{t("nav.house")}</NavLink>
            <NavLink to="/restaurants">{t("nav.restaurants")}</NavLink>
            <NavLink to="/groceries">{t("nav.groceries")}</NavLink>
            <NavLink to="/activities">{t("nav.activities")}</NavLink>
            <NavLink to="/practical">{t("nav.practical")}</NavLink>
            <NavLink to="/manual">{t("nav.houseManual")}</NavLink>
          </nav>
          <div className="header-actions">
            <LanguageToggle />
            <NavLink to="/admin" className="admin-signin-btn-header">
              {t("nav.admin")}
            </NavLink>
          </div>
        </div>
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
