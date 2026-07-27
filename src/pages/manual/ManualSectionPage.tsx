import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSectionBody } from "../../firebase/houseManual";
import { useGuest } from "../../context/GuestContext";
import { localized } from "../../utils/localized";
import type { HouseManualSectionBody, HouseManualSectionKey, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <p className="copy-field">
      <strong>{label}:</strong> <code>{value}</code>{" "}
      <button type="button" onClick={handleCopy}>
        {copied ? t("common.copied") : t("common.copy")}
      </button>
    </p>
  );
}

export function ManualSectionPage() {
  const { key } = useParams<{ key: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const { code } = useGuest();
  const [body, setBody] = useState<HouseManualSectionBody | null>(null);

  useEffect(() => {
    if (!code || !key) return;
    getSectionBody(code, key as HouseManualSectionKey).then(setBody);
  }, [code, key]);

  if (!key) return null;
  if (!body) return <p>{t("common.loading")}</p>;

  return (
    <div>
      <h1>{t(`manual.sections.${key}`)}</h1>
      <ImageStrip images={body.images} />
      <p style={{ whiteSpace: "pre-line" }}>{localized(body, "body", lang)}</p>

      {key === "wifi" && body.wifiSsid && (
        <>
          <CopyField label={t("manual.wifiNetwork")} value={body.wifiSsid} />
          {body.wifiPassword && <CopyField label={t("manual.wifiPassword")} value={body.wifiPassword} />}
        </>
      )}

      {key === "emergency" && (
        <>
          <p className="host-note">{t("manual.emergencyCall")}</p>
          {body.hostPhone && <CopyField label={t("manual.hostPhone")} value={body.hostPhone} />}
          {body.hospitalName && (
            <p>
              <strong>{t("manual.nearestHospital")}:</strong> {body.hospitalName}{" "}
              {body.hospitalMapUrl && (
                <a href={body.hospitalMapUrl} target="_blank" rel="noreferrer">
                  {t("common.map")}
                </a>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}
