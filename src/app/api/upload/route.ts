import { NextRequest, NextResponse } from "next/server";
import { uploadImageAsWebp } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "misc";

    if (!file) return NextResponse.json({ error: "Niciun fișier" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tip de fișier nepermis" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fișierul depășește 20MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadImageAsWebp(buffer, { folder });

    return NextResponse.json({ data: { url, key } });
  } catch (error) {
    console.error("[Upload]", error);
    return NextResponse.json({ error: "Eroare la upload" }, { status: 500 });
  }
}
