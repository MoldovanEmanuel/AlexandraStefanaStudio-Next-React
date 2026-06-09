import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types";

interface PortfolioPreviewProps {
  projects: Project[];
}

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  if (projects.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-bg-lighter">
      <div className="mx-auto max-w-8xl px-6 lg:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="section-subtitle mb-3">Lucrările noastre</p>
            <h2 className="section-title">Portofoliu</h2>
          </div>
          <Link href="/portfolio" className="btn-ghost">
            Vezi tot portofoliul
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.slug}`}
              className="project-card group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-bg-card" />
                )}
                <div className="absolute inset-0 bg-card-overlay opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-500 group-hover:translate-y-0">
                  <p className="font-body text-xs uppercase tracking-widest text-accent mb-1">
                    {project.category}
                  </p>
                  <h3 className="font-display text-xl tracking-widest text-text-primary">
                    {project.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
