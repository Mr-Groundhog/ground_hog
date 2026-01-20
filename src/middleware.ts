
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeToken } from '@/lib/token';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }
  
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = decodeToken<{ role: string }>(token);
    if (!payload || payload.role !== 'ADMIN') {
       // If not admin, redirect to home or show error. 
       // Redirecting to home seems appropriate for normal users.
       return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If we want to protect /admin routes but allow /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      const payload = decodeToken<{ role: string }>(token);
      if (!payload || payload.role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/', request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
