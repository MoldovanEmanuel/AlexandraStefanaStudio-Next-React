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
  name: z.string().min(1, "Obligatoriu"),
  category: z.string().min(1, "Obligatoriu"),
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

const CATEGORIES = ["Rezidențial", "Comercial", "Hospitality", "Birouri"];

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
      category: project?.category ?? "",
      year: project?.year ?? "",
      surface: project?.surface ?? "",
      location: project?.location ?? "",
      paragraphs: (project?.paragraphs ?? []).map((v) => ({ value: v })),
      features: (project?.features ?? []).map((v) => ({ value: v })),
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
        setError(json.error ?? "Eroare la salvare");
      }
    } catch {
      setError("Eroare de conexiune");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <section>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Informații de bază</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Nume proiect *</label>
            <input {...register("name")} className={cn("admin-input", errors.name && "border-red-800")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="admin-label">Categorie *</label>
            <select {...register("category")} className={cn("admin-input", errors.category && "border-red-800")}>
              <option value="">Selectează...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">An</label>
            <input {...register("year")} className="admin-input" placeholder="2024" />
          </div>
          <div>
            <label className="admin-label">Suprafață</label>
            <input {...register("surface")} className="admin-input" placeholder="120 m²" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Locație</label>
            <input {...register("location")} className="admin-input" placeholder="Cluj-Napoca" />
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Vizibilitate</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("active")} className="accent-accent" />
            <span className="font-body text-sm text-text-muted">Activ</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("showOnHome")} className="accent-accent" />
            <span className="font-body text-sm text-text-muted">Afișat pe pagina principală</span>
          </label>
        </div>
      </section>

      {/* Thumbnail */}
      <section>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Imagine principală</h2>
        <ImageUploader
          folder="portfolio/thumbnails"
          value={thumbnail}
          onChange={setThumbnail}
        />
      </section>

      {/* Paragraphs */}
      <section>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Descriere</h2>
        {paragraphsArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <textarea
              {...register(`paragraphs.${i}.value`)}
              rows={3}
              className="admin-input flex-1 resize-none"
            />
            <button type="button" onClick={() => paragraphsArray.remove(i)} className="self-start text-text-faint hover:text-red-600 p-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => paragraphsArray.append({ value: "" })} className="btn-ghost text-xs">
          + Adaugă paragraf
        </button>
      </section>

      {/* Features */}
      <section>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Caracteristici</h2>
        {featuresArray.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input {...register(`features.${i}.value`)} className="admin-input flex-1" />
            <button type="button" onClick={() => featuresArray.remove(i)} className="text-text-faint hover:text-red-600 p-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => featuresArray.append({ value: "" })} className="btn-ghost text-xs">
          + Adaugă caracteristică
        </button>
      </section>

      {/* Gallery — only for existing projects */}
      {isEdit && (
        <section>
          <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Galerie</h2>
          <GalleryUploader projectId={project.id} gallery={gallery} onChange={setGallery} />
        </section>
      )}

      {error && <p className="font-body text-xs text-red-600">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Se salvează..." : isEdit ? "Salvează modificările" : "Creează proiectul"}
        </button>
        <button type="button" onClick={() => router.push("/admin/projects")} className="btn-secondary">
          Anulează
        </button>
      </div>
    </form>
  );
}
