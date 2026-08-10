import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import LogtoClient from '@logto/next/edge';
import { logtoConfig } from '@/lib/logto';

const logtoClient = new LogtoClient(logtoConfig);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  const isProtected = pathname.startsWith('/dashboard') || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login'));

  if (!isProtected) {
    return NextResponse.next();
  }

  const context = await logtoClient.getLogtoContext(request);

  if (!context.isAuthenticated || !context.claims?.sub) {
    return NextResponse.redirect(new URL('/api/logto/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
