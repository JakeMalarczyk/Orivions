import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// AUTH ARCHITECTURE FIX (per external audit finding 2.1):
// The previous middleware guessed session state by looking for a cookie named
// sb-*-auth-token, a cookie the plain supabase-js client never sets (it uses
// localStorage). Result: a redirect loop that locked every logged-in user out
// of both dashboards.
//
// This version uses @supabase/ssr's createServerClient, paired with
// createBrowserClient in lib/supabase.ts (which stores the session in cookies),
// and validates the session for real via supabase.auth.getUser().

const PROTECTED_PREFIXES = ['/provider-dashboard', '/client-dashboard', '/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() actually validates the JWT against Supabase, unlike checking
  // for a cookie's mere existence, this can't be fooled by a stale/forged cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/provider-dashboard/:path*', '/client-dashboard/:path*', '/admin/:path*'],
};
