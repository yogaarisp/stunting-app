import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Safety check for environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/input', '/rekomendasi', '/admin', '/profile', '/grafik'];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Admin route protection & Auth-page redirection
  if (user) {
    try {
      // Role check for specific redirects
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';

      if (isAdminRoute || isAuthRoute) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || 'user';

        // 1. If trying to access admin but not an admin
        if (isAdminRoute && role !== 'admin') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }

        // 2. If accessing auth pages while logged in
        if (isAuthRoute) {
          const url = request.nextUrl.clone();
          url.pathname = role === 'admin' ? '/admin' : '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    } catch (e) {
      console.error('Middleware profile check failed:', e);
      // Fallback: let the request through or redirect to a safe place
    }
  }

  return supabaseResponse;
}
