import { NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/results']

export function middleware(request) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for token in cookies or headers
    const token = request.cookies.get('token')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
