"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HeroSlide } from "@/types";

function SortableSlideCard({
  slide,
  onDelete,
  onToggle,
}: {
  slide: HeroSlide;
  onDelete: (id: number) => void;
  onToggle: (id: number, active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border border-border cursor-grab select-none ${isDragging ? "opacity-50" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="relative overflow-hidden" style={{ height: "130px" }}>
        <Image src={slide.image} alt={`Hero slide ${slide.sortOrder}`} fill className="object-cover" sizes="220px" />
      </div>
      <div className="flex items-center gap-2 px-2.5 py-2 bg-bg-lighter">
        <span className="font-body flex-1 text-text-primary" style={{ fontSize: "10px", letterSpacing: "1px" }}>
          #{slide.sortOrder}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(slide.id, slide.active); }}
          className="font-body"
          style={{
            fontSize: "9px",
            letterSpacing: "1px",
            padding: "3px 8px",
            background: slide.active ? "rgba(39,174,96,0.15)" : "rgba(192,57,43,0.12)",
            color: slide.active ? "#27ae60" : "#c0392b",
            border: `1px solid ${slide.active ? "#27ae60" : "#c0392b"}`,
            cursor: "pointer",
          }}
        >
          {slide.active ? "ACTIVE" : "HIDDEN"}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(slide.id); }}
          className="text-text-primary hover:text-red-600 transition-colors"
          style={{ fontSize: "18px", lineHeight: "1", padding: "0 2px", background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    fetch("/api/hero")
      .then((r) => r.json())
      .then(({ data }) => { setSlides(data); setLoading(false); });
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/hero", { method: "POST", body: formData });
    if (res.ok) {
      const { data } = await res.json();
      setSlides((prev) => [...prev, data]);
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this slide?")) return;
    await fetch(`/api/hero/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggle = async (id: number, active: boolean) => {
    await fetch(`/api/hero/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = [...slides];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setSlides(reordered);

    await fetch("/api/hero/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">HERO SLIDES</h1>
        <Link
          href="/admin/projects"
          className="font-body text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
        >
          ← BACK
        </Link>
      </div>

      <p className="font-body text-sm text-text-muted mb-6" style={{ opacity: 0.75 }}>
        These images rotate in the homepage hero. Drag to reorder. Only{" "}
        <strong className="text-accent font-normal">active</strong> slides are shown on the site.
      </p>

      {loading ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "166px" }} />
          ))}
        </div>
      ) : slides.length === 0 ? null : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "8px",
              }}
            >
              {slides.map((slide) => (
                <SortableSlideCard
                  key={slide.id}
                  slide={slide}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!loading && slides.length === 0 && (
        <p className="font-body text-sm text-text-muted mb-6" style={{ fontSize: "12px", opacity: 0.5 }}>
          No slides yet — upload one below.
        </p>
      )}

      <label
        className="flex flex-col items-center justify-center cursor-pointer border border-dashed border-border hover:border-accent transition-colors"
        style={{ marginTop: "20px", padding: "24px" }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <p className="font-body text-sm text-text-muted">
          {uploading ? "Uploading..." : "Click to upload a new hero slide"}
        </p>
        <p className="font-body text-text-faint mt-1" style={{ fontSize: "10px", opacity: 0.6 }}>
          JPG, PNG, WebP — max 10MB
        </p>
      </label>
    </div>
  );
}
