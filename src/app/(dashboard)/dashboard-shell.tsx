'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import AppDrawer from '@/components/app-drawer'
import CreateOrderSheet from '@/components/create-order-sheet'
import ExpenseSheet from '@/components/expense-sheet'
import CreateCustomerSheet from '@/components/create-customer-sheet'
import { getCustomers } from '@/app/(dashboard)/customers/actions'

type DrawerCtx = { open: boolean; toggle: () => void; close: () => void }
const DrawerContext = createContext<DrawerCtx | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be inside DashboardShell')
  return ctx
}

// --- Quick Create Context (global sheet dari FAB) ---
type QuickCreateSheet = null | 'order' | 'expense' | 'customer'

type QuickCreateCtx = {
  openOrderSheet: () => void
  openExpenseSheet: () => void
  openCustomerSheet: () => void
  closeSheet: () => void
}

const QuickCreateContext = createContext<QuickCreateCtx | null>(null)

export function useQuickCreate() {
  const ctx = useContext(QuickCreateContext)
  if (!ctx) throw new Error('useQuickCreate must be inside DashboardShell')
  return ctx
}
// ---

type Props = {
  children: ReactNode
  displayName: string
  userEmail: string
}

export default function DashboardShell({ children, displayName, userEmail }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggle = useCallback(() => setDrawerOpen((v) => !v), [])
  const close = useCallback(() => setDrawerOpen(false), [])

  // Global quick create sheet state
  const [activeSheet, setActiveSheet] = useState<QuickCreateSheet>(null)
  const [orderCustomers, setOrderCustomers] =
    useState<Awaited<ReturnType<typeof getCustomers>>>([])
  const [orderCustomersLoading, setOrderCustomersLoading] = useState(false)

  const openOrderSheet = useCallback(() => {
    setActiveSheet('order')
    setOrderCustomersLoading(true)
    getCustomers(false)
      .then(setOrderCustomers)
      .finally(() => setOrderCustomersLoading(false))
  }, [])

  const openExpenseSheet = useCallback(() => {
    setActiveSheet('expense')
  }, [])

  const openCustomerSheet = useCallback(() => {
    setActiveSheet('customer')
  }, [])

  const closeSheet = useCallback(() => {
    setActiveSheet(null)
  }, [])

  return (
    <DrawerContext.Provider value={{ open: drawerOpen, toggle, close }}>
      <QuickCreateContext.Provider
        value={{ openOrderSheet, openExpenseSheet, openCustomerSheet, closeSheet }}
      >
        <AppDrawer
          open={drawerOpen}
          onClose={close}
          userName={displayName}
          userEmail={userEmail}
        />

        {children}

        {/* Global Quick Create Sheets — muncul tanpa navigasi */}
        <CreateOrderSheet
          open={activeSheet === 'order'}
          onClose={closeSheet}
          customers={orderCustomers}
          customersLoading={orderCustomersLoading}
        />
        <ExpenseSheet
          open={activeSheet === 'expense'}
          onClose={closeSheet}
        />
        <CreateCustomerSheet
          open={activeSheet === 'customer'}
          onClose={closeSheet}
        />

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
      </QuickCreateContext.Provider>
    </DrawerContext.Provider>
  )
}
