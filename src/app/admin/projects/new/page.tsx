import type { Metadata } from "next";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "Proiect nou" };

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-2xl tracking-widest text-text-primary mb-8">
        Proiect nou
      </h1>
      <ProjectForm />
    </div>
  );
}
