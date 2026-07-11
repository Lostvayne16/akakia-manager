import { LoginForm } from './login-form'

export const metadata = {
  title: 'Login - Akakia Manager',
  description: 'Masuk ke sistem manajemen servis sofa Akakia.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  )
}
