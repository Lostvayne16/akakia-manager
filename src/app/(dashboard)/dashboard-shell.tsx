'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import AppDrawer from '@/components/app-drawer'

type DrawerCtx = { open: boolean; toggle: () => void; close: () => void }
const DrawerContext = createContext<DrawerCtx | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be inside DashboardShell')
  return ctx
}

type Props = {
  children: ReactNode
  displayName: string
  userEmail: string
}

export default function DashboardShell({ children, displayName, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <DrawerContext.Provider value={{ open, toggle, close }}>
      <AppDrawer
        open={open}
        onClose={close}
        userName={displayName}
        userEmail={userEmail}
      />

      {children}

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.875rem',
          },
        }}
      />
    </DrawerContext.Provider>
  )
}
