import { RegisterForm } from './register-form'

export const metadata = {
  title: 'Daftar - Lostvayne Sofa Service',
  description: 'Buat akun baru untuk mengakses sistem manajemen servis sofa Lostvayne.',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <RegisterForm />
    </div>
  )
}
