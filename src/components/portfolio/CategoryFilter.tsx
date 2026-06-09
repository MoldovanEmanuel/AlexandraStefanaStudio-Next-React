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

  const allCategories = ["all", ...categories];

  return (
    <div className="flex flex-wrap gap-3">
      {allCategories.map((cat) => {
        const isActive =
          cat === "all" ? current === "all" : current === cat;
        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={cn(
              "font-body text-xs uppercase tracking-widest px-5 py-2.5 border transition-all duration-300",
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-text-muted hover:border-accent/40 hover:text-text-secondary",
            )}
          >
            {cat === "all" ? "Toate" : cat}
          </button>
        );
      })}
    </div>
  );
}
