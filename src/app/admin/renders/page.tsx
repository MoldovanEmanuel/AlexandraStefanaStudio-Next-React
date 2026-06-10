"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { DragDropList } from "@/components/admin/DragDropList";
import type { Render } from "@/types";

export default function AdminRendersPage() {
  const [renders, setRenders] = useState<Render[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [editTitles, setEditTitles] = useState<Record<number, string>>({});
  const [uploadError, setUploadError] = useState("");

  // Portfolio cover state
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [savingCover, setSavingCover] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/renders").then((r) => r.json()),
      fetch("/api/renders/cover").then((r) => r.json()),
    ]).then(([rendersRes, coverRes]) => {
      setRenders(rendersRes.data ?? []);
      setCoverUrl(coverRes.url ?? null);
      setLoading(false);
    });
  }, []);

  const handleCoverUpload = async (file: File) => {
    setSavingCover(true);
    const formData = new FormData();
    formData.append("cover", file);
    const res = await fetch("/api/renders/cover", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setCoverUrl(url);
    }
    setSavingCover(false);
  };

  const handleUpload = async () => {
    if (!title.trim() || !pendingVideo) return;
    setUploading(true);
    setUploadError("");
    const params = new URLSearchParams({ title: title.trim(), filename: pendingVideo.name });
    const res = await fetch(`/api/renders?${params}`, {
      method: "POST",
      body: pendingVideo,
      headers: { "Content-Type": "video/mp4" },
    });
    if (res.ok) {
      // Re-fetch the full list so the table is always in sync with the database
      const fresh = await fetch("/api/renders").then((r) => r.json());
      setRenders(fresh.data ?? []);
      setTitle("");
      setPendingVideo(null);
    } else {
      const json = await res.json().catch(() => null);
      setUploadError(json?.error ?? "Upload failed — check server logs");
    }
    setUploading(false);
  };

  const handlePerRenderCoverUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("cover", file);
    const res = await fetch(`/api/renders/${id}/cover`, { method: "POST", body: formData });
    if (res.ok) {
      const { data } = await res.json();
      setRenders((prev) => prev.map((r) => (r.id === id ? data : r)));
    }
  };

  const handleTitleSave = async (id: number) => {
    const newTitle = editTitles[id]?.trim();
    if (!newTitle) return;
    const res = await fetch(`/api/renders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      setRenders((prev) => prev.map((r) => (r.id === id ? { ...r, title: newTitle } : r)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this render?")) return;
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
        <h1 className="font-display text-2xl tracking-widest text-text-primary">3D RENDERS</h1>
      </div>

      {/* Portfolio cover image */}
      <div
        className="border border-border mb-7"
        style={{ background: "var(--color-bg-lighter, #1a1210)", padding: "28px", maxWidth: "600px" }}
      >
        <p className="font-body uppercase tracking-widest text-accent mb-4" style={{ fontSize: "11px", letterSpacing: "2px" }}>
          PORTFOLIO COVER IMAGE
        </p>
        {/* Show pending preview if chosen, otherwise current saved cover */}
        {pendingCover ? (
          <div className="mb-4">
            <img
              src={URL.createObjectURL(pendingCover)}
              alt="Preview"
              style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block", marginBottom: "8px" }}
            />
            <p className="font-body text-text-muted" style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {pendingCover.name}
            </p>
          </div>
        ) : coverUrl ? (
          <img
            src={coverUrl}
            alt="Renders cover"
            style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block", marginBottom: "16px" }}
          />
        ) : null}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="admin-label">UPLOAD COVER (JPG/PNG/WEBP)</label>
            <input
              type="file"
              accept="image/*"
              disabled={savingCover}
              onChange={(e) => setPendingCover(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            type="button"
            disabled={savingCover || !pendingCover}
            onClick={() => pendingCover && handleCoverUpload(pendingCover)}
            className="font-body uppercase tracking-widest border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50 shrink-0"
            style={{ fontSize: "11px", padding: "9px 14px", whiteSpace: "nowrap" }}
          >
            {savingCover ? "SAVING..." : "SAVE COVER"}
          </button>
        </div>
      </div>

      {/* Upload render form */}
      <div
        className="border border-border mb-10"
        style={{ background: "var(--color-bg-lighter, #1a1210)", padding: "28px", maxWidth: "600px" }}
      >
        <div className="mb-4">
          <label className="admin-label">TITLE</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="admin-input"
            placeholder="e.g. Living Room Concept"
          />
        </div>
        <div className="mb-4">
          <label className="admin-label">VIDEO FILE (MP4 only, max 200 MB)</label>
          <input
            type="file"
            accept="video/mp4"
            disabled={uploading}
            onChange={(e) => setPendingVideo(e.target.files?.[0] ?? null)}
          />
        </div>
        <button
          type="button"
          disabled={uploading || !title.trim() || !pendingVideo}
          onClick={handleUpload}
          className="font-body uppercase tracking-widest bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ fontSize: "12px", padding: "8px 20px", marginTop: "8px" }}
        >
          {uploading ? "UPLOADING..." : "UPLOAD RENDER"}
        </button>
        {uploadError && (
          <p className="font-body text-xs text-red-600 mt-2">{uploadError}</p>
        )}
      </div>

      {/* Renders list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}
        </div>
      ) : renders.length === 0 ? (
        <p className="font-body text-sm text-text-muted" style={{ opacity: 0.4 }}>No renders uploaded yet.</p>
      ) : (
        <>
          {/* Table header */}
          <div className="flex items-center gap-3 border-b border-border pb-2 mb-1">
            <div className="w-9 shrink-0" />
            <div
              className="flex-1 grid font-body text-xs uppercase tracking-widest text-text-muted"
              style={{ gridTemplateColumns: "28px 90px 130px 1fr 80px" }}
            >
              <span>#</span>
              <span>COVER</span>
              <span>VIDEO PREVIEW</span>
              <span>TITLE</span>
              <span>ACTIONS</span>
            </div>
          </div>

          <DragDropList
            items={renders}
            onReorder={handleReorder}
            renderItem={(render) => (
              <div
                className="grid items-center border-b border-border py-2"
                style={{ gridTemplateColumns: "28px 90px 130px 1fr 80px" }}
              >
                <span className="font-body text-xs text-text-faint">{render.sortOrder}</span>

                {/* Per-render cover (portrait 80×120) */}
                <label className="cursor-pointer relative block" style={{ width: "80px" }} title="Click to upload cover">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePerRenderCoverUpload(render.id, e.target.files[0])}
                  />
                  {render.coverImage ? (
                    <div className="relative" style={{ width: "80px", height: "120px" }}>
                      <Image src={render.coverImage} alt={render.title} fill className="object-cover" sizes="80px" />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.55)", fontSize: "9px", letterSpacing: "2px", color: "#fff" }}
                      >
                        REPLACE
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{ width: "80px", height: "120px", background: "#1a1210" }}
                    >
                      <span className="font-body text-center text-text-faint" style={{ fontSize: "9px", letterSpacing: "1px", lineHeight: 1.6 }}>
                        + ADD<br />COVER
                      </span>
                    </div>
                  )}
                </label>

                {/* Video preview */}
                <div className="pl-2">
                  <video
                    src={render.videoPath}
                    style={{ width: "120px", height: "68px", objectFit: "cover", display: "block", background: "#0f0b09" }}
                    preload="metadata"
                    muted
                  />
                </div>

                {/* Inline title edit */}
                <div className="flex items-center gap-2 pl-2 pr-2">
                  <input
                    className="flex-1 bg-bg border border-border text-text-primary font-body"
                    style={{ padding: "6px 10px", fontSize: "12px" }}
                    value={editTitles[render.id] ?? render.title}
                    onChange={(e) => setEditTitles((prev) => ({ ...prev, [render.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => handleTitleSave(render.id)}
                    className="font-body uppercase tracking-widest border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors shrink-0"
                    style={{ fontSize: "11px", padding: "5px 10px" }}
                  >
                    SAVE
                  </button>
                </div>

                {/* Delete */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleDelete(render.id)}
                    className="font-body uppercase tracking-widest border border-red-700 text-red-600 hover:bg-red-700 hover:text-white transition-colors"
                    style={{ fontSize: "11px", padding: "5px 10px" }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          />

          <p className="font-body text-sm mt-4 text-text-muted" style={{ opacity: 0.75 }}>
            Drag rows to reorder renders on the site.
          </p>
        </>
      )}
    </div>
  );
}
