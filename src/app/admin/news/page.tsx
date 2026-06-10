"use client";

import Image from "next/image";
import Link from "next/link";
import { useNews, useDeleteNews, useReorderNews } from "@/hooks/use-news";
import { DragDropList } from "@/components/admin/DragDropList";

function adminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminNewsPage() {
  const { data, isLoading } = useNews({ perPage: 100, admin: true });
  const deleteNews = useDeleteNews();
  const reorderNews = useReorderNews();

  const items = data?.data ?? [];

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Delete news item "${title}"?`)) return;
    deleteNews.mutate(id);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">NEWS</h1>
        <Link
          href="/admin/news/new"
          className="font-body text-xs uppercase tracking-widest px-4 py-2 bg-accent text-bg hover:opacity-90 transition-opacity"
        >
          + ADD NEWS
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-text-muted">No news items yet.</p>
      ) : (
        <>
          {/* Table header */}
          <div className="flex items-center gap-3 border-b border-border pb-2 mb-1">
            <div className="w-9 shrink-0" />
            <div
              className="flex-1 grid font-body text-xs uppercase tracking-widest text-text-muted"
              style={{ gridTemplateColumns: "28px 52px 1fr 100px 130px 140px" }}
            >
              <span>#</span>
              <span>IMAGE</span>
              <span className="pl-2">TITLE</span>
              <span>DATE</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>
          </div>

          <DragDropList
            items={items}
            onReorder={(ids) => reorderNews.mutate(ids)}
            renderItem={(item) => (
              <div
                className="grid items-center border-b border-border py-2"
                style={{ gridTemplateColumns: "28px 52px 1fr 100px 130px 140px" }}
              >
                <span className="font-body text-xs text-text-faint">{item.sortOrder}</span>

                <div className="w-10 h-10 overflow-hidden bg-bg-card shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-body text-text-faint" style={{ fontSize: "10px" }}>—</span>
                    </div>
                  )}
                </div>

                <span className="font-body text-sm text-text-primary truncate pl-2">{item.title}</span>

                <span className="font-body text-xs text-text-faint">{adminDate(item.date)}</span>

                <div className="flex items-center gap-1.5">
                  <span
                    className="font-body"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1px",
                      color: item.active ? "#27ae60" : "#c0392b",
                    }}
                  >
                    {item.active ? "ACTIVE" : "HIDDEN"}
                  </span>
                  {item.showOnHome && (
                    <span
                      className="font-body"
                      style={{
                        fontSize: "9px",
                        letterSpacing: "1px",
                        padding: "2px 6px",
                        background: "rgba(201,169,110,0.12)",
                        color: "var(--color-accent, #c9a96e)",
                        border: "1px solid rgba(201,169,110,0.35)",
                      }}
                    >
                      HOME
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/news/${item.id}/edit`}
                    className="font-body uppercase tracking-widest border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    style={{ fontSize: "11px", padding: "3px 10px" }}
                  >
                    EDIT
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="font-body uppercase tracking-widest border border-red-700 text-red-600 hover:bg-red-700 hover:text-white transition-colors"
                    style={{ fontSize: "11px", padding: "3px 10px" }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          />

          <p className="font-body text-sm mt-4 text-text-muted" style={{ opacity: 0.75 }}>
            Drag rows to reorder news on the site.
          </p>
        </>
      )}
    </div>
  );
}
