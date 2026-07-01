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

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
