import Image from "next/image";
import type { NewsItem } from "@/types";

interface NewsPreviewProps {
  items: NewsItem[];
}

export function NewsPreview({ items }: NewsPreviewProps) {
  if (items.length === 0) return null;

  return (
    <section style={{ padding: "90px 0", background: "var(--bg)" }}>
      <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
        <h2
          className="font-display"
          style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}
        >
          <em>NEWS</em>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {items.map((item) => {
            const day = new Date(item.date).getUTCDate().toString().padStart(2, "0");
            const monthYear = new Date(item.date)
              .toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
              .toUpperCase();

            return (
              <a
                key={item.id}
                href={item.url ?? "#"}
                target={item.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="blog-post group"
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="blog-image"
                  style={{ overflow: "hidden", height: "340px", background: "#1b120e", position: "relative" }}
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ display: "block" }}
                      loading="lazy"
                    />
                  )}
                </div>
                <div
                  className="blog-info"
                  style={{ padding: "32px 40px 40px 0", display: "flex", flexDirection: "column" }}
                >
                  <div className="blog-date" style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "22px" }}>
                    <span
                      className="blog-day font-display"
                      style={{ fontSize: "56px", fontWeight: 800, color: "var(--text-muted)", lineHeight: 1 }}
                    >
                      {day}
                    </span>
                    <span
                      className="blog-month font-body"
                      style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "3px", color: "var(--text-muted)" }}
                    >
                      {monthYear}
                    </span>
                  </div>
                  <h3
                    className="blog-title font-body"
                    style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "3px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "28px", lineHeight: 1.4 }}
                  >
                    {item.title}
                  </h3>
                  {item.url && (
                    <div
                      className="blog-read-more font-body"
                      style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "10px", fontWeight: 700, letterSpacing: "3px", color: "var(--text-muted)", textTransform: "uppercase" }}
                    >
                      READ MORE
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
