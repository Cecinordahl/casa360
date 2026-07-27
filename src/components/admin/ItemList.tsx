import { useEffect, useState } from "react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FieldConfig } from "./fieldConfig";
import { ItemForm } from "./ItemForm";
import { createItem, deleteItem, reorderItems, subscribeAll, updateItem } from "../../firebase/crud";
import type { BaseItem } from "../../types/content";

interface Props {
  collectionName: string;
  fields: FieldConfig[];
  titleKey: string;
}

function hasMissingTranslation(item: Record<string, unknown>, fields: FieldConfig[]): boolean {
  return fields.some((f) => {
    if (f.type !== "bilingualText") return false;
    const en = item[`${f.key}_en`];
    const no = item[`${f.key}_no`];
    return !en || !no;
  });
}

function SortableRow({
  item,
  fields,
  onEdit,
  onDelete,
}: {
  item: BaseItem & Record<string, unknown>;
  fields: FieldConfig[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const name = typeof item.name === "string" ? item.name : "(untitled)";

  return (
    <li className="admin-row" ref={setNodeRef} style={style}>
      <span className="drag-handle" {...attributes} {...listeners} aria-label={t("admin.dragToReorder")}>
        ⠿
      </span>
      <span className="admin-row-name">{name}</span>
      {!item.published && <span className="badge draft">{t("common.draft")}</span>}
      {hasMissingTranslation(item, fields) && (
        <span className="badge missing">{t("common.translationIncomplete")}</span>
      )}
      <button type="button" onClick={onEdit}>
        {t("common.edit")}
      </button>
      <button type="button" onClick={onDelete}>
        {t("common.delete")}
      </button>
    </li>
  );
}

export function ItemList({ collectionName, fields, titleKey }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<(BaseItem & Record<string, unknown>)[]>([]);
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => subscribeAll(collectionName, setItems), [collectionName]);

  const editingItem = editingId && editingId !== "new" ? items.find((i) => i.id === editingId) ?? null : null;

  async function handleSave(data: Record<string, unknown>) {
    if (editingId === "new") {
      const id = await createItem(collectionName, data);
      setEditingId(id);
    } else if (editingId) {
      await updateItem(collectionName, editingId, data);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("common.confirmDelete"))) return;
    await deleteItem(collectionName, id);
    if (editingId === id) setEditingId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    reorderItems(collectionName, reordered.map((i) => i.id));
  }

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2>{t(titleKey)}</h2>
        <button type="button" onClick={() => setEditingId("new")}>
          + {t("admin.newItem")}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="admin-list">
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                fields={fields}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {editingId && (
        <div className="admin-editor">
          <h3>{editingId === "new" ? t("admin.newItem") : t("admin.editItem")}</h3>
          <ItemForm
            collectionName={collectionName}
            fields={fields}
            initial={editingItem}
            itemId={editingId === "new" ? null : editingId}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}
    </section>
  );
}
