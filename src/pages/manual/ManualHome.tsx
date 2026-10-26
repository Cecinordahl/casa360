import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HOUSE_MANUAL_SECTION_KEYS } from "../../types/content";
import { PageHeader } from "../../components/PageHeader";

export function ManualHome() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader tracker={t("tracker.manual")} title={t("manual.title")} />
      <ol className="ledger ledger--links">
        {HOUSE_MANUAL_SECTION_KEYS.map((key, i) => (
          <li key={key} className="ledger-item">
            <span className="ledger-number">{String(i + 1).padStart(2, "0")}</span>
            <Link to={`/manual/${key}`}>{t(`manual.sections.${key}`)} →</Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
