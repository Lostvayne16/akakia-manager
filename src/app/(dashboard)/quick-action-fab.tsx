'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ClipboardList, Receipt, UserPlus } from 'lucide-react'

const shortcuts = [
  {
    label: 'Pesanan Baru',
    href: '/orders?new=true',
    icon: ClipboardList,
    iconBg: 'bg-primary',
  },
  {
    label: 'Catat Pengeluaran',
    href: '/expenses?new=true',
    icon: Receipt,
    iconBg: 'bg-rose-500',
  },
  {
    label: 'Tambah Pelanggan',
    href: '/customers?new=true',
    icon: UserPlus,
    iconBg: 'bg-emerald-500',
  },
] as const

export function QuickActionFab() {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <>
      {/* Backdrop — only rendered when open */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={close} />
      )}

      {/* FAB + pills container */}
      <div
        className="fixed bottom-0 right-0 z-50 flex flex-col items-end md:hidden"
        style={{
          padding: `0 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.25rem) 0`,
        }}
      >
        {/* Shortcut pills — expand upward */}
        <div
          className={`mb-3 flex flex-col items-end gap-2 transition-all duration-200 ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={close}
              className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg transition-colors hover:bg-muted/60"
            >
              <span className="whitespace-nowrap text-sm font-medium text-foreground">
                {s.label}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${s.iconBg} text-white`}
              >
                <s.icon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Main FAB button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:bg-primary/90 active:scale-95"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          <Plus
            className={`h-6 w-6 transition-transform duration-200 ${
              open ? 'rotate-45' : 'rotate-0'
            }`}
          />
        </button>
      </div>
    </>
  )
}
