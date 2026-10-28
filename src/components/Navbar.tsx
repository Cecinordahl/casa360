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

  // While the menu is open, freeze the page behind it and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Tapping a link for the page you're already on doesn't change the route,
  // so the effect above never fires. Close the menu here instead and bring
  // the page back to the top, so the tap still visibly "goes" somewhere.
  function handleLinkClick(e: React.MouseEvent) {
    const link = (e.target as HTMLElement).closest("a");
    if (!link) return;
    setMenuOpen(false);
    if (link.pathname === location.pathname) {
      // Wait a frame so the menu's scroll lock has been released.
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  // Shops & pharmacy and Getting here live as tabs inside Practical, so keep
  // the Practical link highlighted on any of them.
  const inPractical = ["/practical", "/groceries", "/getting-here"].includes(location.pathname);

  return (
    <>
      <header className="app-header">
        <NavLink to="/" className="brand" aria-label={t("app.shortName")} onClick={handleLinkClick}>
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

        <div className={menuOpen ? "app-nav-group open" : "app-nav-group"} onClick={handleLinkClick}>
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
      {menuOpen && <div className="menu-backdrop" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
