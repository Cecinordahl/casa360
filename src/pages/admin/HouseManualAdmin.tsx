import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAppConfig,
  getSectionBody,
  rotateGuestCode,
  saveSectionBody,
} from "../../firebase/houseManual";
import { generateGuestCode } from "../../utils/guestCode";
import { HOUSE_MANUAL_SECTION_KEYS } from "../../types/content";
import type { HouseManualSectionBody, HouseManualSectionKey } from "../../types/content";
import { ImageManager } from "../../components/admin/ImageManager";
import type { ImageItem } from "../../types/content";

function emptyBody(key: HouseManualSectionKey, order: number): HouseManualSectionBody {
  return { key, body_en: "", body_no: "", images: [], order };
}

function SectionEditor({
  code,
  sectionKey,
  body,
}: {
  code: string;
  sectionKey: HouseManualSectionKey;
  body: HouseManualSectionBody;
}) {
  const { t } = useTranslation();
  const [bodyEn, setBodyEn] = useState(body.body_en);
  const [bodyNo, setBodyNo] = useState(body.body_no);
  const [wifiSsid, setWifiSsid] = useState(body.wifiSsid ?? "");
  const [wifiPassword, setWifiPassword] = useState(body.wifiPassword ?? "");
  const [hostPhone, setHostPhone] = useState(body.hostPhone ?? "");
  const [hospitalName, setHospitalName] = useState(body.hospitalName ?? "");
  const [hospitalMapUrl, setHospitalMapUrl] = useState(body.hospitalMapUrl ?? "");
  const [images, setImages] = useState<ImageItem[]>(body.images ?? []);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSectionBody(code, sectionKey, {
        body_en: bodyEn,
        body_no: bodyNo,
        wifiSsid: sectionKey === "wifi" ? wifiSsid : null,
        wifiPassword: sectionKey === "wifi" ? wifiPassword : null,
        hostPhone: sectionKey === "emergency" ? hostPhone : null,
        hospitalName: sectionKey === "emergency" ? hospitalName : null,
        hospitalMapUrl: sectionKey === "emergency" ? hospitalMapUrl : null,
        images,
        order: body.order,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleImagesChange(next: ImageItem[]) {
    setImages(next);
    await saveSectionBody(code, sectionKey, { images: next, order: body.order });
  }

  return (
    <div className="admin-editor">
      <h3>{t(`manual.sections.${sectionKey}`)}</h3>
      <div className="form-row">
        <label className="field-label">{t("field.description")} (EN)</label>
        <textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} rows={6} />
      </div>
      <div className="form-row">
        <label className="field-label">{t("field.description")} (NO)</label>
        <textarea value={bodyNo} onChange={(e) => setBodyNo(e.target.value)} rows={6} />
      </div>

      {sectionKey === "wifi" && (
        <>
          <div className="form-row">
            <label className="field-label">{t("manual.wifiNetwork")}</label>
            <input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="field-label">{t("manual.wifiPassword")}</label>
            <input value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
          </div>
        </>
      )}

      {sectionKey === "emergency" && (
        <>
          <div className="form-row">
            <label className="field-label">{t("manual.hostPhone")}</label>
            <input value={hostPhone} onChange={(e) => setHostPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="field-label">{t("manual.nearestHospital")}</label>
            <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="field-label">{t("common.map")}</label>
            <input value={hospitalMapUrl} onChange={(e) => setHospitalMapUrl(e.target.value)} />
          </div>
        </>
      )}

      <ImageManager
        collectionName="houseManual"
        docId={sectionKey}
        images={images}
        onChange={handleImagesChange}
      />

      <div className="form-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}

export function HouseManualAdmin() {
  const { t } = useTranslation();
  const [code, setCode] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<
    HouseManualSectionKey,
    HouseManualSectionBody
  > | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotateMessage, setRotateMessage] = useState<string | null>(null);

  async function loadAll() {
    let config = await getAppConfig();
    if (!config) {
      await rotateGuestCode(generateGuestCode());
      config = await getAppConfig();
    }
    const liveCode = config?.currentGuestCode ?? "";
    setCode(liveCode);

    const entries = await Promise.all(
      HOUSE_MANUAL_SECTION_KEYS.map(async (key, index) => {
        const body = (await getSectionBody(liveCode, key)) ?? emptyBody(key, index);
        return [key, body] as const;
      }),
    );
    setSections(Object.fromEntries(entries) as Record<HouseManualSectionKey, HouseManualSectionBody>);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleRotate() {
    if (!confirm(t("admin.rotateConfirm"))) return;
    setRotating(true);
    setRotateMessage(t("admin.rotateWorking"));
    try {
      await rotateGuestCode(generateGuestCode());
      await loadAll();
      setRotateMessage(t("admin.rotateDone"));
    } finally {
      setRotating(false);
    }
  }

  if (!sections || !code) return <p>{t("common.loading")}</p>;

  return (
    <div>
      <h1>{t("admin.manageManual")}</h1>

      <section className="admin-section">
        <h2>{t("admin.guestCode")}</h2>
        <p>
          {t("admin.currentCode")}: <code className="guest-code">{code}</code>
        </p>
        <button type="button" onClick={handleRotate} disabled={rotating}>
          {t("admin.rotateCode")}
        </button>
        {rotateMessage && <p className="hint">{rotateMessage}</p>}
      </section>

      {HOUSE_MANUAL_SECTION_KEYS.map((key) => (
        <SectionEditor key={key} code={code} sectionKey={key} body={sections[key]} />
      ))}
    </div>
  );
}
