import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Project } from "@/types";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Edit Project | Admin" };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const raw = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!raw) notFound();

  const project: Project = {
    ...raw,
    paragraphs: raw.paragraphs as string[],
    features: raw.features as string[],
    gallery: raw.gallery as never[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">
          EDIT: {project.name.toUpperCase()}
        </h1>
        <a
          href="/admin/projects"
          className="font-body text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
        >
          ← BACK
        </a>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
