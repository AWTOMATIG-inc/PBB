import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth-cookie";
import { refreshSuperuserAuth } from "@/lib/pocketbase";

// Cookie-presence check only for protected routes (cheap, no PocketBase round
// trip) — the real check happens in app/admin/(protected)/layout.tsx, which
// redirects to /admin/login on an invalid token but can't clear the cookie
// itself (Server Components can't mutate cookies). So /admin/login is where a
// stale cookie actually gets validated and cleared, since proxy runs on the
// Node.js runtime here and can both fetch PocketBase and write the response
// cookie. Skipping that would bounce a stale-cookie visitor between /admin
// and /admin/login forever (ERR_TOO_MANY_REDIRECTS).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;

  if (pathname.startsWith("/admin") && !isLoginRoute && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginRoute && token) {
    const valid = await refreshSuperuserAuth(token);
    if (valid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const response = NextResponse.next();
    response.cookies.delete(ADMIN_AUTH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
