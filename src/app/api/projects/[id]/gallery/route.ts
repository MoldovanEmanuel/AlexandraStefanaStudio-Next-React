import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { uploadImageAsWebp, deleteFromS3, keyFromUrl } from "@/lib/s3";
import { cacheDel, CACHE_KEYS } from "@/lib/redis";
import type { GalleryImage } from "@/types";

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
      return NextResponse.json({ error: "Niciun fișier primit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadImageAsWebp(buffer, {
      folder: `portfolio/${id}`,
      maxWidth: 2400,
    });

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

    return NextResponse.json({ data: { src: url, key } }, { status: 201 });
  } catch (error) {
    console.error("[Gallery POST]", error);
    return NextResponse.json({ error: "Eroare la upload" }, { status: 500 });
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

    // Best-effort S3 delete
    try { await deleteFromS3(keyFromUrl(src)); } catch {}

    await cacheDel(CACHE_KEYS.projects);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
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
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
