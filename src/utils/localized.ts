import type { Locale } from "../types/content";

/** Reads `${field}_en` / `${field}_no` off an object, falling back to
 * English (or the other language, if English is the one missing) so the
 * guide never shows a blank field to a guest — the admin UI is what's
 * responsible for flagging missing translations to the host. */
export function localized<T extends object>(item: T, field: string, lang: Locale): string {
  const record = item as Record<string, unknown>;
  const primary = record[`${field}_${lang}`];
  if (typeof primary === "string" && primary.trim() !== "") return primary;
  const other: Locale = lang === "en" ? "no" : "en";
  const fallback = record[`${field}_${other}`];
  return typeof fallback === "string" ? fallback : "";
}

export function isTranslationMissing<T extends object>(
  item: T,
  field: string,
  lang: Locale,
): boolean {
  const record = item as Record<string, unknown>;
  const value = record[`${field}_${lang}`];
  return typeof value !== "string" || value.trim() === "";
}
