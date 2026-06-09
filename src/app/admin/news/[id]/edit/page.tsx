import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewsForm } from "@/components/admin/NewsForm";
import type { NewsItem } from "@/types";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Editează noutate" };

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
      <h1 className="font-display text-2xl tracking-widest text-text-primary mb-8">Editează noutate</h1>
      <NewsForm item={item} />
    </div>
  );
}
