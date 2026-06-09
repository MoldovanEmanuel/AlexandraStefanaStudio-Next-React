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

  return (
    <div className="flex items-start gap-6">
      {value && (
        <div className="relative w-32 h-24 shrink-0 border border-border overflow-hidden">
          <Image src={value} alt="Thumbnail" fill className="object-cover" sizes="128px" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 bg-bg/80 text-text-muted hover:text-red-600 p-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}
      <label className="flex items-center justify-center border border-dashed border-border px-6 py-4 cursor-pointer hover:border-accent/40 transition-colors">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <span className="font-body text-xs text-text-muted">
          {uploading ? "Se încarcă..." : value ? "Schimbă imaginea" : "Încarcă imagine"}
        </span>
      </label>
    </div>
  );
}
