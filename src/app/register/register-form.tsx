'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function RegisterForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(register, null)
  const [showPassword, setShowPassword] = useState(false)

  // Success state — show confirmation
  if (state?.success) {
    return (
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-white shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Cek Email Anda
          </CardTitle>
          <CardDescription className="text-neutral-400 leading-relaxed">
            Kami telah mengirimkan link verifikasi ke<br />
            <span className="font-medium text-emerald-400">{state.email}</span>
            <br /><br />
            Buka link tersebut untuk mengaktifkan akun, lalu kembali ke halaman login.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500"
          >
            Kembali ke Login
          </Button>
          <Link
            href="/login"
            className="text-sm text-neutral-500 hover:text-emerald-400 transition-colors"
          >
            Sudah punya akun? Masuk
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-white shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-emerald-500">
          Lostvayne
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Buat Akun Baru
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-200">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-300">
              Nama Lengkap
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Masukkan nama lengkap"
              required
              className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@lostvayne.com"
              required
              className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                className="border-neutral-700 bg-neutral-800 pr-10 text-white placeholder-neutral-500 focus-visible:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-600">Minimal 6 karakter</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500 disabled:bg-emerald-800"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Membuat Akun...
              </span>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>
          <p className="text-center text-sm text-neutral-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
