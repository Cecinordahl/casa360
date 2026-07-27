import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FieldConfig } from "./fieldConfig";
import { ImageManager } from "./ImageManager";
import type { ImageItem } from "../../types/content";

interface Props {
  collectionName: string;
  fields: FieldConfig[];
  initial: Record<string, unknown> | null; // null => creating a new item
  itemId: string | null; // set once the item has been created, enables image upload
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

function emptyValueFor(field: FieldConfig): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "multiselect":
      return [];
    case "number":
      return null;
    default:
      return "";
  }
}

export function ItemForm({ collectionName, fields, initial, itemId, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = { published: initial?.published ?? true };
    for (const f of fields) {
      if (f.type === "bilingualText") {
        base[`${f.key}_en`] = initial?.[`${f.key}_en`] ?? "";
        base[`${f.key}_no`] = initial?.[`${f.key}_no`] ?? "";
      } else {
        base[f.key] = initial?.[f.key] ?? emptyValueFor(f);
      }
    }
    return base;
  });
  const [images, setImages] = useState<ImageItem[]>(
    (initial?.images as ImageItem[] | undefined) ?? [],
  );
  const [saving, setSaving] = useState(false);

  function setField(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...values, images });
    } finally {
      setSaving(false);
    }
  }

  async function handleImagesChange(next: ImageItem[]) {
    setImages(next);
    // Persist immediately so a page refresh mid-edit never loses uploads.
    await onSave({ ...values, images: next });
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {fields.map((field) => {
        if (field.type === "bilingualText") {
          return (
            <div className="form-row" key={field.key}>
              <label className="field-label">{t(field.labelKey)}</label>
              <div className="bilingual-pair">
                <div>
                  <span className="lang-tag">EN</span>
                  {field.multiline ? (
                    <textarea
                      value={String(values[`${field.key}_en`] ?? "")}
                      onChange={(e) => setField(`${field.key}_en`, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(values[`${field.key}_en`] ?? "")}
                      onChange={(e) => setField(`${field.key}_en`, e.target.value)}
                    />
                  )}
                  {!values[`${field.key}_en`] && (
                    <span className="missing-badge">
                      {t("common.missingTranslation", { lang: "EN" })}
                    </span>
                  )}
                </div>
                <div>
                  <span className="lang-tag">NO</span>
                  {field.multiline ? (
                    <textarea
                      value={String(values[`${field.key}_no`] ?? "")}
                      onChange={(e) => setField(`${field.key}_no`, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(values[`${field.key}_no`] ?? "")}
                      onChange={(e) => setField(`${field.key}_no`, e.target.value)}
                    />
                  )}
                  {!values[`${field.key}_no`] && (
                    <span className="missing-badge">
                      {t("common.missingTranslation", { lang: "NO" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (field.type === "boolean") {
          return (
            <label className="form-row checkbox-row" key={field.key}>
              <input
                type="checkbox"
                checked={Boolean(values[field.key])}
                onChange={(e) => setField(field.key, e.target.checked)}
              />
              {t(field.labelKey)}
            </label>
          );
        }

        if (field.type === "number") {
          const raw = values[field.key];
          return (
            <div className="form-row" key={field.key}>
              <label className="field-label">{t(field.labelKey)}</label>
              <input
                type="number"
                value={raw === null || raw === undefined ? "" : String(raw)}
                onChange={(e) =>
                  setField(field.key, e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div className="form-row" key={field.key}>
              <label className="field-label">{t(field.labelKey)}</label>
              <select
                value={String(values[field.key] ?? "")}
                onChange={(e) => setField(field.key, e.target.value)}
              >
                <option value="" disabled>
                  {t("common.all")}
                </option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === "multiselect") {
          const current = (values[field.key] as string[] | undefined) ?? [];
          return (
            <div className="form-row" key={field.key}>
              <label className="field-label">{t(field.labelKey)}</label>
              <div className="checkbox-list">
                {field.options.map((opt) => (
                  <label key={opt.value} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={current.includes(opt.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...current, opt.value]
                          : current.filter((v) => v !== opt.value);
                        setField(field.key, next);
                      }}
                    />
                    {t(opt.labelKey)}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        // text | url
        return (
          <div className="form-row" key={field.key}>
            <label className="field-label">{t(field.labelKey)}</label>
            <input
              type={field.type === "url" ? "url" : "text"}
              required={field.type === "text" && field.required}
              value={String(values[field.key] ?? "")}
              onChange={(e) => setField(field.key, e.target.value)}
            />
          </div>
        );
      })}

      <label className="form-row checkbox-row">
        <input
          type="checkbox"
          checked={Boolean(values.published)}
          onChange={(e) => setField("published", e.target.checked)}
        />
        {t("admin.published")}
      </label>

      {itemId ? (
        <ImageManager
          collectionName={collectionName}
          docId={itemId}
          images={images}
          onChange={handleImagesChange}
        />
      ) : (
        <p className="hint">{t("common.save")} → {t("admin.images")}</p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {t("common.save")}
        </button>
        <button type="button" onClick={onCancel}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
