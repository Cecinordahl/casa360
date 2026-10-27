import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageItem } from "../types/content";

/** A row of thumbnails, or with `cover` a single framed cover photo (used
 * by the listing grids). The cover can be paged in place: its left and right
 * edges (or a swipe) step through the photos, and the middle opens the full
 * gallery at the photo on show. */
export function ImageStrip({ images, cover = false }: { images: ImageItem[]; cover?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [coverIndex, setCoverIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const sorted = useMemo(() => [...images].sort((a, b) => a.order - b.order), [images]);
  const count = sorted.length;
  // Photos can be removed in admin while a guest has the page open.
  const shown = Math.min(coverIndex, Math.max(count - 1, 0));

  function step(delta: number) {
    setCoverIndex((count + shown + delta) % count);
  }

  // Fetch the neighbours of the cover photo ahead of time, so paging
  // doesn't flash an empty frame while the next one downloads.
  useEffect(() => {
    if (!cover || count < 2) return;
    for (const i of [shown + 1, shown - 1 + count]) new Image().src = sorted[i % count].url;
  }, [cover, count, shown, sorted]);

  function closeLightbox() {
    // Leave the cover on whichever photo the guest ended on in the gallery.
    if (openIndex !== null) setCoverIndex(openIndex);
    setOpenIndex(null);
  }

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCoverIndex(openIndex ?? 0);
        setOpenIndex(null);
      }
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % sorted.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + sorted.length) % sorted.length));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, sorted.length]);

  // Listings without photos simply start with their text, rather than
  // showing an empty frame.
  if (images.length === 0) return null;

  return (
    <>
      {cover ? (
        <div
          className="cover-frame"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || count < 2) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          }}
        >
          <button type="button" className="cover-open" onClick={() => setOpenIndex(shown)}>
            <img src={sorted[shown].url} alt={sorted[shown].alt_en ?? ""} loading="lazy" />
          </button>
          {count > 1 && (
            <>
              <button type="button" className="cover-nav cover-prev" onClick={() => step(-1)} aria-label="Previous image">
                <span>‹</span>
              </button>
              <button type="button" className="cover-nav cover-next" onClick={() => step(1)} aria-label="Next image">
                <span>›</span>
              </button>
              <span className="cover-count">
                {shown + 1} / {count}
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="image-strip">
          {sorted.map((img, i) => (
            <img
              key={img.publicId}
              src={img.url}
              alt={img.alt_en ?? ""}
              loading="lazy"
              onClick={() => setOpenIndex(i)}
              style={{ cursor: "zoom-in" }}
            />
          ))}
        </div>
      )}

      {openIndex !== null && (
        <div className="lightbox-backdrop" onClick={closeLightbox}>
          <button
            type="button"
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close"
          >
            ×
          </button>
          {sorted.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((openIndex - 1 + sorted.length) % sorted.length);
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <img
            src={sorted[openIndex].url}
            alt={sorted[openIndex].alt_en ?? ""}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          {sorted.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((openIndex + 1) % sorted.length);
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
