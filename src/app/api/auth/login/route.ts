import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, remember } = schema.parse(body);

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă" },
        { status: 401 },
      );
    }

    await setAuthCookie(
      { sub: String(user.id), email: user.email, name: user.name, role: "admin" },
      remember,
    );

    return NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("[Auth login]", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
