"use client";

import Link from "next/link";
import { useNews, useDeleteNews, useReorderNews } from "@/hooks/use-news";
import { DragDropList } from "@/components/admin/DragDropList";
import { formatDate } from "@/lib/utils";

export default function AdminNewsPage() {
  const { data, isLoading } = useNews({ perPage: 100 });
  const deleteNews = useDeleteNews();
  const reorderNews = useReorderNews();

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Ștergi noutatea "${title}"?`)) return;
    deleteNews.mutate(id);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">Noutăți</h1>
        <Link href="/admin/news/new" className="btn-secondary">+ Noutate nouă</Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div>
      ) : (data?.data?.length ?? 0) === 0 ? (
        <p className="text-center py-12 font-body text-sm text-text-muted">Nicio noutate.</p>
      ) : (
        <DragDropList
          items={data?.data ?? []}
          onReorder={(ids) => reorderNews.mutate(ids)}
          renderItem={(item) => (
            <div className="flex items-center justify-between border border-border px-4 py-3 hover:bg-bg-card transition-colors">
              <div className="flex items-center gap-4">
                <span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-green-600" : "bg-text-faint"}`} />
                <span className="font-body text-sm text-text-primary">{item.title}</span>
                <span className="font-body text-xs text-text-faint">{formatDate(item.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/news/${item.id}/edit`} className="font-body text-xs text-text-secondary hover:text-accent">Editează</Link>
                <button onClick={() => handleDelete(item.id, item.title)} className="font-body text-xs text-text-faint hover:text-red-600">Șterge</button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
