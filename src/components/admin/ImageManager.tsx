import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ImageItem } from "../../types/content";
import { deleteImage, uploadImage } from "../../utils/image";

interface Props {
  collectionName: string;
  docId: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

function SortableThumb({
  image,
  onRemove,
}: {
  image: ImageItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image.publicId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div className="image-thumb" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={image.url} alt={image.alt_en ?? ""} />
      <button
        type="button"
        className="image-thumb-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove image"
      >
        ×
      </button>
    </div>
  );
}

export function ImageManager({ collectionName, docId, images, onChange }: Props) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      let nextOrder = images.length;
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(collectionName, docId, file, nextOrder));
        nextOrder += 1;
      }
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(image: ImageItem) {
    await deleteImage(image.publicId);
    onChange(
      images
        .filter((i) => i.publicId !== image.publicId)
        .map((img, idx) => ({ ...img, order: idx })),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.publicId === active.id);
    const newIndex = images.findIndex((i) => i.publicId === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      order: idx,
    }));
    onChange(reordered);
  }

  return (
    <div className="image-manager">
      <label className="field-label">{t("admin.images")}</label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((i) => i.publicId)} strategy={rectSortingStrategy}>
          <div className="image-grid">
            {images.map((image) => (
              <SortableThumb key={image.publicId} image={image} onRemove={() => handleRemove(image)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {images.length > 0 && <p className="hint">{t("admin.dragToReorder")}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      {uploading && <span>{t("common.loading")}</span>}
    </div>
  );
}
