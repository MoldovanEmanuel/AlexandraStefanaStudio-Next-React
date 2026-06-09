import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Project } from "@/types";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Editează proiect" };

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
      <h1 className="font-display text-2xl tracking-widest text-text-primary mb-8">
        Editează: {project.name}
      </h1>
      <ProjectForm project={project} />
    </div>
  );
}
