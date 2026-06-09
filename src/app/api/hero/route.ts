import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImageAsWebp } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

export async function GET() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ data: slides.map(serialize) });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "Niciun fișier" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadImageAsWebp(buffer, { folder: "hero", maxWidth: 2560 });

    const maxOrder = await prisma.heroSlide.aggregate({ _max: { sortOrder: true } });
    const slide = await prisma.heroSlide.create({
      data: { image: url, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1, active: true },
    });

    await cacheDel(CACHE_KEYS.heroSlides);
    return NextResponse.json({ data: serialize(slide) }, { status: 201 });
  } catch (error) {
    console.error("[Hero POST]", error);
    return NextResponse.json({ error: "Eroare la upload" }, { status: 500 });
  }
}

function serialize(s: { id: number; image: string; sortOrder: number; active: boolean; createdAt: Date; updatedAt: Date }) {
  return { ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() };
}
