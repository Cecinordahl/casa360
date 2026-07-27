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

const EDIT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
    <path
      d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DELETE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
    <path
      d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const [showMissingHint, setShowMissingHint] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const name = typeof item.name === "string" ? item.name : "(untitled)";
  const missing = hasMissingTranslation(item, fields);

  return (
    <li className="admin-row" ref={setNodeRef} style={style}>
      <span className="drag-handle" {...attributes} {...listeners} aria-label={t("admin.dragToReorder")}>
        ⠿
      </span>
      <span className="admin-row-name">{name}</span>
      {!item.published && <span className="badge draft">{t("common.draft")}</span>}
      {missing && (
        <span className="missing-indicator-wrap">
          <button
            type="button"
            className="icon-btn missing-indicator"
            onClick={() => setShowMissingHint((v) => !v)}
            aria-label={t("common.translationIncomplete")}
          >
            !
          </button>
          {showMissingHint && <span className="missing-tooltip">{t("common.translationIncomplete")}</span>}
        </span>
      )}
      <button type="button" className="icon-btn" onClick={onEdit} aria-label={t("common.edit")} title={t("common.edit")}>
        {EDIT_ICON}
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={onDelete}
        aria-label={t("common.delete")}
        title={t("common.delete")}
      >
        {DELETE_ICON}
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
