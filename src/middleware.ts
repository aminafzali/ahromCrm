import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/service-types") ||
    pathname.startsWith("/api/uploads") ||
    pathname.startsWith("/api/statuses") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/brands") ||
    pathname.startsWith("/api/products")
  ) {
    return NextResponse.next();
  }

  // Check if the path is for API routes
  if (
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/service-types")
  ) {
    const token = await getToken({ req: request });

    // If the user is not authenticated and trying to access a protected API route
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Check if the path is for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request });

    // If the user is not authenticated
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(pathname));
      return NextResponse.redirect(url);
    }

    // If the user is not an admin
    if (token.role !== "ADMIN" && !pathname.startsWith("/dashboard/profile")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check if the path is for user dashboard routes
  if (pathname.startsWith("/panel")) {
    const token = await getToken({ req: request });

    // If the user is not authenticated
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/panel/:path*", "/api/:path*"],
};
