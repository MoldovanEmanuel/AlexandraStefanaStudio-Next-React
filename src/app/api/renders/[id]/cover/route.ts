import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { uploadImageAsWebp, deleteFromS3, keyFromUrl } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";

interface Params { params: Promise<{ id: string }> }

async function storeImage(buffer: Buffer): Promise<string> {
  const webpBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  if (process.env.AWS_S3_BUCKET) {
    try {
      const { url } = await uploadImageAsWebp(buffer, { folder: "renders/covers", maxWidth: 1200 });
      return url;
    } catch (err) {
      console.warn("[Renders cover] S3 upload failed, using local storage:", err);
    }
  }

  const filename = `${uuidv4()}.webp`;
  const dir = join(process.cwd(), "public", "uploads", "renders", "covers");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), webpBuffer);
  return `/uploads/renders/covers/${filename}`;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("cover") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Cover image file required" }, { status: 400 });
    }

    const render = await prisma.render.findUnique({ where: { id: Number(id) } });
    if (!render) {
      return NextResponse.json({ error: "Render not found" }, { status: 404 });
    }

    if (render.coverImage?.startsWith("http")) {
      try { await deleteFromS3(keyFromUrl(render.coverImage)); } catch {}
    }

    const url = await storeImage(Buffer.from(await file.arrayBuffer()));

    const updated = await prisma.render.update({
      where: { id: Number(id) },
      data: { coverImage: url },
    });

    await cacheDel(CACHE_KEYS.renders);
    return NextResponse.json({
      data: { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() },
    });
  } catch (error) {
    console.error("[Renders cover POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const render = await prisma.render.findUnique({ where: { id: Number(id) } });

  if (render?.coverImage) {
    if (render.coverImage.startsWith("http")) {
      try { await deleteFromS3(keyFromUrl(render.coverImage)); } catch {}
    }
    await prisma.render.update({ where: { id: Number(id) }, data: { coverImage: null } });
    await cacheDel(CACHE_KEYS.renders);
  }

  return NextResponse.json({ ok: true });
}
