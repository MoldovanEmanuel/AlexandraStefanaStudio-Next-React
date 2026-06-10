import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { ids } = z.object({ ids: z.array(z.number()) }).parse(await request.json());
    await prisma.$transaction(
      ids.map((id, i) => prisma.news.update({ where: { id }, data: { sortOrder: i + 1 } })),
    );
    await cacheDel("as-studio:news:*");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
