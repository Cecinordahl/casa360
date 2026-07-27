import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HOUSE_MANUAL_SECTION_KEYS } from "../../types/content";

export function ManualHome() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("manual.title")}</h1>
      <ul className="dashboard-links">
        {HOUSE_MANUAL_SECTION_KEYS.map((key) => (
          <li key={key}>
            <Link to={`/manual/${key}`}>{t(`manual.sections.${key}`)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
