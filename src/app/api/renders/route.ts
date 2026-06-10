import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

async function storeVideo(buffer: Buffer, originalName: string): Promise<string> {
  if (process.env.AWS_S3_BUCKET) {
    try {
      const { url } = await uploadVideo(buffer, originalName);
      return url;
    } catch (err) {
      console.warn("[Renders] S3 upload failed, using local storage:", err);
    }
  }

  const ext = originalName.split(".").pop()?.toLowerCase() ?? "mp4";
  const filename = `${uuidv4()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "videos");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/uploads/videos/${filename}`;
}

export async function GET() {
  const renders = await prisma.render.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ data: renders.map(serialize) });
}

export async function POST(request: NextRequest) {
  try {
    // Title comes as query param; video as raw binary body — avoids Next.js formData size limit
    const title = request.nextUrl.searchParams.get("title")?.trim();
    const filename = request.nextUrl.searchParams.get("filename") ?? "upload.mp4";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const arrayBuffer = await request.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(arrayBuffer);
    const videoUrl = await storeVideo(buffer, filename);

    const maxOrder = await prisma.render.aggregate({ _max: { sortOrder: true } });
    const render = await prisma.render.create({
      data: { title, videoPath: videoUrl, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
    });

    await cacheDel(CACHE_KEYS.renders);
    return NextResponse.json({ data: serialize(render) }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Renders POST]", error);
    return NextResponse.json({ error: msg || "Upload failed" }, { status: 500 });
  }
}

function serialize(r: { id: number; title: string; videoPath: string; coverImage: string | null; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return { ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() };
}
