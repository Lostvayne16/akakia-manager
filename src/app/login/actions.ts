'use server'

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
    // Terjemahkan beberapa pesan kesalahan umum agar ramah pengguna
    let errorMessage = error.message
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Email atau password salah.'
    }
    return { error: errorMessage }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
