"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DragDropItem {
  id: number;
  [key: string]: unknown;
}

interface DragDropListProps<T extends DragDropItem> {
  items: T[];
  onReorder: (ids: number[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

function SortableItem<T extends DragDropItem>({
  item,
  renderItem,
}: {
  item: T;
  renderItem: (item: T) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 ${isDragging ? "opacity-50 bg-bg-card" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 text-text-faint hover:text-text-muted"
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="3" width="2" height="2" />
          <rect x="10" y="3" width="2" height="2" />
          <rect x="4" y="7" width="2" height="2" />
          <rect x="10" y="7" width="2" height="2" />
          <rect x="4" y="11" width="2" height="2" />
          <rect x="10" y="11" width="2" height="2" />
        </svg>
      </button>
      <div className="flex-1">{renderItem(item)}</div>
    </div>
  );
}

export function DragDropList<T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
}: DragDropListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((i) => i.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((item) => (
            <SortableItem key={item.id} item={item} renderItem={renderItem} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
