import { useEffect, useState } from "react";
import type { ImageItem } from "../types/content";

/** A row of thumbnails, or with `cover` a single framed cover photo (used
 * by the listing grids). Either way, clicking opens the full gallery. */
export function ImageStrip({ images, cover = false }: { images: ImageItem[]; cover?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sorted = [...images].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
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
        <button type="button" className="cover-frame" onClick={() => setOpenIndex(0)}>
          <img src={sorted[0].url} alt={sorted[0].alt_en ?? ""} loading="lazy" />
          {sorted.length > 1 && <span className="cover-count">1 / {sorted.length}</span>}
        </button>
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
        <div className="lightbox-backdrop" onClick={() => setOpenIndex(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setOpenIndex(null)}
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
