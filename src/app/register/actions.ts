'use server'

import { createClient } from '@/utils/supabase/server'

export async function register(state: any, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  const supabase = await createClient()

  // Sign up with Supabase Auth, passing name in metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.includes('localhost') ? 'http://localhost:3000' : 'https://akakia-manager.vercel.app'}/`,
    },
  })

  if (error) {
    let errorMessage = error.message
    if (error.message.includes('already registered')) {
      errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
    } else if (error.message.includes('valid email')) {
      errorMessage = 'Format email tidak valid.'
    }
    return { error: errorMessage }
  }

  // Check if user needs email confirmation
  if (data.user && !data.session) {
    return { success: true, email }
  }

  // Auto-confirmed (if email confirmation is disabled in Supabase)
  return { success: true, email }
}
