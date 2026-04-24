import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { rotateAccessToken } from "@/lib/auth";

// Đổi tên function và export đúng cách
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // ── Redirect / ────────────────────────────────────────
  if (pathname === "/") {
    if (accessToken) {
      try {
        verifyAccessToken(accessToken);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {}
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const protectedRoutes = ["/dashboard", "/settings", "/departments"];
  const authRoutes = ["/signin", "/signup"];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  // ── Protected routes ───────────────────────────────────
  if (isProtected) {
    if (accessToken) {
      try {
        verifyAccessToken(accessToken);
        return NextResponse.next();
      } catch {}
    }

    if (refreshToken) {
      const newAccessToken = await rotateAccessToken(refreshToken);
      if (newAccessToken) {
        const response = NextResponse.next();
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 15,
          path: "/",
        });
        return response;
      }
    }

    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // ── Auth routes ────────────────────────────────────────
  if (isAuthRoute && accessToken) {
    try {
      verifyAccessToken(accessToken);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {}
  }

  return NextResponse.next();
}

// Bỏ export const runtime và export const config
// Next.js 16 proxy luôn chạy Node.js runtime, không cần khai báo
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
