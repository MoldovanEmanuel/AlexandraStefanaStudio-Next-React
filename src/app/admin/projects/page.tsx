"use client";

import Link from "next/link";
import { useState } from "react";
import { useProjects, useDeleteProject, useReorderProjects } from "@/hooks/use-projects";
import { DragDropList } from "@/components/admin/DragDropList";
import type { Project } from "@/types";

export default function AdminProjectsPage() {
  const { data, isLoading } = useProjects({ perPage: 100 });
  const deleteProject = useDeleteProject();
  const reorderProjects = useReorderProjects();
  const [items, setItems] = useState<Project[]>([]);

  const projects = data?.data ?? items;

  const handleReorder = (ids: number[]) => {
    const reordered = ids.map((id) => projects.find((p) => p.id === id)!);
    setItems(reordered);
    reorderProjects.mutate(ids);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi proiectul "${name}"?`)) return;
    deleteProject.mutate(id);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">Proiecte</h1>
        <Link href="/admin/projects/new" className="btn-secondary">
          + Proiect nou
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 skeleton" />
          ))}
        </div>
      ) : (data?.data?.length ?? 0) === 0 ? (
        <p className="font-body text-sm text-text-muted py-12 text-center">
          Niciun proiect. <Link href="/admin/projects/new" className="text-accent">Adaugă primul proiect</Link>
        </p>
      ) : (
        <DragDropList
          items={data?.data ?? []}
          onReorder={handleReorder}
          renderItem={(project) => (
            <div className="flex items-center justify-between border border-border px-4 py-3 hover:bg-bg-card transition-colors">
              <div className="flex items-center gap-4">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${project.active ? "bg-green-600" : "bg-text-faint"}`}
                />
                <span className="font-body text-sm text-text-primary">{project.name}</span>
                <span className="font-body text-xs text-text-faint">{project.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/project/${project.slug}`}
                  target="_blank"
                  className="font-body text-xs text-text-faint hover:text-accent transition-colors"
                >
                  ↗
                </Link>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="font-body text-xs text-text-secondary hover:text-accent transition-colors"
                >
                  Editează
                </Link>
                <button
                  onClick={() => handleDelete(project.id, project.name)}
                  className="font-body text-xs text-text-faint hover:text-red-600 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
