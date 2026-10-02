import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, ADMIN_AUTH_COOKIE_OPTIONS } from "@/lib/auth-cookie";
import { refreshSuperuserAuth } from "@/lib/pocketbase";

// Cookie-presence check only for protected routes (cheap, no PocketBase round
// trip) — the real check happens in app/dashboard/(protected)/layout.tsx, which
// redirects to /dashboard/login on an invalid token but can't clear the cookie
// itself (Server Components can't mutate cookies). So /dashboard/login is where a
// stale cookie actually gets validated and cleared, since proxy runs on the
// Node.js runtime here and can both fetch PocketBase and write the response
// cookie. Skipping that would bounce a stale-cookie visitor between /dashboard
// and /dashboard/login forever (ERR_TOO_MANY_REDIRECTS).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Backwards compatibility: redirect legacy /admin routes to /dashboard
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const newPath = pathname.replace(/^\/admin/, "/dashboard");
    const targetUrl = new URL(newPath, request.url);
    targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl);
  }
  if (pathname.startsWith("/api/admin/")) {
    const newPath = pathname.replace(/^\/api\/admin/, "/api/dashboard");
    const targetUrl = new URL(newPath, request.url);
    targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl);
  }

  const isLoginRoute = pathname === "/dashboard/login";
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;

  if (pathname.startsWith("/dashboard") && !isLoginRoute && !token) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  if (isLoginRoute && token) {
    const valid = await refreshSuperuserAuth(token);
    if (valid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const response = NextResponse.next();
    response.cookies.delete(ADMIN_AUTH_COOKIE);
    return response;
  }

  // Sliding session: PocketBase superuser tokens expire (1 day by default) and
  // the login cookie alone never renews them, so a form left open long enough
  // would save as a guest ("Only superusers can perform this action."). Swap in
  // a fresh token on every dashboard request, server action POSTs included,
  // and forward it upstream so this same request already uses it. On failure,
  // pass through: the protected layout redirects to login.
  if (pathname.startsWith("/dashboard") && token) {
    const refreshed = await refreshSuperuserAuth(token);
    if (refreshed) {
      request.cookies.set(ADMIN_AUTH_COOKIE, refreshed.token);
      const response = NextResponse.next({ request: { headers: request.headers } });
      response.cookies.set(ADMIN_AUTH_COOKIE, refreshed.token, ADMIN_AUTH_COOKIE_OPTIONS);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
