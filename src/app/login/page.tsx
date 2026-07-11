import { LoginForm } from './login-form'

export const metadata = {
  title: 'Login - Akakia Manager',
  description: 'Masuk ke sistem manajemen servis sofa Akakia.',
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-60 w-60 -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(94, 106, 210, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 106, 210, 1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <LoginForm />
    </div>
  )
}
