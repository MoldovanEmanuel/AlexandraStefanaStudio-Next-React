"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import type { GalleryImage } from "@/types";

interface GalleryUploaderProps {
  projectId: number;
  gallery: GalleryImage[];
  onChange: (gallery: GalleryImage[]) => void;
}

export function GalleryUploader({ projectId, gallery, onChange }: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const fileArray = Array.from(files);

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
            onChange([...gallery, { src: data.src, orientation: "landscape" }]);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      setUploading(false);
    },
    [projectId, gallery, onChange],
  );

  const handleRemove = async (src: string) => {
    const res = await fetch(`/api/projects/${projectId}/gallery`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });

    if (res.ok) {
      onChange(gallery.filter((img) => img.src !== src));
    }
  };

  const toggleOrientation = async (src: string, current: GalleryImage["orientation"]) => {
    const orientation = current === "landscape" ? "portrait" : "landscape";
    const res = await fetch(`/api/projects/${projectId}/gallery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src, orientation }),
    });

    if (res.ok) {
      onChange(gallery.map((img) => img.src === src ? { ...img, orientation } : img));
    }
  };

  return (
    <div>
      {/* Drop zone */}
      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
        }`}
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
        <p className="font-body text-sm text-text-muted">
          {uploading ? "Se încarcă..." : "Trage sau apasă pentru a adăuga imagini"}
        </p>
      </label>

      {/* Gallery grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4 lg:grid-cols-5">
          {gallery.map((img, i) => (
            <div key={i} className="relative group border border-border">
              <div className="relative aspect-square">
                <Image src={img.src} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="150px" />
              </div>
              <div className="absolute inset-0 bg-bg/0 group-hover:bg-bg/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => toggleOrientation(img.src, img.orientation)}
                  className="p-1 bg-bg text-accent text-xs"
                  title={`Orientare: ${img.orientation}`}
                >
                  {img.orientation === "landscape" ? "↔" : "↕"}
                </button>
                <button
                  onClick={() => handleRemove(img.src)}
                  className="p-1 bg-bg text-red-600 text-xs"
                  title="Șterge"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
