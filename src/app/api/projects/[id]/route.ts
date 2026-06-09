import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

interface Params {
  params: Promise<{ id: string }>;
}

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: serialize(project) });
}

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  year: z.string().nullable().optional(),
  surface: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  paragraphs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  gallery: z.array(z.object({ src: z.string(), orientation: z.enum(["landscape", "portrait"]) })).optional(),
  layout: z.string().nullable().optional(),
  active: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data,
    });

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ data: serialize(project) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validare eșuată", details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id: Number(id) } });
    await cacheDel(CACHE_KEYS.projects);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

function serialize(p: {
  id: number; name: string; slug: string; category: string;
  year: string | null; surface: string | null; location: string | null;
  image: string | null; paragraphs: unknown; features: unknown; gallery: unknown;
  layout: string | null; sortOrder: number; active: boolean; showOnHome: boolean;
  createdAt: Date; updatedAt: Date;
}) {
  return {
    ...p,
    paragraphs: p.paragraphs as string[],
    features: p.features as string[],
    gallery: p.gallery as unknown[],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
