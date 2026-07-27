import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHouseShowcase, saveHouseShowcase } from "../../firebase/houseShowcase";
import { ImageManager } from "../../components/admin/ImageManager";
import type { ImageItem } from "../../types/content";

export function HouseShowcaseAdmin() {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [storyEn, setStoryEn] = useState("");
  const [storyNo, setStoryNo] = useState("");
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHouseShowcase().then((data) => {
      if (data) {
        setStoryEn(data.story_en ?? "");
        setStoryNo(data.story_no ?? "");
        setAirbnbUrl(data.airbnbUrl ?? "");
        setContactUrl(data.contactUrl ?? "");
        setContactPhone(data.contactPhone ?? "");
        setContactEmail(data.contactEmail ?? "");
        setImages(data.images ?? []);
      }
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveHouseShowcase({
        story_en: storyEn,
        story_no: storyNo,
        airbnbUrl: airbnbUrl || null,
        contactUrl: contactUrl || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        images,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleImagesChange(next: ImageItem[]) {
    setImages(next);
    await saveHouseShowcase({ images: next });
  }

  if (!loaded) return <p>{t("common.loading")}</p>;

  return (
    <div>
      <h1>{t("admin.manageShowcase")}</h1>
      <p className="hint">{t("admin.showcaseHint")}</p>

      <div className="admin-section">
        <div className="form-row">
          <label className="field-label">{t("field.description")} (EN)</label>
          <textarea value={storyEn} onChange={(e) => setStoryEn(e.target.value)} rows={6} />
        </div>
        <div className="form-row">
          <label className="field-label">{t("field.description")} (NO)</label>
          <textarea value={storyNo} onChange={(e) => setStoryNo(e.target.value)} rows={6} />
        </div>
        <div className="form-row">
          <label className="field-label">{t("admin.airbnbUrl")}</label>
          <input value={airbnbUrl} onChange={(e) => setAirbnbUrl(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="field-label">{t("admin.contactUrl")}</label>
          <input value={contactUrl} onChange={(e) => setContactUrl(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="field-label">{t("admin.contactPhone")}</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="field-label">{t("admin.contactEmail")}</label>
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>

        <ImageManager
          collectionName="houseShowcase"
          docId="main"
          images={images}
          onChange={handleImagesChange}
        />
        <p className="hint">{t("admin.showcaseFirstImageHint")}</p>

        <div className="form-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
