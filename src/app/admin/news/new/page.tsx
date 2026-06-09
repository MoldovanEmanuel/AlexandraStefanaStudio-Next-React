import type { Metadata } from "next";
import { NewsForm } from "@/components/admin/NewsForm";

export const metadata: Metadata = { title: "Noutate nouă" };

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl tracking-widest text-text-primary mb-8">Noutate nouă</h1>
      <NewsForm />
    </div>
  );
}
