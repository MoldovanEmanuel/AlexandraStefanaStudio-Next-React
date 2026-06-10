import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, remember } = schema.parse(body);

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    await setAuthCookie(
      { sub: "1", email: ADMIN_EMAIL, name: "Admin", role: "admin" },
      remember,
    );

    return NextResponse.json({
      data: { id: 1, name: "Admin", email: ADMIN_EMAIL },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    console.error("[Auth login]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
