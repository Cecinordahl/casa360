import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGuest } from "../../context/GuestContext";

export function ManualLayout() {
  const { t } = useTranslation();
  const { code, tryUnlock } = useGuest();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (code) return <Outlet />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(false);
    const ok = await tryUnlock(input);
    setChecking(false);
    if (!ok) setError(true);
  }

  return (
    <div className="page-narrow">
      <h1>{t("manual.gateTitle")}</h1>
      <p>{t("manual.gateBody")}</p>
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-row">
          <label className="field-label">{t("manual.codeLabel")}</label>
          <input
            type="text"
            autoCapitalize="characters"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{t("manual.wrongCode")}</p>}
        <div className="form-actions">
          <button type="submit" disabled={checking}>
            {t("manual.unlock")}
          </button>
        </div>
      </form>
      <p className="hint">{t("manual.softNotice")}</p>
    </div>
  );
}
