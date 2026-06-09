import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { deleteFromS3, keyFromUrl } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const data = z.object({ active: z.boolean().optional() }).parse(body);
  const slide = await prisma.heroSlide.update({ where: { id: Number(id) }, data });
  await cacheDel(CACHE_KEYS.heroSlides);
  return NextResponse.json({ data: slide });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id: Number(id) } });
  if (slide) {
    try { await deleteFromS3(keyFromUrl(slide.image)); } catch {}
  }
  await prisma.heroSlide.delete({ where: { id: Number(id) } });
  await cacheDel(CACHE_KEYS.heroSlides);
  return NextResponse.json({ ok: true });
}
