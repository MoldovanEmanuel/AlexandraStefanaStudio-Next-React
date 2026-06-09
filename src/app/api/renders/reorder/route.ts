import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const { ids } = z.object({ ids: z.array(z.number()) }).parse(await request.json());
  await prisma.$transaction(
    ids.map((id, i) => prisma.render.update({ where: { id }, data: { sortOrder: i + 1 } })),
  );
  await cacheDel(CACHE_KEYS.renders);
  return NextResponse.json({ ok: true });
}
