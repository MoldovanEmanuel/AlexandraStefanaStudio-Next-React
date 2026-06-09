import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

interface NewsPreviewProps {
  items: NewsItem[];
}

export function NewsPreview({ items }: NewsPreviewProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-8xl px-6 lg:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="section-subtitle mb-3">Presă & Media</p>
            <h2 className="section-title">Noutăți</h2>
          </div>
          <Link href="/news" className="btn-ghost">
            Toate noutățile
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url ?? "#"}
              target={item.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group block border border-border transition-all duration-300 hover:border-accent/40"
            >
              {item.image && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="font-body text-xs uppercase tracking-widest text-accent mb-2">
                  {formatDate(item.date)}
                </p>
                <h3 className="font-body text-sm font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
