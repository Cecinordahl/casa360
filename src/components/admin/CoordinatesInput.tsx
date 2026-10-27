import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { GeoPoint } from "../../types/content";
import { formatCoordinates, parseCoordinates, placeUrl } from "../../utils/coordinates";

interface Props {
  label: string;
  value: GeoPoint | null;
  onChange: (value: GeoPoint | null) => void;
}

/** Free-text box that accepts a Google Maps link or a "lat, lng" pair and
 * stores only the parsed point. The raw text is kept locally so a paste
 * that doesn't parse stays visible to fix instead of silently vanishing. */
export function CoordinatesInput({ label, value, onChange }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(value ? formatCoordinates(value) : "");
  const invalid = text.trim() !== "" && value === null;

  function handleChange(next: string) {
    setText(next);
    onChange(next.trim() === "" ? null : parseCoordinates(next));
  }

  return (
    <div className="form-row">
      <label className="field-label">{label}</label>
      <input
        type="text"
        value={text}
        placeholder="https://www.google.com/maps/place/…  or  36.2900, -5.3000"
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => value && setText(formatCoordinates(value))}
      />
      {value && (
        <p className="hint">
          {t("admin.coordinatesFound", { coords: formatCoordinates(value) })}{" "}
          <a href={placeUrl(value)} target="_blank" rel="noreferrer">
            {t("admin.coordinatesCheck")}
          </a>
        </p>
      )}
      {invalid && <p className="error-text">{t("admin.coordinatesInvalid")}</p>}
      {!text && <p className="hint">{t("admin.coordinatesHelp")}</p>}
    </div>
  );
}
