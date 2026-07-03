'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let errorMessage = error.message
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Email atau password salah.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Email belum dikonfirmasi. Cek inbox email Anda.'
    }
    return { error: errorMessage }
  }

  redirect('/')
}

export async function signInWithGoogle(state: any, formData: FormData) {
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
