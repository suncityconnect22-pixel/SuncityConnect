// ============================================================
// Next.js Middleware — Auth Guard + Role Routing
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Public routes — no auth needed
  const publicRoutes = ['/login', '/auth/callback', '/auth/verify'];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If logged in and trying to access login, redirect to dashboard
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // Not logged in → redirect to login
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Logged in — check approval status
  const authOnlyRoutes = ['/waiting-approval', '/onboarding'];
  const { data: profile } = await supabase
    .from('users')
    .select('is_approved, role, name, house_number')
    .eq('id', user.id)
    .single();

  // If no profile exists yet (trigger may be pending), allow onboarding
  if (!profile) {
    if (pathname === '/onboarding' || pathname === '/waiting-approval') {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // If profile exists but name/house_number not set → onboarding
  if (!profile.name || !profile.house_number) {
    if (pathname === '/onboarding') {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // If not approved → waiting approval screen
  if (!profile.is_approved) {
    if (authOnlyRoutes.some((route) => pathname.startsWith(route))) {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/waiting-approval', request.url));
  }

  // Approved user trying to access waiting/onboarding → redirect to dashboard
  if (authOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based route protection
  const role = profile.role;

  // Guard routes — only guards
  if (pathname.startsWith('/guard') && role !== 'guard') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Super admin only: user management
    if (pathname.startsWith('/admin/users') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Guard accessing non-guard routes → redirect to guard dashboard
  if (role === 'guard' && !pathname.startsWith('/guard') && !pathname.startsWith('/profile')) {
    // Allow logout and profile access
    if (pathname === '/profile') return supabaseResponse;
    return NextResponse.redirect(new URL('/guard', request.url));
  }

  // Root redirect
  if (pathname === '/') {
    if (role === 'guard') {
      return NextResponse.redirect(new URL('/guard', request.url));
    }
    if (role === 'admin' || role === 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (svg, png, etc.)
     * - api routes for uploads
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
