import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") ?? 12)));
  const adminMode = searchParams.get("admin") === "1";

  const where = adminMode ? {} : { active: true };

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: adminMode ? { sortOrder: "asc" } : { date: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.news.count({ where }),
  ]);

  return NextResponse.json({
    data: news.map(serialize),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}

const createSchema = z.object({
  title: z.string().min(1).max(300),
  date: z.string(),
  image: z.string().nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal("")),
  active: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const maxOrder = await prisma.news.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const item = await prisma.news.create({
      data: {
        ...data,
        date: new Date(data.date),
        url: data.url || null,
        sortOrder,
      },
    });

    await cacheDel("as-studio:news:*");

    return NextResponse.json({ data: serialize(item) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function serialize(n: { id: number; title: string; date: Date; image: string | null; url: string | null; active: boolean; showOnHome: boolean; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return {
    ...n,
    date: n.date.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}
