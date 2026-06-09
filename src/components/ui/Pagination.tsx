"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1),
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-12"
    >
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 text-text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {pages.map((page, i) => {
        const prev = pages[i - 1];
        const showEllipsisBefore = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsisBefore && (
              <span className="font-body text-sm text-text-faint">…</span>
            )}
            <button
              onClick={() => navigate(page)}
              className={cn(
                "h-9 w-9 font-body text-sm transition-all duration-200",
                page === currentPage
                  ? "border border-accent text-accent"
                  : "text-text-muted hover:text-accent",
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 text-text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}
