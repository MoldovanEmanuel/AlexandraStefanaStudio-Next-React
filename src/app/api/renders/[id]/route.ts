import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { deleteFromS3, keyFromUrl } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { title } = z.object({ title: z.string().min(1) }).parse(await request.json());
  const render = await prisma.render.update({ where: { id: Number(id) }, data: { title } });
  await cacheDel(CACHE_KEYS.renders);
  return NextResponse.json({ data: render });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const render = await prisma.render.findUnique({ where: { id: Number(id) } });
  if (render) {
    try { await deleteFromS3(keyFromUrl(render.videoPath)); } catch {}
    if (render.coverImage) {
      try { await deleteFromS3(keyFromUrl(render.coverImage)); } catch {}
    }
  }
  await prisma.render.delete({ where: { id: Number(id) } });
  await cacheDel(CACHE_KEYS.renders);
  return NextResponse.json({ ok: true });
}
