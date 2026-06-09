"use client";

import { useState, useEffect } from "react";
import { DragDropList } from "@/components/admin/DragDropList";
import type { Render } from "@/types";

export default function AdminRendersPage() {
  const [renders, setRenders] = useState<Render[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/renders")
      .then((r) => r.json())
      .then(({ data }) => { setRenders(data); setLoading(false); });
  }, []);

  const handleUpload = async (file: File) => {
    if (!title.trim()) { alert("Introduceți un titlu"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title.trim());

    const res = await fetch("/api/renders", { method: "POST", body: formData });
    if (res.ok) {
      const { data } = await res.json();
      setRenders((prev) => [...prev, data]);
      setTitle("");
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ștergi această animație?")) return;
    await fetch(`/api/renders/${id}`, { method: "DELETE" });
    setRenders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReorder = async (ids: number[]) => {
    setRenders(ids.map((id) => renders.find((r) => r.id === id)!));
    await fetch("/api/renders/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-widest text-text-primary mb-4">Animații 3D</h1>

        <div className="flex gap-3 items-end">
          <div>
            <label className="admin-label">Titlu animație *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input w-64"
              placeholder="ex. Apartament modern Cluj"
            />
          </div>
          <label className="btn-secondary cursor-pointer self-end">
            <input
              type="file"
              accept="video/mp4,video/*"
              className="hidden"
              disabled={uploading || !title.trim()}
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            {uploading ? "Se încarcă..." : "+ Upload video"}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
      ) : renders.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-text-muted">Nicio animație.</p>
      ) : (
        <DragDropList
          items={renders}
          onReorder={handleReorder}
          renderItem={(render) => (
            <div className="flex items-center justify-between border border-border px-4 py-3 hover:bg-bg-card">
              <div>
                <span className="font-body text-sm text-text-primary">{render.title}</span>
              </div>
              <button onClick={() => handleDelete(render.id)} className="font-body text-xs text-text-faint hover:text-red-600">
                Șterge
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
