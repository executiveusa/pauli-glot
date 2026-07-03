import { NextRequest, NextResponse } from 'next/server';

// Middleware disabled for development
// TODO: Re-enable Clerk authentication when environment variables are configured
export function middleware(request: NextRequest) {
  // Pass through all requests during development
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    '/(api|trpc)(.*)',
  ],
};
