'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, ShoppingCart, BarChart3, Settings, User } from 'lucide-react'
import NavLink from './nav-link'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Pesanan', icon: ClipboardList },
  { href: '/customers', label: 'Pelanggan', icon: Users },
  { href: '/expenses', label: 'Pengeluaran', icon: ShoppingCart },
  { href: '/reports', label: 'Laporan Keuangan', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
] as const

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <NavLink
          href="/profile"
          label="Profil"
          icon={User}
        />
      </div>
    </>
  )
}
