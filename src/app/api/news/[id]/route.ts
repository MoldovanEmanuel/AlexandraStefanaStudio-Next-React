import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel } from "@/lib/redis";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = await prisma.news.findUnique({ where: { id: Number(id) } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: serialize(item) });
}

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  date: z.string().optional(),
  image: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  active: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const item = await prisma.news.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
      },
    });
    await cacheDel("as-studio:news:*");
    return NextResponse.json({ data: serialize(item) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.news.delete({ where: { id: Number(id) } });
  await cacheDel("as-studio:news:*");
  return NextResponse.json({ ok: true });
}

function serialize(n: { id: number; title: string; date: Date; image: string | null; url: string | null; active: boolean; showOnHome: boolean; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return { ...n, date: n.date.toISOString(), createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() };
}
