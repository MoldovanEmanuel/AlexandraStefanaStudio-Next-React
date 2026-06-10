import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { uploadImageAsWebp } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "misc";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 20MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (process.env.AWS_S3_BUCKET) {
      try {
        const { url, key } = await uploadImageAsWebp(buffer, { folder });
        return NextResponse.json({ data: { url, key } });
      } catch (err) {
        console.warn("[Upload] S3 failed, using local storage:", err);
      }
    }

    const webpBuffer = await sharp(buffer)
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `${uuidv4()}.webp`;
    const dir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), webpBuffer);
    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ data: { url, key: url } });
  } catch (error) {
    console.error("[Upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
