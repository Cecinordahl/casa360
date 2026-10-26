import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGuest } from "../../context/GuestContext";
import { PageHeader } from "../../components/PageHeader";
import { PasscodeBox } from "../../components/PasscodeBox";

export function ManualLayout() {
  const { t } = useTranslation();
  const { code } = useGuest();

  // Once unlocked, the guest code lives in GuestContext and the manual
  // pages render straight away.
  if (code) return <Outlet />;

  return (
    <div>
      <PageHeader tracker={t("tracker.manual")} title={t("manual.gateTitle")} />
      <div className="manual-box manual-box--gate">
        <p>{t("manual.gateBody")}</p>
        <PasscodeBox />
      </div>
      <p className="hint manual-gate-note">{t("manual.softNotice")}</p>
    </div>
  );
}
