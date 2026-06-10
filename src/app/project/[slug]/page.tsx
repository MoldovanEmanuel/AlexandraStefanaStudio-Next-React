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
    description: `${project.name} — interior design project by Alexandra Stefana Studio, Cluj-Napoca.${project.location ? ` ${project.location}.` : ""}`,
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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: `${SITE_URL}/portfolio` },
      { "@type": "ListItem", position: 3, name: project.name, item: `${SITE_URL}/project/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Header />
      <main>
        {/* Header: title + breadcrumb above hero image */}
        <div style={{ padding: "110px 0 36px" }}>
          <div className="mx-auto max-w-[1100px] px-10">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700, letterSpacing: "6px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}
            >
              {project.name.toUpperCase()}
            </h2>
            <p
              className="font-body"
              style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(166,133,105,0.5)", textTransform: "uppercase", marginBottom: "24px" }}
            >
              <Link href="/" style={{ color: "rgba(166,133,105,0.5)" }} className="hover:text-text-secondary transition-colors">Home</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <Link href="/portfolio" style={{ color: "rgba(166,133,105,0.5)" }} className="hover:text-text-secondary transition-colors">Portfolio</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span>{project.name}</span>
            </p>
            <Link
              href="/portfolio"
              className="font-body hover:text-text-secondary transition-colors"
              style={{ display: "inline-block", fontSize: "10px", letterSpacing: "2px", fontWeight: 600, textTransform: "uppercase", color: "rgba(166,133,105,0.5)" }}
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="mx-auto max-w-[1100px] px-10">
          {project.image && (
            <div style={{ position: "relative", width: "100%", height: "620px", overflow: "hidden", background: "#1b120e" }}>
              <Image
                src={project.image}
                alt={project.name}
                fill
                priority
                className="object-cover"
                sizes="1100px"
              />
            </div>
          )}

          {/* Details bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#221813" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "28px 36px", borderRight: "1px solid rgba(166,133,105,0.1)" }}>
              <span className="font-body" style={{ fontSize: "12px", fontWeight: 400, color: "rgba(166,133,105,0.55)" }}>Project Name</span>
              <span className="font-body" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.5px" }}>{project.name}</span>
            </div>
            {project.surface ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "28px 36px", borderRight: "1px solid rgba(166,133,105,0.1)" }}>
                <span className="font-body" style={{ fontSize: "12px", fontWeight: 400, color: "rgba(166,133,105,0.55)" }}>Surface</span>
                <span className="font-body" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.5px" }}>{project.surface}</span>
              </div>
            ) : <div />}
            {project.location ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "28px 36px", borderRight: "1px solid rgba(166,133,105,0.1)" }}>
                <span className="font-body" style={{ fontSize: "12px", fontWeight: 400, color: "rgba(166,133,105,0.55)" }}>Location</span>
                <span className="font-body" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.5px" }}>{project.location}</span>
              </div>
            ) : <div />}
            {project.year ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "28px 36px" }}>
                <span className="font-body" style={{ fontSize: "12px", fontWeight: 400, color: "rgba(166,133,105,0.55)" }}>Project Year</span>
                <span className="font-body" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.5px" }}>{project.year}</span>
              </div>
            ) : <div />}
          </div>
        </div>

        {/* Content body */}
        <section style={{ padding: "40px 0 90px" }}>
          <div className="mx-auto max-w-[1100px] px-10" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "50px" }}>
            {/* Description + features */}
            {(project.paragraphs.length > 0 || project.features.length > 0) && (
              <div>
                {project.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="font-body"
                    style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 300, lineHeight: 1.9, marginBottom: "20px" }}
                  >
                    {p}
                  </p>
                ))}
                {project.features.length > 0 && (
                  <ul style={{ listStyle: "none", marginTop: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {project.features.map((f, i) => (
                      <li
                        key={i}
                        className="font-body"
                        style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 300 }}
                      >
                        <span style={{ color: "var(--text-muted)", fontSize: "16px", flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Gallery */}
            {project.gallery.length > 0 && (
              <ProjectGallery images={project.gallery} layout={project.layout} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
