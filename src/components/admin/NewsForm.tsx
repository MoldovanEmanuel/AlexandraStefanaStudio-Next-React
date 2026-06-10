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
  title: z.string().min(1, "Required").max(300),
  date: z.string().min(1, "Required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface NewsFormProps { item?: NewsItem }

export function NewsForm({ item }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!item;
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [active, setActive] = useState<boolean>(item?.active ?? true);
  const [showOnHome, setShowOnHome] = useState<boolean>(item?.showOnHome ?? false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? "",
      date: item?.date ? item.date.substring(0, 10) : "",
      url: item?.url ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError("");
    const payload = { ...data, image, url: data.url || null, active, showOnHome };

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
        setError(json.error ?? "Error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <label className="admin-label">TITLE *</label>
        <input {...register("title")} className={cn("admin-input", errors.title && "border-red-800")} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="admin-label">DATE *</label>
          <input type="date" {...register("date")} className={cn("admin-input", errors.date && "border-red-800")} />
        </div>
        <div className="flex-1">
          <label className="admin-label">STATUS</label>
          <select
            value={active ? "true" : "false"}
            onChange={(e) => setActive(e.target.value === "true")}
            className="admin-input"
          >
            <option value="true">Visible on site</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>

      <div>
        <label className="admin-label">SHOW ON HOME PAGE</label>
        <select
          value={showOnHome ? "true" : "false"}
          onChange={(e) => setShowOnHome(e.target.value === "true")}
          className="admin-input"
        >
          <option value="true">Yes — feature in homepage news section</option>
          <option value="false">No — don&apos;t show on homepage</option>
        </select>
        <p className="mt-1 font-body text-text-muted" style={{ fontSize: "11px" }}>
          Controls only the news preview on the homepage, not the full /news page.
        </p>
      </div>

      <div>
        <label className="admin-label">EXTERNAL URL (READ MORE link)</label>
        <input
          type="url"
          {...register("url")}
          className={cn("admin-input", errors.url && "border-red-800")}
          placeholder="https://..."
        />
        {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
        <p className="mt-1 font-body text-text-muted" style={{ fontSize: "11px" }}>
          Leave blank if there is no external article to link to.
        </p>
      </div>

      <div>
        <label className="admin-label">IMAGE {isEdit && "(leave blank to keep current)"}</label>
        <ImageUploader folder="news" value={image} onChange={setImage} />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="font-body uppercase tracking-widest bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ fontSize: "12px", padding: "10px 24px" }}
        >
          {saving ? "Saving..." : isEdit ? "SAVE CHANGES" : "ADD"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="font-body uppercase tracking-widest border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
          style={{ fontSize: "12px", padding: "10px 24px" }}
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
