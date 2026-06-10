"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  current: string;
}

export function CategoryFilter({ categories, current }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.delete("page");
    router.push(`/portfolio?${params.toString()}`);
  };

  const allCategories = ["all", ...categories, "3d-animations"];

  return (
    <div className="category-filters flex flex-wrap" style={{ gap: "8px", marginBottom: "40px" }}>
      {allCategories.map((cat) => {
        const isActive = cat === "all" ? current === "all" : current === cat;
        const label =
          cat === "all" ? "ALL" :
          cat === "3d-animations" ? "3D ANIMATIONS" :
          cat.toUpperCase();

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            style={{ padding: "7px 18px" }}
            className={cn(
              "filter-btn font-body text-xs uppercase tracking-widest border transition-all duration-300",
              isActive
                ? "filter-btn--active border-accent bg-accent/10 text-accent"
                : "border-border text-text-muted hover:border-accent/40 hover:text-text-secondary",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
