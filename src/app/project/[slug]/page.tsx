import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CACHE_KEYS } from "@/lib/redis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Project } from "@/types";

const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string): Promise<Project | null> {
  const cacheKey = CACHE_KEYS.projectSlug(slug);
  const cached = await cacheGet<Project>(cacheKey);
  if (cached) return cached;

  const raw = await prisma.project.findUnique({
    where: { slug, active: true },
  });

  if (!raw) return null;

  const project: Project = {
    ...raw,
    paragraphs: raw.paragraphs as string[],
    features: raw.features as string[],
    gallery: raw.gallery as never[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  await cacheSet(cacheKey, project, 600);
  return project;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: `Proiect de design interior: ${project.name}. ${project.category}${project.location ? ` — ${project.location}` : ""}.`,
    openGraph: {
      title: project.name,
      images: project.image ? [{ url: project.image }] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/project/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Portofoliu", item: `${SITE_URL}/portfolio` },
      { "@type": "ListItem", position: 3, name: project.name, item: `${SITE_URL}/project/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Header />
      <main className="pt-[var(--nav-height)]">
        {/* Hero */}
        {project.image && (
          <div className="relative h-[60vh] lg:h-[75vh] overflow-hidden">
            <Image
              src={project.image}
              alt={project.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-hero-overlay" />
            <div className="absolute bottom-10 left-0 right-0 px-6 lg:px-12">
              <div className="mx-auto max-w-8xl">
                <nav className="flex items-center gap-2 font-body text-xs uppercase tracking-widest text-text-muted mb-4">
                  <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
                  <span>/</span>
                  <Link href="/portfolio" className="hover:text-accent transition-colors">Portofoliu</Link>
                  <span>/</span>
                  <span className="text-text-secondary">{project.name}</span>
                </nav>
                <p className="font-body text-xs uppercase tracking-widest text-accent mb-3">
                  {project.category}
                </p>
                <h1 className="font-display text-display-lg text-text-primary">
                  {project.name}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-8xl px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-20">
            {/* Description */}
            <div className="lg:col-span-2">
              {!project.image && (
                <div className="mb-8">
                  <p className="font-body text-xs uppercase tracking-widest text-accent mb-2">{project.category}</p>
                  <h1 className="font-display text-display-md text-text-primary">{project.name}</h1>
                </div>
              )}

              {project.paragraphs.length > 0 && (
                <div className="space-y-4 font-body text-sm text-text-muted leading-relaxed">
                  {project.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {project.features.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl tracking-widest text-text-primary mb-6">
                    Caracteristici
                  </h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {project.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 font-body text-sm text-text-muted">
                        <span className="mt-1.5 h-1 w-4 shrink-0 bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Metadata sidebar */}
            <aside className="border-l border-border pl-8">
              <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-6">
                Detalii proiect
              </h2>
              <dl className="space-y-4">
                {project.category && (
                  <div>
                    <dt className="font-body text-xs text-text-faint mb-1">Categorie</dt>
                    <dd className="font-body text-sm text-text-primary">{project.category}</dd>
                  </div>
                )}
                {project.year && (
                  <div>
                    <dt className="font-body text-xs text-text-faint mb-1">An</dt>
                    <dd className="font-body text-sm text-text-primary">{project.year}</dd>
                  </div>
                )}
                {project.surface && (
                  <div>
                    <dt className="font-body text-xs text-text-faint mb-1">Suprafață</dt>
                    <dd className="font-body text-sm text-text-primary">{project.surface}</dd>
                  </div>
                )}
                {project.location && (
                  <div>
                    <dt className="font-body text-xs text-text-faint mb-1">Locație</dt>
                    <dd className="font-body text-sm text-text-primary">{project.location}</dd>
                  </div>
                )}
              </dl>
            </aside>
          </div>
        </div>

        {/* Gallery */}
        {project.gallery.length > 0 && (
          <section className="pb-24">
            <div className="mx-auto max-w-8xl px-6 lg:px-12">
              <h2 className="font-display text-2xl tracking-widest text-text-primary mb-10 gold-line">
                Galerie
              </h2>
              <ProjectGallery images={project.gallery} />
            </div>
          </section>
        )}

        {/* Back */}
        <div className="border-t border-border py-10">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <Link href="/portfolio" className="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Înapoi la Portofoliu
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
