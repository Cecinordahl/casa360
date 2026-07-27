import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { ProtectedRoute } from "../../components/admin/ProtectedRoute";

export function AdminLayout() {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <ProtectedRoute>
      <div className="admin-shell">
        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-nav-title">
            {t("admin.dashboard")}
          </NavLink>

          <button
            type="button"
            className="mobile-menu-toggle admin-mobile-menu-toggle"
            aria-label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <div className={menuOpen ? "admin-nav-group open" : "admin-nav-group"}>
            <NavLink to="/admin/restaurants">{t("admin.manageRestaurants")}</NavLink>
            <NavLink to="/admin/groceries">{t("admin.manageGroceries")}</NavLink>
            <NavLink to="/admin/activities">{t("admin.manageActivities")}</NavLink>
            <NavLink to="/admin/practical">{t("admin.managePractical")}</NavLink>
            <NavLink to="/admin/manual">{t("admin.manageManual")}</NavLink>
            <NavLink to="/admin/showcase">{t("admin.manageShowcase")}</NavLink>
            <span className="admin-nav-spacer" />
            <span className="admin-user-email">{user?.email}</span>
            <button type="button" onClick={() => signOut()}>
              {t("common.signOut")}
            </button>
          </div>
        </nav>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
