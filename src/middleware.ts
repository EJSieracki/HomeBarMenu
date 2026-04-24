import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthed = !!session;
  const role = session?.user?.role;

  // Public routes — always accessible
  if (
    pathname.startsWith("/bar/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Protected routes — require login
  if (!isAuthed) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Bartender routes
  if (pathname.startsWith("/bartender") && role !== "BARTENDER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Dashboard routes — CREATOR or ADMIN only
  if (pathname.startsWith("/dashboard") && role !== "CREATOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/bartender", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
