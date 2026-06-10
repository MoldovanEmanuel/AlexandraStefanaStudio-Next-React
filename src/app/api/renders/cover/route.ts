import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { writeFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { s3, mediaUrl } from "@/lib/s3";

const BUCKET = process.env.AWS_S3_BUCKET ?? "";
const COVER_KEY = "media/renders-cover.webp";
const LOCAL_COVER_PATH = join(process.cwd(), "public", "uploads", "renders-cover.webp");
const LOCAL_COVER_URL = "/uploads/renders-cover.webp";

export async function GET() {
  if (!BUCKET) {
    // Local fallback: check if file exists on disk
    try {
      await access(LOCAL_COVER_PATH);
      return NextResponse.json({ url: `${LOCAL_COVER_URL}?t=${Date.now()}` });
    } catch {
      return NextResponse.json({ url: null });
    }
  }

  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: COVER_KEY }));
    return NextResponse.json({ url: mediaUrl(COVER_KEY) });
  } catch {
    return NextResponse.json({ url: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cover") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const webpBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    if (BUCKET) {
      try {
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: COVER_KEY,
          Body: webpBuffer,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000",
        }));
        return NextResponse.json({ url: mediaUrl(COVER_KEY) });
      } catch (err) {
        console.warn("[Renders Cover] S3 upload failed, using local storage:", err);
      }
    }

    // Local fallback
    await mkdir(join(process.cwd(), "public", "uploads"), { recursive: true });
    await writeFile(LOCAL_COVER_PATH, webpBuffer);
    return NextResponse.json({ url: `${LOCAL_COVER_URL}?t=${Date.now()}` });
  } catch (error) {
    console.error("[Renders Cover POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
