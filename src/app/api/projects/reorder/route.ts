import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

const schema = z.object({ ids: z.array(z.number()) });

export async function POST(request: NextRequest) {
  try {
    const { ids } = schema.parse(await request.json());

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
