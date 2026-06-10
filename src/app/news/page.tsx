import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Pagination } from "@/components/ui/Pagination";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news and updates from Alexandra Stefana Interior Design Studio in Cluj-Napoca, Romania.",
};

const PER_PAGE = 6;
const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.news.count({ where: { active: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Header />
      <main>
        <section style={{ padding: "120px 0 90px" }}>
          <div className="mx-auto max-w-[1100px] px-10">
            <h2
              className="font-display text-left"
              style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}
            >
              <em>NEWS</em>
            </h2>
            <p className="font-body" style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(166,133,105,0.5)", textTransform: "uppercase", marginBottom: "32px" }}>
              <Link href="/" style={{ color: "rgba(166,133,105,0.5)" }} className="hover:text-text-secondary transition-colors">Home</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span>News</span>
            </p>

            {news.length > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {news.map((item) => {
                    const day = item.date.getUTCDate().toString().padStart(2, "0");
                    const monthYear = item.date
                      .toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
                      .toUpperCase();
                    return (
                      <a
                        key={item.id}
                        href={item.url ?? "#"}
                        target={item.url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="blog-post group"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          minHeight: "320px",
                          borderBottom: "1px solid rgba(166,133,105,0.08)",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        {item.image ? (
                          <div className="blog-image" style={{ overflow: "hidden" }}>
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={600}
                              height={400}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              loading="lazy"
                              style={{ display: "block" }}
                            />
                          </div>
                        ) : (
                          <div style={{ background: "#1b120e" }} />
                        )}
                        <div
                          className="blog-info"
                          style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "50px 60px" }}
                        >
                          <div className="blog-date" style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "22px" }}>
                            <span
                              className="blog-day font-display"
                              style={{ fontSize: "72px", fontWeight: 800, color: "var(--text-muted)", lineHeight: 1 }}
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
                            className="blog-title font-body group-hover:opacity-70 transition-opacity"
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
                <Pagination currentPage={page} totalPages={totalPages} />
              </>
            ) : (
              <p className="font-body text-sm" style={{ opacity: 0.5, color: "var(--text-muted)" }}>
                No news yet.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
