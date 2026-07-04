import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const redirectPath = url.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin))
  }

  // Build response first — Supabase setAll writes cookies directly to this response.
  const redirectResponse = NextResponse.redirect(new URL(redirectPath, url.origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies WITH original options (httpOnly, sameSite, path, secure, etc.)
          // directly onto the redirect response so they reach the browser correctly.
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin))
  }

  return redirectResponse
}
