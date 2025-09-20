/**
 * NEXT.JS AUTHENTICATION MIDDLEWARE
 * ==================================
 * 
 * This middleware handles authentication and authorization for the entire application.
 * It runs on every request and provides route protection, session management,
 * and admin access control.
 * 
 * KEY FEATURES:
 * - Route protection for admin areas
 * - Session refresh and validation
 * - Admin role verification
 * - OAuth callback handling
 * - Automatic redirects for unauthorized access
 * - Cookie-based session management
 * 
 * ARCHITECTURE:
 * - Uses Next.js middleware for request interception
 * - Integrates with Supabase SSR for server-side auth
 * - Cookie-based session handling
 * - Role-based access control
 * 
 * SECURITY FEATURES:
 * - Admin route protection
 * - Session validation on every request
 * - Role verification from database
 * - Secure redirect handling
 * - OAuth callback processing
 * 
 * PROTECTED ROUTES:
 * - /admin/* - Requires admin role
 * - /auth/callback - Handles OAuth callbacks
 * 
 * USAGE:
 * - Automatically runs on all requests
 * - No manual configuration required
 * - Handles authentication transparently
 * 
 * CONFIGURATION:
 * - Matches all routes except static files and API routes
 * - Customizable matcher pattern
 * 
 * @file middleware.ts
 * @author Authentication System
 * @version 1.0.0
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to login page if not authenticated
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if the user has an admin role from the `users` table
    const { data: profile } = await supabase
      .from('users')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.user_role !== 'admin') {
      // Redirect non-admin users to the home page or an unauthorized page
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.set('message', 'Admin access required');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle auth callback
  if (request.nextUrl.pathname === '/auth/callback') {
    const code = request.nextUrl.searchParams.get('code');
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      // Redirect to admin or home after successful auth
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
