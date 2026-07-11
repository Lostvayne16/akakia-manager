'use client'

import { useActionState, useEffect } from 'react'
import { signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'

const googleIcon = (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
)

export function LoginForm() {
  const [googleState, googleAction, isGooglePending] = useActionState(signInWithGoogle, null)

  useEffect(() => {
    if (googleState?.redirectUrl) {
      window.location.href = googleState.redirectUrl
    }
  }, [googleState])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm"
    >
      {/* Premium card with enhanced glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-2xl shadow-2xl">
        {/* Enhanced gradient glow at top */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Subtle corner accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative p-8 sm:p-10">
          {/* Logo + Brand — Enhanced hierarchy */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30 shadow-lg"
            >
              <svg
                className="h-8 w-8 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Akakia Manager
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2.5 text-sm font-medium text-muted-foreground"
            >
              Portal manajemen
            </motion.p>
          </div>

          {/* Form with premium styling */}
          <form action={googleAction} className="space-y-5">
            {/* Error alert with smooth animation */}
            {googleState?.error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent px-4 py-3 text-sm text-destructive font-medium"
              >
                {googleState.error}
              </motion.div>
            )}

            {/* Premium Google Button */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Button
                type="submit"
                formAction={googleAction}
                formNoValidate
                disabled={isGooglePending}
                className="relative h-13 w-full gap-3 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/95 via-primary to-primary/95 font-medium text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:from-primary hover:via-primary hover:to-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGooglePending ? (
                  <motion.span
                    className="flex items-center gap-2"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </motion.span>
                ) : (
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ gap: 4 }}
                  >
                    {googleIcon}
                    <span>Lanjutkan dengan Google</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Enhanced footer with better visual weight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center space-y-3"
      >
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          Dengan melanjutkan, Anda menyetujui{' '}
          <a href="#" className="font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Ketentuan Layanan
          </a>
          {' '}dan{' '}
          <a href="#" className="font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Kebijakan Privasi
          </a>
        </p>
      </motion.div>
    </motion.div>
  )
}

