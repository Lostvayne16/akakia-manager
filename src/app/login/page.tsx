import { LoginForm } from './login-form'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Jika sudah login, langsung alihkan ke dashboard
  if (user) {
    redirect('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <LoginForm />
    </main>
  )
}
