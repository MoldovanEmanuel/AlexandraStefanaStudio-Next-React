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
  title: "Portofoliu",
  description:
    "Explorați colecția noastră de proiecte de design interior rezidențial și comercial din Cluj-Napoca.",
};

const PER_PAGE = 9;
const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const page = Math.max(1, Number(params.page ?? 1));

  const where = {
    active: true,
    ...(category !== "all" ? { category } : {}),
  };

  const [projects, total, allProjects] = await Promise.all([
    prisma.project.findMany({
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
    prisma.project.count({ where }),
    prisma.project.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const categories = [...new Set(allProjects.map((p) => p.category))].sort();
  const totalPages = Math.ceil(total / PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Portofoliu",
        item: `${SITE_URL}/portfolio`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Header />
      <main className="pt-[var(--nav-height)]">
        {/* Page header */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <p className="section-subtitle mb-3">Lucrările noastre</p>
            <h1 className="font-display text-display-lg text-text-primary mb-8">
              Portofoliu
            </h1>
            <CategoryFilter categories={categories} current={category} />
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            {projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/project/${project.slug}`}
                      className="project-card group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-bg-card">
                        {project.image && (
                          <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-card-overlay opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-500 group-hover:translate-y-0">
                          <p className="font-body text-xs uppercase tracking-widest text-accent mb-1">
                            {project.category}
                            {project.year && ` · ${project.year}`}
                          </p>
                          <h2 className="font-display text-xl tracking-widest text-text-primary">
                            {project.name}
                          </h2>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination currentPage={page} totalPages={totalPages} />
              </>
            ) : (
              <p className="py-24 text-center font-body text-sm text-text-muted">
                Niciun proiect în această categorie.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
