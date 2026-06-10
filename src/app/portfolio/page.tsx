import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { Pagination } from "@/components/ui/Pagination";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse the interior design portfolio of Alexandra Stefana Studio — residential and commercial projects crafted in Cluj-Napoca, Romania.",
};

const PER_PAGE = 6;
const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const page = Math.max(1, Number(params.page ?? 1));

  const is3dAnimations = category === "3d-animations";

  const where = {
    active: true,
    ...(category !== "all" && !is3dAnimations ? { category } : {}),
  };

  const [projects, total, allProjects, totalProjects] = await Promise.all([
    is3dAnimations
      ? Promise.resolve([])
      : prisma.project.findMany({
          where,
          orderBy: { sortOrder: "asc" },
          skip: (page - 1) * PER_PAGE,
          take: PER_PAGE,
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            image: true,
            year: true,
            location: true,
          },
        }),
    is3dAnimations
      ? Promise.resolve(0)
      : prisma.project.count({ where }),
    prisma.project.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.project.count({ where: { active: true } }),
  ]);

  const categories = [...new Set(allProjects.map((p) => p.category))].sort();
  const totalPages = Math.ceil(total / PER_PAGE);

  const totalAllPages = Math.ceil(totalProjects / PER_PAGE);
  const showRendersCard = category === "all" && page === totalAllPages;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Portfolio",
        item: `${SITE_URL}/portfolio`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Header />
      <main>
        <section className="portfolio-page" style={{ padding: "110px 0 100px" }}>
          <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
            <h2
              className="font-display"
              style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}
            >
              <em>PORTFOLIO</em>
            </h2>
            <p className="breadcrumb detail-breadcrumb font-body" style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(166,133,105,0.5)", textTransform: "uppercase", marginBottom: "32px" }}>
              <Link href="/" style={{ color: "rgba(166,133,105,0.5)" }} className="hover:text-text-secondary transition-colors">Home</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span>Portfolio</span>
            </p>

            <CategoryFilter categories={categories} current={category} />

            <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }}>
              {!is3dAnimations && projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.slug}`}
                  className="project-card group block"
                  style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
                >
                  <div style={{ position: "relative", height: "400px", overflow: "hidden", background: "#1b120e" }}>
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                        loading="lazy"
                        style={{ display: "block" }}
                      />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,5,0,0.82) 0%, transparent 55%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "28px 26px" }}>
                      <h3 className="font-body" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "1px", color: "#e8d5c0", textTransform: "uppercase" }}>
                        {project.name.toUpperCase()}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}

              {(is3dAnimations || showRendersCard) && (
                <Link href="/renders" className="project-card group block" style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ position: "relative", height: "400px", overflow: "hidden", background: "#1b120e" }}>
                    <Image
                      src="/assets/images/about.jpg"
                      alt="3D Animations"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                      loading="lazy"
                      style={{ display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,5,0,0.82) 0%, transparent 55%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "28px 26px" }}>
                      <h3 className="font-body" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "1px", color: "#e8d5c0", textTransform: "uppercase" }}>
                        3D ANIMATIONS
                      </h3>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {!is3dAnimations && projects.length === 0 && !showRendersCard && (
              <p className="py-24 text-center font-body text-sm text-text-muted">
                No projects in this category.
              </p>
            )}

            {!is3dAnimations && (
              <Pagination currentPage={page} totalPages={totalPages} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
