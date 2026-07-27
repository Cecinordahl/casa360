import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { ProtectedRoute } from "../../components/admin/ProtectedRoute";

export function AdminLayout() {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="admin-shell">
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            {t("admin.dashboard")}
          </NavLink>
          <NavLink to="/admin/restaurants">{t("admin.manageRestaurants")}</NavLink>
          <NavLink to="/admin/groceries">{t("admin.manageGroceries")}</NavLink>
          <NavLink to="/admin/activities">{t("admin.manageActivities")}</NavLink>
          <NavLink to="/admin/practical">{t("admin.managePractical")}</NavLink>
          <NavLink to="/admin/manual">{t("admin.manageManual")}</NavLink>
          <span className="admin-nav-spacer" />
          <span className="admin-user-email">{user?.email}</span>
          <button type="button" onClick={() => signOut()}>
            {t("common.signOut")}
          </button>
        </nav>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
