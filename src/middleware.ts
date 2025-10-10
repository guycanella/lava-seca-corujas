import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/callback'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasSession =
    req.cookies.get('sb-access-token') || req.cookies.get('sb-refresh-token');

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';

    const from = pathname || '/';
    if (from !== '/') {
      url.searchParams.set('redirectTo', from);
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/reservar', '/admin'],
};