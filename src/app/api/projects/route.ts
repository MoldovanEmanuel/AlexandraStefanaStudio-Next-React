import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";
import { createSlug } from "@/lib/utils";

// ── GET /api/projects ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") ?? 12)));
  const adminMode = searchParams.get("admin") === "1";

  const where = {
    ...(adminMode ? {} : { active: true }),
    ...(category && category !== "all" ? { category } : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    data: projects.map(serializeProject),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}

// ── POST /api/projects (admin only — protected by middleware) ─────────────────
const createSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  year: z.string().nullable().optional(),
  surface: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  paragraphs: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  layout: z.string().optional(),
  active: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const maxOrder = await prisma.project.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    let slug = createSlug(data.name);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const project = await prisma.project.create({
      data: { ...data, slug, sortOrder },
    });

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ data: serializeProject(project) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[Projects POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function serializeProject(p: {
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
