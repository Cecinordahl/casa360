import { useTranslation } from "react-i18next";

export function Disclaimer() {
  const { t } = useTranslation();
  return <p className="disclaimer">{t("guide.disclaimer")}</p>;
}
