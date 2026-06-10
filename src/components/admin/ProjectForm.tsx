"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryUploader } from "./GalleryUploader";
import { ImageUploader } from "./ImageUploader";
import { cn } from "@/lib/utils";
import type { Project, GalleryImage } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  year: z.string().optional(),
  surface: z.string().optional(),
  location: z.string().optional(),
  paragraphs: z.array(z.object({ value: z.string() })).default([]),
  features: z.array(z.object({ value: z.string() })).default([]),
  layout: z.string().optional(),
  active: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface ProjectFormProps {
  project?: Project;
}

const CATEGORIES = ["Residential", "Short Term Rental"];

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!project;

  const [thumbnail, setThumbnail] = useState<string | null>(project?.image ?? null);
  const [gallery, setGallery] = useState<GalleryImage[]>(project?.gallery ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? "",
      category: project?.category ?? "Residential",
      year: project?.year ?? String(new Date().getFullYear()),
      surface: project?.surface ?? "",
      location: project?.location ?? "",
      paragraphs: (project?.paragraphs ?? []).map((v) => ({ value: v })).length
        ? (project?.paragraphs ?? []).map((v) => ({ value: v }))
        : [{ value: "" }],
      features: (project?.features ?? []).map((v) => ({ value: v })).length
        ? (project?.features ?? []).map((v) => ({ value: v }))
        : [{ value: "" }],
      layout: project?.layout ?? "",
      active: project?.active ?? true,
      showOnHome: project?.showOnHome ?? false,
    },
  });

  const paragraphsArray = useFieldArray({ control, name: "paragraphs" });
  const featuresArray = useFieldArray({ control, name: "features" });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError("");

    const payload = {
      ...data,
      image: thumbnail,
      paragraphs: data.paragraphs.map((p) => p.value).filter(Boolean),
      features: data.features.map((f) => f.value).filter(Boolean),
      gallery,
    };

    try {
      const url = isEdit ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/projects");
      } else {
        const json = await res.json();
        setError(json.error ?? "Save failed");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">

      {/* Row 1: Name + Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">PROJECT NAME *</label>
          <input {...register("name")} className={cn("admin-input", errors.name && "border-red-800")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="admin-label">CATEGORY</label>
          <select {...register("category")} className={cn("admin-input", errors.category && "border-red-800")}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Year + Surface */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">YEAR</label>
          <input {...register("year")} className="admin-input" placeholder={String(new Date().getFullYear())} />
        </div>
        <div>
          <label className="admin-label">SURFACE</label>
          <input {...register("surface")} className="admin-input" placeholder="e.g. 70 mp" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="admin-label">LOCATION</label>
        <input {...register("location")} className="admin-input" placeholder="e.g. Cluj-Napoca" />
      </div>

      {/* Gallery Display */}
      <div>
        <label className="admin-label">GALLERY DISPLAY</label>
        <select {...register("layout")} className="admin-input">
          <option value="">Standard Grid — images open fullscreen on click</option>
          <option value="before-after">Before / After — drag to compare two versions</option>
        </select>
      </div>

      {/* Visibility */}
      <div>
        <label className="admin-label">VISIBILITY</label>
        <select
          className="admin-input"
          value={undefined}
          {...register("active", {
            setValueAs: (v) => v === "true" || v === true,
          })}
        >
          <option value="true">Visible on site</option>
          <option value="false">Hidden (draft)</option>
        </select>
      </div>

      {/* Show on Home */}
      <div>
        <label className="admin-label">SHOW ON HOME PAGE</label>
        <select
          className="admin-input"
          {...register("showOnHome", {
            setValueAs: (v) => v === "true" || v === true,
          })}
        >
          <option value="false">No — only visible on the Portfolio page</option>
          <option value="true">Yes — also show in the homepage portfolio preview</option>
        </select>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="admin-label">THUMBNAIL IMAGE{isEdit ? " — leave blank to keep current" : " *"}</label>
        <ImageUploader
          folder="portfolio/thumbnails"
          value={thumbnail}
          onChange={setThumbnail}
        />
      </div>

      {/* Description */}
      <div>
        <label className="admin-label">DESCRIPTION</label>
        {paragraphsArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <textarea
              {...register(`paragraphs.${i}.value`)}
              rows={3}
              placeholder="Write a paragraph..."
              className="admin-input flex-1 resize-none"
            />
            <button type="button" onClick={() => paragraphsArray.remove(i)} className="self-start text-text-faint hover:text-red-600 p-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => paragraphsArray.append({ value: "" })} className="btn-ghost text-xs">
          + ADD PARAGRAPH
        </button>
      </div>

      {/* Features */}
      <div>
        <label className="admin-label">FEATURES / HIGHLIGHTS</label>
        {featuresArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`features.${i}.value`)}
              className="admin-input flex-1"
              placeholder="e.g. Custom furniture design"
            />
            <button type="button" onClick={() => featuresArray.remove(i)} className="text-text-faint hover:text-red-600 p-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => featuresArray.append({ value: "" })} className="btn-ghost text-xs">
          + ADD FEATURE
        </button>
      </div>

      {/* Gallery — only for existing projects */}
      {isEdit && (
        <div>
          <label className="admin-label">GALLERY IMAGES</label>
          <GalleryUploader projectId={project.id} gallery={gallery} onChange={setGallery} />
        </div>
      )}

      {error && <p className="font-body text-xs text-red-600">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 font-body text-sm uppercase tracking-widest bg-accent text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "SAVE CHANGES" : "CREATE PROJECT"}
        </button>
        <button type="button" onClick={() => router.push("/admin/projects")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
