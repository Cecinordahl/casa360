import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGuest } from "../context/GuestContext";

/** Forest-green guest-code entry for the house manual. Uses the same
 * tryUnlock check as the manual gate, so a code entered here unlocks the
 * manual everywhere. */
export function PasscodeBox({ onUnlocked }: { onUnlocked?: () => void }) {
  const { t } = useTranslation();
  const { tryUnlock } = useGuest();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(false);
    const ok = await tryUnlock(input);
    setChecking(false);
    if (ok) onUnlocked?.();
    else setError(true);
  }

  return (
    <form onSubmit={handleSubmit} className="passcode-form">
      <label className="micro-label" htmlFor="guest-code-input">
        {t("manual.codeLabel")}
      </label>
      <div className="passcode-row">
        <input
          id="guest-code-input"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button type="submit" disabled={checking}>
          {t("manual.unlock")}
        </button>
      </div>
      {error && (
        <p className="passcode-error" role="alert">
          {t("manual.wrongCode")}
        </p>
      )}
    </form>
  );
}
