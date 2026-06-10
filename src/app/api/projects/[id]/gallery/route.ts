import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { uploadImageAsWebp, deleteFromS3, keyFromUrl } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";
import type { GalleryImage } from "@/types";

async function storeImage(buffer: Buffer, projectId: string): Promise<string> {
  if (process.env.AWS_S3_BUCKET) {
    try {
      const { url } = await uploadImageAsWebp(buffer, { folder: `portfolio/${projectId}`, maxWidth: 2400 });
      return url;
    } catch (err) {
      console.warn("[Gallery] S3 upload failed, using local storage:", err);
    }
  }

  const webpBuffer = await sharp(buffer)
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `${uuidv4()}.webp`;
  const dir = join(process.cwd(), "public", "uploads", "projects", projectId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), webpBuffer);
  return `/uploads/projects/${projectId}/${filename}`;
}

interface Params {
  params: Promise<{ id: string }>;
}

// ── POST — upload & append gallery image ──────────────────────────────────────
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storeImage(buffer, id);

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      select: { gallery: true, slug: true },
    });

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const gallery = (project.gallery as GalleryImage[]) ?? [];
    gallery.push({ src: url, orientation: "landscape" });

    await prisma.project.update({
      where: { id: Number(id) },
      data: { gallery },
    });

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ data: { src: url } }, { status: 201 });
  } catch (error) {
    console.error("[Gallery POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// ── DELETE — remove gallery image ─────────────────────────────────────────────
const deleteSchema = z.object({ src: z.string() });

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { src } = deleteSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      select: { gallery: true },
    });

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const gallery = ((project.gallery as GalleryImage[]) ?? []).filter(
      (img) => img.src !== src,
    );

    await prisma.project.update({
      where: { id: Number(id) },
      data: { gallery },
    });

    // Best-effort S3 delete (only for S3 URLs)
    if (src.startsWith("http")) {
      try { await deleteFromS3(keyFromUrl(src)); } catch {}
    }

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH — toggle orientation ────────────────────────────────────────────────
const patchSchema = z.object({
  src: z.string(),
  orientation: z.enum(["landscape", "portrait"]),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { src, orientation } = patchSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      select: { gallery: true },
    });

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const gallery = ((project.gallery as GalleryImage[]) ?? []).map((img) =>
      img.src === src ? { ...img, orientation } : img,
    );

    await prisma.project.update({
      where: { id: Number(id) },
      data: { gallery },
    });

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
