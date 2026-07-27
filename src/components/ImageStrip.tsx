import type { ImageItem } from "../types/content";

export function ImageStrip({ images }: { images: ImageItem[] }) {
  if (images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.order - b.order);
  return (
    <div className="image-strip">
      {sorted.map((img) => (
        <img key={img.publicId} src={img.url} alt={img.alt_en ?? ""} loading="lazy" />
      ))}
    </div>
  );
}
