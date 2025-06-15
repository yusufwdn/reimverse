import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/";

  // Get the token from cookies
  const token = request.cookies.get("auth_token")?.value || "";

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow access to public paths even if authenticated
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
