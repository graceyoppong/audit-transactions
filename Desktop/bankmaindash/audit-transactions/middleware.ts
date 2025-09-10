import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /dashboard)
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.includes(pathname)

  // Get authentication status from cookies and check for auth token
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  
  console.log('Middleware check:', { pathname, isAuthenticated, isPublicPath })

  // If trying to access protected route and not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated && pathname !== '/') {
    console.log('Redirecting to login - not authenticated')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    console.log('Redirecting to dashboard - already authenticated')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing root and authenticated, redirect to dashboard
  if (isAuthenticated && pathname === '/') {
    console.log('Redirecting to dashboard from root')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing root and not authenticated, redirect to login
  if (!isAuthenticated && pathname === '/') {
    console.log('Redirecting to login from root')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
