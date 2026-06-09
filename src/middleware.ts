import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./lib/jwt";

const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath =
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    !pathname.startsWith("/admin/login");

  const isAdminApiPath =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/contact") &&
    !pathname.startsWith("/api/projects") &&
    // Allow GET on public API routes; protect POST/PUT/DELETE/PATCH
    ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);

  if (!isAdminPath && !isAdminApiPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    if (isAdminApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    if (isAdminApiPath) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin-token");
    return response;
  }

  // Attach user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-id", payload.sub);
  requestHeaders.set("x-admin-email", payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
