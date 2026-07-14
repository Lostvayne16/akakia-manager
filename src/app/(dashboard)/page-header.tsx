'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Daftar Pesanan',
  '/customers': 'Daftar Pelanggan',
  '/expenses': 'Pengeluaran',
  '/reports': 'Laporan',
  '/settings': 'Pengaturan',
  '/profile': 'Profil',
}

export default function PageHeader() {
  const pathname = usePathname()

  // Dynamic route: /orders/[id] → "Detail Pesanan"
  // Masuk sini kalo pathname startsWith /orders/ tapi bukan /orders exactly
  if (pathname !== '/orders' && pathname.startsWith('/orders/')) {
    return <h1 className="text-lg font-semibold text-foreground">Detail Pesanan</h1>
  }

  const title = titles[pathname] ?? 'Dashboard'
  return (
    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
  )
}
