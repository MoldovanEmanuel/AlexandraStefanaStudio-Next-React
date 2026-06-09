"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Obligatoriu").max(300),
  date: z.string().min(1, "Obligatoriu"),
  url: z.string().url("URL invalid").optional().or(z.literal("")),
  active: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface NewsFormProps { item?: NewsItem }

export function NewsForm({ item }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!item;
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? "",
      date: item?.date ? item.date.substring(0, 10) : "",
      url: item?.url ?? "",
      active: item?.active ?? true,
      showOnHome: item?.showOnHome ?? false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError("");
    const payload = { ...data, image, url: data.url || null };

    try {
      const res = await fetch(isEdit ? `/api/news/${item.id}` : "/api/news", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/news");
      } else {
        const json = await res.json();
        setError(json.error ?? "Eroare");
      }
    } catch {
      setError("Eroare de conexiune");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <label className="admin-label">Titlu *</label>
        <input {...register("title")} className={cn("admin-input", errors.title && "border-red-800")} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="admin-label">Data *</label>
        <input type="date" {...register("date")} className={cn("admin-input", errors.date && "border-red-800")} />
      </div>

      <div>
        <label className="admin-label">URL articol (opțional)</label>
        <input type="url" {...register("url")} className={cn("admin-input", errors.url && "border-red-800")} placeholder="https://..." />
        {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
      </div>

      <div>
        <label className="admin-label">Imagine</label>
        <ImageUploader folder="news" value={image} onChange={setImage} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("active")} className="accent-accent" />
          <span className="font-body text-sm text-text-muted">Activ</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("showOnHome")} className="accent-accent" />
          <span className="font-body text-sm text-text-muted">Pe pagina principală</span>
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-4">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Se salvează..." : isEdit ? "Salvează" : "Adaugă"}
        </button>
        <button type="button" onClick={() => router.push("/admin/news")} className="btn-secondary">Anulează</button>
      </div>
    </form>
  );
}
