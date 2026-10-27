import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Public pages Google should index, keyed by path. Title and description
// text lives in the locale files under "meta.<key>".
const INDEXED: Record<string, string> = {
  "/": "home",
  "/house": "house",
  "/activities": "activities",
  "/restaurants": "restaurants",
  "/groceries": "groceries",
  "/practical": "practical",
  "/getting-here": "gettingHere",
  "/privacy": "privacy",
};

function setMeta(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/** Keeps <title>, the meta description, robots and <html lang> in step with
 * the current route and language. Google renders the app's JavaScript, so
 * these per-page values are what it picks up for search results. The house
 * manual and admin are marked noindex (and disallowed in robots.txt). */
export function PageMeta() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language === "no" ? "nb" : "en";
    const key = INDEXED[pathname.replace(/\/+$/, "") || "/"];
    if (key) {
      document.title = t(`meta.${key}.title`);
      setMeta("description", t(`meta.${key}.description`));
      setMeta("robots", "index, follow");
    } else {
      document.title = t("meta.home.title");
      setMeta("robots", "noindex, nofollow");
    }
  }, [pathname, t, i18n.language]);

  return null;
}
