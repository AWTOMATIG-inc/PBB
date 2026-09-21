import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth-cookie";

// Optimistic check only (cookie presence, not validity) — the real check
// against PocketBase happens in app/admin/(protected)/layout.tsx.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const hasSession = Boolean(request.cookies.get(ADMIN_AUTH_COOKIE)?.value);

  if (pathname.startsWith("/admin") && !isLoginRoute && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginRoute && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
