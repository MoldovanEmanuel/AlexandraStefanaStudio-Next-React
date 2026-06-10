"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageUploaderProps {
  folder: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUploader({ folder, value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { data } = await res.json();
        onChange(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-start gap-4">
        {/* Current image with × button */}
        <div className="relative border border-border shrink-0" style={{ width: "160px" }}>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors"
            style={{ width: "22px", height: "22px", fontSize: "13px", lineHeight: 1 }}
            title="Remove"
          >
            ×
          </button>
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            <Image src={value} alt="Thumbnail" fill className="object-cover" sizes="160px" />
          </div>
        </div>

        {/* Replace button */}
        <label className="flex items-center justify-center border border-dashed border-border px-5 py-3 cursor-pointer hover:border-accent/40 transition-colors self-start">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
          <span className="font-body text-xs text-text-muted">
            {uploading ? "Uploading..." : "Replace image"}
          </span>
        </label>
      </div>
    );
  }

  return (
    <label className="flex items-center justify-center border border-dashed border-border px-6 py-4 cursor-pointer hover:border-accent/40 transition-colors">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
      />
      <span className="font-body text-xs text-text-muted">
        {uploading ? "Uploading..." : "Upload image"}
      </span>
    </label>
  );
}
