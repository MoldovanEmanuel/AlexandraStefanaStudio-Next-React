import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { contactRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(request: NextRequest) {
  // Honeypot check
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (raw.website && String(raw.website).length > 0) {
    // Bot detected — silently succeed
    return NextResponse.json({ ok: true });
  }

  // Rate limiting
  const ip = getClientIp(request);
  const { success, remaining } = await contactRateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Prea multe mesaje trimise. Vă rugăm să așteptați câteva minute." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      },
    );
  }

  // Validate
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Date invalide", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Eroare" }, { status: 400 });
  }

  // Persist
  await prisma.contactSubmission.create({
    data: { name: data.name, email: data.email, message: data.message, ipAddress: ip },
  });

  // Email
  try {
    await sendContactEmail({ name: data.name, email: data.email, message: data.message });
  } catch (error) {
    console.error("[Contact email]", error);
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true });
}
