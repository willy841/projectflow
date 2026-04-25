import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/reset-password', '/forbidden'];

export function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const shouldTrace = pathname.startsWith('/vendors');

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = request.cookies.get('projectflow_session')?.value;
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    if (shouldTrace) {
      console.log('[middleware-vendor-detail]', JSON.stringify({ pathname, hasSession: false, action: 'redirect-login', totalMs: Date.now() - startedAt }));
    }
    return NextResponse.redirect(loginUrl);
  }

  if (shouldTrace) {
    console.log('[middleware-vendor-detail]', JSON.stringify({ pathname, hasSession: true, action: 'next', totalMs: Date.now() - startedAt }));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
