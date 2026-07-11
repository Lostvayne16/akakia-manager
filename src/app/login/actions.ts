'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type GoogleState = { error?: string; redirectUrl?: string } | null

export async function signInWithGoogle(
  state: GoogleState,
  formData: FormData,
): Promise<GoogleState> {
  const supabase = await createClient()

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://akakia-manager.vercel.app'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Server Action 'redirect()' cuma ngikutin same-origin URL.
  // Supabase OAuth URL itu cross-origin, jadi return ke client buat di-navigate manual.
  if (data.url) {
    return { redirectUrl: data.url }
  }

  return { error: 'Gagal mengarahkan ke Google. Coba lagi.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
