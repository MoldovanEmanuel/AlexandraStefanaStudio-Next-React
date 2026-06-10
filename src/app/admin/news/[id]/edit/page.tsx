import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewsForm } from "@/components/admin/NewsForm";
import type { NewsItem } from "@/types";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Edit News | Admin" };

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const raw = await prisma.news.findUnique({ where: { id: Number(id) } });
  if (!raw) notFound();

  const item: NewsItem = {
    ...raw,
    date: raw.date.toISOString(),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">EDIT NEWS</h1>
        <Link
          href="/admin/news"
          className="font-body text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
        >
          ← BACK
        </Link>
      </div>
      <NewsForm item={item} />
    </div>
  );
}
