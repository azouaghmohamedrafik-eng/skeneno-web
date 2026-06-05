import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isVentaMode = false; // true = Modo Venta activo

  const { pathname } = request.nextUrl;

  // Permitir siempre el acceso al panel de administración y archivos técnicos
  if (pathname.includes('/admin') || pathname.startsWith('/_next') || pathname.includes('/api')) {
    return NextResponse.next();
  }

  // Redirigir todo lo demás a /vendre
  if (isVentaMode && pathname !== '/vendre') {
    return NextResponse.redirect(new URL('/vendre', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};