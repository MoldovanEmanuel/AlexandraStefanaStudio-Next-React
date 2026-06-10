import type { Metadata } from "next";
import Link from "next/link";
import { NewsForm } from "@/components/admin/NewsForm";

export const metadata: Metadata = { title: "Add News | Admin" };

export default function NewNewsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">ADD NEWS</h1>
        <Link
          href="/admin/news"
          className="font-body text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
        >
          ← BACK
        </Link>
      </div>
      <NewsForm />
    </div>
  );
}
