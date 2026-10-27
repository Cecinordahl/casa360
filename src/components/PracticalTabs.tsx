import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Practical info, Shops & pharmacy and Getting here share one menu entry
 * ("Practical"), so each page offers the others as tabs. */
export function PracticalTabs() {
  const { t } = useTranslation();
  return (
    <nav className="page-tabs">
      <NavLink to="/practical">{t("practical.title")}</NavLink>
      <NavLink to="/groceries">{t("groceries.title")}</NavLink>
      <NavLink to="/getting-here">{t("gettingHere.title")}</NavLink>
    </nav>
  );
}
