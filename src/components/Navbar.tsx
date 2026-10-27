import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";
import { Monogram } from "./Monogram";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically whenever the route changes, so it
  // never stays open covering the new page after tapping a link.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Shops & pharmacy and Getting here live as tabs inside Practical, so keep
  // the Practical link highlighted on any of them.
  const inPractical = ["/practical", "/groceries", "/getting-here"].includes(location.pathname);

  return (
    <header className="app-header">
      <NavLink to="/" className="brand" aria-label={t("app.shortName")}>
        <Monogram className="brand-mark" />
        <span className="brand-name">
          <span>Casa</span>
          <span>Hoyo 8</span>
        </span>
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
          <NavLink to="/house">{t("menu.villa")}</NavLink>
          <NavLink to="/restaurants">{t("menu.eat")}</NavLink>
          <NavLink to="/activities">{t("menu.golf")}</NavLink>
          <NavLink to="/practical" className={inPractical ? "active" : undefined}>
            {t("menu.practical")}
          </NavLink>
        </nav>
        <div className="header-actions">
          <LanguageToggle />
          <NavLink to="/manual" className="btn-outline">
            {t("menu.manual")}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
