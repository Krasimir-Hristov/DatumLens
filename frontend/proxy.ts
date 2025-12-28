import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy - Lightweight Only
 *
 * This should ONLY handle:
 * - URL rewrites
 * - Redirects based on URL patterns
 * - Header modifications
 *
 * Do NOT use for:
 * - Authentication (use page-level checks)
 * - Database queries
 * - Heavy processing
 */
export async function proxy(request: NextRequest) {
  // Just pass through - authentication is handled at page level
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
