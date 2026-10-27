import { useEffect, useRef, useState } from "react";
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
  lastEdited,
  onEdit,
  onDelete,
}: {
  item: BaseItem & Record<string, unknown>;
  fields: FieldConfig[];
  lastEdited: boolean;
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
    <li
      id={`admin-row-${item.id}`}
      className={lastEdited ? "admin-row last-edited" : "admin-row"}
      ref={setNodeRef}
      style={style}
    >
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
  // Bumped every time an editor is opened. ItemForm copies `initial` into
  // its own state once, on mount, so without a fresh key switching from
  // item A straight to item B kept A's values on screen and the next save
  // wrote them over B. Not keyed on editingId itself: that changes from
  // "new" to the real id right after the first save, and remounting there
  // would reset the form mid-edit.
  const [editorSession, setEditorSession] = useState(0);
  // The row the host last saved. It stays highlighted so that when working
  // down the list item by item it's obvious where they left off.
  const [lastEditedId, setLastEditedId] = useState<string | null>(null);
  // Row to scroll back to once the editor has closed. Separate from
  // lastEditedId because Cancel scrolls back without marking anything.
  const [returnToId, setReturnToId] = useState<string | null>(null);
  // handleSave's create branch learns the new id after the form's submit
  // handler already captured `editingId`, so the id travels via a ref.
  const savedRef = useRef<{ id: string; created: boolean } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeAll(collectionName, setItems), [collectionName]);

  // The editor renders below the whole item list — with more than a
  // handful of items, opening it (especially "+ New item") can land well
  // below the fold and look like the click did nothing. Scroll it into view.
  useEffect(() => {
    if (editingId) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingId]);

  useEffect(() => {
    if (!returnToId) return;
    document.getElementById(`admin-row-${returnToId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setReturnToId(null);
  }, [returnToId]);

  function openEditor(id: string | "new") {
    setEditingId(id);
    setEditorSession((n) => n + 1);
  }

  const editingItem = editingId && editingId !== "new" ? items.find((i) => i.id === editingId) ?? null : null;

  async function handleSave(data: Record<string, unknown>) {
    if (editingId === "new") {
      const id = await createItem(collectionName, data);
      savedRef.current = { id, created: true };
      setEditingId(id);
    } else if (editingId) {
      await updateItem(collectionName, editingId, data);
      savedRef.current = { id: editingId, created: false };
    }
  }

  /** Runs after the Save button (not after image uploads, which also save).
   * A brand-new item stays open, because photos can only be added once it
   * exists; otherwise the editor closes and the list scrolls back to the row. */
  function handleSubmitted() {
    const saved = savedRef.current;
    savedRef.current = null;
    if (!saved) return;
    setLastEditedId(saved.id);
    if (saved.created) return;
    setEditingId(null);
    setReturnToId(saved.id);
  }

  function handleCancel() {
    if (editingId && editingId !== "new") setReturnToId(editingId);
    setEditingId(null);
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
        <button type="button" onClick={() => openEditor("new")}>
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
                lastEdited={item.id === lastEditedId}
                onEdit={() => openEditor(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {editingId && (
        <div className="admin-editor" ref={editorRef}>
          <h3>{editingId === "new" ? t("admin.newItem") : t("admin.editItem")}</h3>
          <ItemForm
            key={editorSession}
            collectionName={collectionName}
            fields={fields}
            initial={editingItem}
            itemId={editingId === "new" ? null : editingId}
            onSave={handleSave}
            onSubmitted={handleSubmitted}
            onCancel={handleCancel}
          />
        </div>
      )}
    </section>
  );
}
