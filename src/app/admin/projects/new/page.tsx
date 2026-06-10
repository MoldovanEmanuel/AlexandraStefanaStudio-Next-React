import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "Add Project" };

export default function NewProjectPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">ADD PROJECT</h1>
        <Link href="/admin/projects" className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors">
          ← BACK
        </Link>
      </div>
      <ProjectForm />
    </div>
  );
}
