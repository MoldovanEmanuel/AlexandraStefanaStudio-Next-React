"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import type { GalleryImage } from "@/types";

interface GalleryUploaderProps {
  projectId: number;
  gallery: GalleryImage[];
  onChange: (gallery: GalleryImage[]) => void;
}

export function GalleryUploader({ projectId, gallery, onChange }: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Always-current gallery ref so uploads don't clobber orientation changes
  const galleryRef = useRef(gallery);
  useEffect(() => { galleryRef.current = gallery; }, [gallery]);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const fileArray = Array.from(files);
      const newImages: GalleryImage[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await fetch(`/api/projects/${projectId}/gallery`, {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const { data } = await res.json();
            newImages.push({ src: data.src, orientation: "landscape" as const });
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      if (newImages.length > 0) {
        onChange([...galleryRef.current, ...newImages]);
      }
      setUploading(false);
    },
    [projectId, onChange],
  );

  const handleRemove = async (src: string) => {
    const res = await fetch(`/api/projects/${projectId}/gallery`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });
    if (res.ok) onChange(gallery.filter((img) => img.src !== src));
  };

  const handleOrientation = async (src: string, orientation: GalleryImage["orientation"]) => {
    const res = await fetch(`/api/projects/${projectId}/gallery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src, orientation }),
    });
    if (res.ok) onChange(gallery.map((img) => img.src === src ? { ...img, orientation } : img));
  };

  return (
    <div>
      {/* Gallery grid */}
      {gallery.length > 0 && (
        <div
          className="grid gap-3 mb-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
        >
          {gallery.map((img, i) => (
            <div key={i} className="relative border border-border" style={{ background: "#0f0b09" }}>
              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(img.src)}
                className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors"
                style={{ width: "22px", height: "22px", fontSize: "13px", lineHeight: 1 }}
                title="Remove"
              >
                ×
              </button>

              {/* Image */}
              <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                <Image src={img.src} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="200px" />
              </div>

              {/* Orientation dropdown */}
              <select
                value={img.orientation}
                onChange={(e) => handleOrientation(img.src, e.target.value as GalleryImage["orientation"])}
                className="w-full font-body text-text-secondary border-t border-border"
                style={{
                  fontSize: "11px",
                  padding: "5px 8px",
                  background: "var(--color-bg-card, #1a1210)",
                  appearance: "auto",
                }}
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <label
        className={`flex flex-col items-center justify-center border border-dashed cursor-pointer transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
        }`}
        style={{ padding: "28px" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          disabled={uploading}
        />
        <p className="font-body text-sm text-accent" style={{ letterSpacing: "1px" }}>
          {uploading ? "Uploading..." : "Click to upload new gallery images"}
        </p>
        <p className="font-body text-text-faint mt-1" style={{ fontSize: "10px" }}>
          JPG, PNG, WebP — max 10MB each
        </p>
      </label>
    </div>
  );
}
