import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/transactions",
  "/wallets",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
]

// Auth pages (redirect to dashboard if already logged in)
const authPaths = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  // Check if the current path is an auth page
  const isAuthPage = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  // Check for session cookie (NextAuth.js JWT session token)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  // Redirect to login if accessing protected route without session
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if already logged in and visiting auth pages
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
