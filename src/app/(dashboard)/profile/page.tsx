import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { User, Mail, LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email = user.email || ''
  const avatar = user.user_metadata?.avatar_url || null

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Profil</h1>
      </div>

      {/* Avatar + Nama */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-20 w-20 rounded-full border-2 border-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Info akun */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Info Akun
        </h2>

        <div className="flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3">
          <User className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Nama</p>
            <p className="text-sm font-medium text-foreground">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3">
          <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3">
          <LogOut className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Penyedia</p>
            <p className="text-sm font-medium text-foreground">Google OAuth</p>
          </div>
        </div>
      </div>

      {/* Tombol Keluar */}
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </form>
    </div>
  )
}
