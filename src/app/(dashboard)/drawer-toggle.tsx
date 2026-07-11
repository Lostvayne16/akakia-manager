'use client'

import { Menu } from 'lucide-react'
import { useDrawer } from './dashboard-shell'

export default function DrawerToggle() {
  const { toggle } = useDrawer()

  return (
    <button
      id="drawer-toggle"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
      aria-label="Buka menu navigasi"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
