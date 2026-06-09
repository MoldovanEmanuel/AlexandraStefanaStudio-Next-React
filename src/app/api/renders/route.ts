import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

export async function GET() {
  const renders = await prisma.render.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ data: renders.map(serialize) });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;
    const title = formData.get("title") as string | null;

    if (!file || !title) {
      return NextResponse.json({ error: "Fișier și titlu obligatorii" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadVideo(buffer, file.name);

    const maxOrder = await prisma.render.aggregate({ _max: { sortOrder: true } });
    const render = await prisma.render.create({
      data: { title, videoPath: url, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
    });

    await cacheDel(CACHE_KEYS.renders);
    return NextResponse.json({ data: serialize(render) }, { status: 201 });
  } catch (error) {
    console.error("[Renders POST]", error);
    return NextResponse.json({ error: "Eroare la upload" }, { status: 500 });
  }
}

function serialize(r: { id: number; title: string; videoPath: string; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return { ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() };
}
