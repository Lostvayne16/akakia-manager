import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import DashboardShell from './dashboard-shell'
import DrawerToggle from './drawer-toggle'
import SidebarNav from './sidebar-nav'
import PageHeader from './page-header'

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

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email || ''

  return (
    <DashboardShell displayName={displayName} userEmail={userEmail}>
      {/* Sidebar — Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">Akakia Manager</span>
          </div>
        </div>

        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8 safe-area-top">
          {/* Mobile hamburger + logo */}
          <div className="flex items-center gap-3">
            <DrawerToggle />
            <span className="text-lg font-bold tracking-tight text-primary md:hidden">Akakia Manager</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
              <PageHeader />
            </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-accent-foreground/15 flex items-center justify-center text-xs font-bold text-accent-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-accent-foreground md:block">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 pb-4 md:p-8 safe-area-bottom">
          {children}
        </main>
      </div>
    </DashboardShell>
  )
}
