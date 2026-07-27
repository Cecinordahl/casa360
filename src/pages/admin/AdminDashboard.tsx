import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("admin.dashboard")}</h1>
      <ul className="dashboard-links">
        <li><Link to="/admin/restaurants">{t("admin.manageRestaurants")}</Link></li>
        <li><Link to="/admin/groceries">{t("admin.manageGroceries")}</Link></li>
        <li><Link to="/admin/activities">{t("admin.manageActivities")}</Link></li>
        <li><Link to="/admin/practical">{t("admin.managePractical")}</Link></li>
        <li><Link to="/admin/manual">{t("admin.manageManual")}</Link></li>
      </ul>
    </div>
  );
}
