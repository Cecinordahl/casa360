import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Practical info and Shops & pharmacy share one menu entry ("Practical"),
 * so each page offers the other as a tab. */
export function PracticalTabs() {
  const { t } = useTranslation();
  return (
    <nav className="page-tabs">
      <NavLink to="/practical">{t("practical.title")}</NavLink>
      <NavLink to="/groceries">{t("groceries.title")}</NavLink>
    </nav>
  );
}
