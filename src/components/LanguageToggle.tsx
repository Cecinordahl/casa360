import { useTranslation } from "react-i18next";
import type { Locale } from "../types/content";

const LANGS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "no", label: "NO" },
];

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  return (
    <div className="lang-toggle" role="group" aria-label={t("common.language")}>
      {LANGS.map(({ code, label }, i) => [
        i > 0 && (
          <span key={`sep-${code}`} className="lang-sep" aria-hidden="true">
            |
          </span>
        ),
        <button
          key={code}
          type="button"
          className={i18n.language === code ? "lang-btn active" : "lang-btn"}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={i18n.language === code}
        >
          {label}
        </button>,
      ])}
    </div>
  );
}
