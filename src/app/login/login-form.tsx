'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-white shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-emerald-500">
          Lostvayne
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Sofa Service Management — Masuk ke Akun Anda
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
            <Label htmlFor="email" className="text-neutral-300">Email</Label>
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
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="border-neutral-700 bg-neutral-800 text-white focus-visible:ring-emerald-500"
            />
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
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </Button>
          <p className="text-center text-sm text-neutral-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
