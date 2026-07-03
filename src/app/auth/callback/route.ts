import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // setAll dipanggil dari Server Component — diabaikan kalau middleware refresh session
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // exchangeCodeForSession manggil setAll → cookieStore.set() nyimpen session cookie.
      // Tapi NextResponse.redirect() bikin response baru, jadi cookie gak ikut.
      // Fix: copy cookies dari cookieStore ke response redirect.
      const redirectUrl = new URL(`${origin}${next}`)
      const response = NextResponse.redirect(redirectUrl)
      cookieStore.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      return response
    }
  }

  // Return error page
  return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
}
