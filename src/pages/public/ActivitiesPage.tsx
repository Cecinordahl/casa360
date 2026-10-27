import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribePublished } from "../../firebase/crud";
import { localized } from "../../utils/localized";
import { distanceSortKey } from "../../utils/distance";
import type { Activity, ActivityCategory, GeoPoint, Locale } from "../../types/content";
import { ImageStrip } from "../../components/ImageStrip";
import { PageHeader } from "../../components/PageHeader";
import { FormattedText } from "../../components/FormattedText";

// Leaflet is the bulk of this page's weight, so it only downloads once a
// guest actually opens the map.
const ActivityMap = lazy(() => import("../../components/ActivityMap"));

const CATEGORIES: ActivityCategory[] = [
  "golf",
  "tennis_padel",
  "beach_club",
  "beach",
  "running",
  "family",
  "fitness",
  "other",
];

type SortMode = "distance" | "price";
type ViewMode = "list" | "map";

function priceSortKey(a: Activity): number {
  return a.priceFrom ?? Infinity;
}

export function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Locale;
  const [items, setItems] = useState<Activity[]>([]);
  // Empty means "All" — no category narrowing.
  const [selected, setSelected] = useState<ActivityCategory[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const [view, setView] = useState<ViewMode>("list");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribePublished<Activity>("activities", setItems), []);

  const filtered = useMemo(
    () => items.filter((a) => selected.length === 0 || a.categories.some((c) => selected.includes(c))),
    [items, selected],
  );

  function toggleCategory(c: ActivityCategory) {
    setSelected((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  }

  // Close the category menu on a tap outside it or on Escape.
  useEffect(() => {
    if (!categoryMenuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!categoryMenuRef.current?.contains(e.target as Node)) setCategoryMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCategoryMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoryMenuOpen]);

  const anyPriceInFiltered = filtered.some((a) => a.priceFrom != null);

  // If the category filter changes to a set of activities where none have
  // a price on file, the Price chip disappears (below) — fall back to
  // distance so sortMode never points at a hidden control.
  useEffect(() => {
    if (sortMode === "price" && !anyPriceInFiltered) setSortMode("distance");
  }, [sortMode, anyPriceInFiltered]);

  const visible = useMemo(() => {
    const key = sortMode === "price" ? priceSortKey : distanceSortKey;
    return [...filtered].sort((a, b) => key(a) - key(b));
  }, [filtered, sortMode]);

  const somePricesMissing = sortMode === "price" && filtered.some((a) => a.priceFrom == null);

  const pinned = useMemo(
    () => visible.filter((a): a is Activity & { location: GeoPoint } => a.location != null),
    [visible],
  );

  // "Show details" in a map popup switches to the list, then scrolls to
  // that card once it has rendered.
  useEffect(() => {
    if (view !== "list" || !focusId) return;
    document.getElementById(`activity-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusId(null);
  }, [view, focusId]);

  function showDetails(id: string) {
    setFocusId(id);
    setView("list");
  }

  // Above the list, but below the map: in map view it would otherwise push
  // the map itself off-screen.
  const golfTip = selected.includes("golf") && (
    <div className="host-note golf-tip">
      <p>
        <strong>{t("activities.golfTip.title")}:</strong> {t("activities.golfTip.body")}
      </p>
      <p>{t("activities.golfTip.example")}</p>
      <p>
        <strong>{t("activities.golfTip.warningLabel")}:</strong> {t("activities.golfTip.warning")}
      </p>
      <p>{t("activities.golfTip.autumnOffer")}</p>
      <div className="card-links">
        <a href="https://www.golfamore.com/" target="_blank" rel="noreferrer">
          {t("activities.golfTip.link")}
        </a>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader tracker={t("tracker.activities")} title={t("activities.title")} />

      <div className="filters">
        <div>
          <div className="filter-group-label">{t("activities.filters.category")}</div>
          <div className="filter-dropdown" ref={categoryMenuRef}>
            <button
              type="button"
              className={selected.length > 0 ? "filter-chip active" : "filter-chip"}
              aria-haspopup="true"
              aria-expanded={categoryMenuOpen}
              onClick={() => setCategoryMenuOpen((o) => !o)}
            >
              {selected.length === 0
                ? t("activities.filters.categoriesButton")
                : t("activities.filters.categoriesButtonCount", { count: selected.length })}
              <span className="filter-dropdown-caret" aria-hidden="true">
                {categoryMenuOpen ? "▴" : "▾"}
              </span>
            </button>
            {categoryMenuOpen && (
              <div className="filter-dropdown-panel">
                <ul className="filter-dropdown-list">
                  {CATEGORIES.map((c) => (
                    <li key={c}>
                      <label className="filter-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selected.includes(c)}
                          onChange={() => toggleCategory(c)}
                        />
                        {t(`activities.category.${c}`)}
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="filter-dropdown-actions">
                  <button type="button" className="filter-dropdown-clear" onClick={() => setSelected([])} disabled={selected.length === 0}>
                    {t("activities.filters.clear")}
                  </button>
                  <button type="button" className="filter-chip active" onClick={() => setCategoryMenuOpen(false)}>
                    {t("activities.filters.done")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="filter-group-label">{t("activities.filters.view")}</div>
          <div className="filter-chip-row">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={view === v ? "filter-chip active" : "filter-chip"}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {t(`activities.filters.view_${v}`)}
              </button>
            ))}
          </div>
        </div>
        {view === "list" && (
          <div>
            <div className="filter-group-label">{t("activities.filters.sortBy")}</div>
            <div className="filter-chip-row">
              <button
                type="button"
                className={sortMode === "distance" ? "filter-chip active" : "filter-chip"}
                onClick={() => setSortMode("distance")}
              >
                {t("activities.filters.sortByDistance")}
              </button>
              {anyPriceInFiltered && (
                <button
                  type="button"
                  className={sortMode === "price" ? "filter-chip active" : "filter-chip"}
                  onClick={() => setSortMode("price")}
                >
                  {t("activities.filters.sortByPrice")}
                </button>
              )}
            </div>
            {somePricesMissing && <p className="hint">{t("activities.filters.priceIncompleteNote")}</p>}
          </div>
        )}
      </div>

      {view === "list" && golfTip}

      <p className="results-count">{t("activities.resultCount", { count: visible.length })}</p>

      {visible.length === 0 && <p>{t("common.empty")}</p>}

      {view === "map" && (
        <>
          <Suspense fallback={<div className="activity-map">{t("common.loading")}</div>}>
            <ActivityMap activities={pinned} onShowDetails={showDetails} />
          </Suspense>
          {pinned.length < visible.length && (
            <p className="hint">{t("activities.map.missingPins", { count: visible.length - pinned.length })}</p>
          )}
          {golfTip}
        </>
      )}

      {view === "list" && (
        <ul className="listing-grid">
          {visible.map((a) => (
            <li className="listing-card" key={a.id} id={`activity-${a.id}`}>
              <ImageStrip images={a.images} cover />
              <div className="listing-body">
                <p className="micro-label">
                  {a.categories.map((c) => t(`activities.category.${c}`)).join(", ")}
                </p>
                <h2>{a.name}</h2>
                <p className="card-meta">
                  {a.distanceWalkMin != null && t("common.walk", { min: a.distanceWalkMin })}
                  {a.distanceWalkMin != null && a.distanceDriveMin != null && " · "}
                  {a.distanceDriveMin != null && t("common.drive", { min: a.distanceDriveMin })}
                </p>
                {a.priceFrom != null && (
                  <p className="card-meta">{t("activities.priceFromLabel", { price: a.priceFrom })}</p>
                )}
                {a.openingHours && <p className="card-meta">{a.openingHours}</p>}
                {localized(a, "seasonNote", lang) && (
                  <p className="card-meta">
                    {t("activities.season")}: {localized(a, "seasonNote", lang)}
                  </p>
                )}
                <FormattedText text={localized(a, "description", lang)} />
                {localized(a, "hostTip", lang) && (
                  <p className="host-note">
                    <strong>{t("common.hostNote")}:</strong> {localized(a, "hostTip", lang)}
                  </p>
                )}
                <div className="card-links">
                  {a.bookingUrl && <a href={a.bookingUrl} target="_blank" rel="noreferrer">{t("common.book")}</a>}
                  {a.websiteUrl && <a href={a.websiteUrl} target="_blank" rel="noreferrer">{t("common.website")}</a>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
