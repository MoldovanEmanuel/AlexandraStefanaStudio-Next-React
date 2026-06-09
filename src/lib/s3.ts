import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.AWS_S3_BUCKET ?? "";
const CLOUDFRONT = process.env.CLOUDFRONT_DOMAIN;

export function mediaUrl(key: string): string {
  if (CLOUDFRONT) return `https://${CLOUDFRONT}/${key}`;
  return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? "eu-central-1"}.amazonaws.com/${key}`;
}

interface UploadOptions {
  folder: string;
  quality?: number;
  maxWidth?: number;
}

export async function uploadImageAsWebp(
  buffer: Buffer,
  options: UploadOptions,
): Promise<{ key: string; url: string }> {
  const { folder, quality = 85, maxWidth = 2400 } = options;

  const webpBuffer = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const key = `media/${folder}/${uuidv4()}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, url: mediaUrl(key) };
}

export async function uploadVideo(
  buffer: Buffer,
  originalName: string,
): Promise<{ key: string; url: string }> {
  const ext = originalName.split(".").pop() ?? "mp4";
  const key = `media/videos/${uuidv4()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "video/mp4",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, url: mediaUrl(key) };
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}

export function keyFromUrl(url: string): string {
  // Extract S3 key from either CloudFront URL or S3 URL
  if (CLOUDFRONT && url.includes(CLOUDFRONT)) {
    return url.replace(`https://${CLOUDFRONT}/`, "");
  }
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match?.[1] ?? url;
}
