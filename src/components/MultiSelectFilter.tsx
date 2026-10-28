import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props<T extends string> {
  /** Button text when nothing is selected, e.g. "Categories". */
  label: string;
  /** Button text when something is selected, e.g. "Categories (2)". */
  countLabel: (count: number) => string;
  options: readonly T[];
  optionLabel: (option: T) => string;
  selected: T[];
  onChange: (selected: T[]) => void;
}

/** One pill button that opens a checklist; ticking several options keeps
 * them all selected. An empty selection means "show everything". */
export function MultiSelectFilter<T extends string>({
  label,
  countLabel,
  options,
  optionLabel,
  selected,
  onChange,
}: Props<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a tap outside the menu or on Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(option: T) {
    onChange(selected.includes(option) ? selected.filter((x) => x !== option) : [...selected, option]);
  }

  return (
    <div className="filter-dropdown filter-pill" ref={ref}>
      <button
        type="button"
        className={selected.length > 0 ? "filter-chip active" : "filter-chip"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selected.length === 0 ? label : countLabel(selected.length)}
        <span className="filter-dropdown-caret" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          <ul className="filter-dropdown-list">
            {options.map((o) => (
              <li key={o}>
                <label className="filter-dropdown-option">
                  <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
                  {optionLabel(o)}
                </label>
              </li>
            ))}
          </ul>
          <div className="filter-dropdown-actions">
            <button
              type="button"
              className="filter-dropdown-clear"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
            >
              {t("common.filterClear")}
            </button>
            <button type="button" className="filter-chip filter-pill active" onClick={() => setOpen(false)}>
              {t("common.filterDone")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
