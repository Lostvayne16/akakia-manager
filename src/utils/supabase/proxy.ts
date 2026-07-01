import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT remove this. This is important for keeping the user logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Jika pengguna belum login dan mencoba mengakses halaman yang dilindungi, alihkan ke /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    request.nextUrl.pathname !== '/favicon.ico' &&
    request.nextUrl.pathname !== '/manifest.json' &&
    request.nextUrl.pathname !== '/icon.png'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Jika pengguna sudah login, cegah akses ke halaman login dan register
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/register'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // atau dashboard utama
    return NextResponse.redirect(url)
  }


  return supabaseResponse
}
