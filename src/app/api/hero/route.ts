import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { uploadImageAsWebp } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

async function storeImage(buffer: Buffer): Promise<string> {
  if (process.env.AWS_S3_BUCKET) {
    try {
      const { url } = await uploadImageAsWebp(buffer, { folder: "hero", maxWidth: 2560 });
      return url;
    } catch (err) {
      console.warn("[Hero] S3 upload failed, using local storage:", err);
    }
  }

  const webpBuffer = await sharp(buffer)
    .resize({ width: 2560, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `${uuidv4()}.webp`;
  const dir = join(process.cwd(), "public", "uploads", "hero");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), webpBuffer);
  return `/uploads/hero/${filename}`;
}

export async function GET() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ data: slides.map(serialize) });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storeImage(buffer);

    const maxOrder = await prisma.heroSlide.aggregate({ _max: { sortOrder: true } });
    const slide = await prisma.heroSlide.create({
      data: { image: url, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1, active: true },
    });

    await cacheDel(CACHE_KEYS.heroSlides);
    return NextResponse.json({ data: serialize(slide) }, { status: 201 });
  } catch (error) {
    console.error("[Hero POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

function serialize(s: { id: number; image: string; sortOrder: number; active: boolean; createdAt: Date; updatedAt: Date }) {
  return { ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() };
}
