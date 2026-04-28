import NextAuth from "next-auth";
import { authConfig } from "@/app/(auth)/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/early-access", "/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/waitlist"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/ping")
  ) {
    return;
  }

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublicPage) {
    if (isAuthed && pathname === "/early-access") {
      return Response.redirect(new URL("/", req.url));
    }
    return;
  }

  if (!isAuthed) {
    return Response.redirect(new URL("/early-access", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
