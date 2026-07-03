'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { login, signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)
  const [googleState, googleAction, isGooglePending] = useActionState(signInWithGoogle, null)

  useEffect(() => {
    if (googleState?.redirectUrl) {
      window.location.href = googleState.redirectUrl
    }
    if (state?.success) {
      window.location.href = '/'
    }
  }, [googleState, state])

  return (
    <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">
          Lostvayne
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sofa Service Management — Masuk ke Akun Anda
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {googleState?.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {googleState.error}
            </div>
          )}

          {/* Google OAuth Button */}
          <Button
            type="submit"
            formAction={googleAction}
            formNoValidate
            variant="outline"
            disabled={isGooglePending}
            className="w-full gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGooglePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengarahkan ke Google...
              </>
            ) : (
              'Lanjutkan dengan Google'
            )}
          </Button>

          <div className="relative">
            <Separator className="mb-4" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              atau
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@lostvayne.com"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-input border-border text-foreground focus-visible:ring-ring"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
