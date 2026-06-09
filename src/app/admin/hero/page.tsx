"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { DragDropList } from "@/components/admin/DragDropList";
import type { HeroSlide } from "@/types";

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Ștergi acest slide?")) return;
    await fetch(`/api/hero/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggle = async (id: number, active: boolean) => {
    await fetch(`/api/hero/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, active: !active } : s));
  };

  const handleReorder = async (ids: number[]) => {
    const reordered = ids.map((id) => slides.find((s) => s.id === id)!);
    setSlides(reordered);
    await fetch("/api/hero/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">Hero Slides</h1>
        <label className="btn-secondary cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          {uploading ? "Se încarcă..." : "+ Adaugă slide"}
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-video skeleton" />)}</div>
      ) : slides.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-text-muted">Niciun slide. Adaugă prima imagine.</p>
      ) : (
        <DragDropList
          items={slides}
          onReorder={handleReorder}
          renderItem={(slide) => (
            <div className="flex items-center gap-4 border border-border p-3 hover:bg-bg-card">
              <div className="relative w-32 h-20 shrink-0 overflow-hidden">
                <Image src={slide.image} alt="Hero slide" fill className="object-cover" sizes="128px" />
              </div>
              <div className="flex-1">
                <span className={`font-body text-xs ${slide.active ? "text-green-600" : "text-text-faint"}`}>
                  {slide.active ? "Activ" : "Inactiv"}
                </span>
              </div>
              <button onClick={() => handleToggle(slide.id, slide.active)} className="btn-secondary text-xs">
                {slide.active ? "Dezactivează" : "Activează"}
              </button>
              <button onClick={() => handleDelete(slide.id)} className="font-body text-xs text-text-faint hover:text-red-600">
                Șterge
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
