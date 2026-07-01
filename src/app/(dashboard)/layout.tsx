import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, ClipboardList, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '../login/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white pb-16 md:pb-0 md:pl-64">
      {/* Top Header for Mobile */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 backdrop-blur-md md:hidden">
        <span className="text-lg font-bold tracking-tight text-emerald-500">Lostvayne</span>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-800 bg-neutral-900 px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-500">Lostvayne</span>
          <p className="text-xs text-neutral-400">Sofa Service Management</p>
        </div>
        <nav className="flex-1 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5 text-emerald-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ClipboardList className="h-5 w-5 text-emerald-500" />
            <span>Daftar Pesanan</span>
          </Link>
          <Link
            href="/customers"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Users className="h-5 w-5 text-emerald-500" />
            <span>Daftar Pelanggan</span>
          </Link>
        </nav>
        <div className="border-t border-neutral-800 pt-4">
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
              <LogOut className="h-5 w-5 text-red-400" />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-lg md:hidden">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center gap-1 text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Beranda</span>
        </Link>
        <Link
          href="/orders"
          className="flex flex-1 flex-col items-center justify-center gap-1 text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <ClipboardList className="h-5 w-5" />
          <span className="text-[10px]">Pesanan</span>
        </Link>
        <Link
          href="/customers"
          className="flex flex-1 flex-col items-center justify-center gap-1 text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px]">Pelanggan</span>
        </Link>
      </nav>
    </div>
  )
}
