import { LoginForm } from './login-form'

export const metadata = {
  title: 'Login - Lostvayne Sofa Service',
  description: 'Masuk ke sistem manajemen servis sofa Lostvayne.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  )
}
