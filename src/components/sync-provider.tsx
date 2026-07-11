'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/lib/use-online-status'
import { syncPendingItems } from '@/lib/sync-manager'
import { getAllPendingCount } from '@/lib/offline-db'

/**
 * Client Component wrapper:
 * 1. Saat mount pertama kali + online, cek pending items dan trigger sync
 * 2. Saat transisi offline→online, trigger sync
 * 3. Tampilkan snackbar ringkasan hasil sync
 *
 * Letakkan di layout (app/layout.tsx) agar aktif di seluruh halaman.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const online = useOnlineStatus()
  const wasOffline = useRef(false)
  const mountSyncDone = useRef(false)

  // 1. Mount pertama — jika online dan ada pending items, sync
  useEffect(() => {
    if (online && !mountSyncDone.current) {
      mountSyncDone.current = true
      getAllPendingCount().then((count) => {
        if (count > 0) {
          syncPendingItems().then(({ success, failed }) => {
            const msg =
              failed > 0
                ? `${success} data berhasil disinkronkan, ${failed} gagal — akan dicoba lagi nanti`
                : `${success} data berhasil disinkronkan`
            toast.success(msg, { duration: 4000 })
          })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Transisi online/offline dalam sesi berjalan
  useEffect(() => {
    if (online) {
      if (wasOffline.current) {
        // Baru reconnect — trigger sync
        syncPendingItems().then(({ success, failed }) => {
          if (success > 0 || failed > 0) {
            const msg =
              failed > 0
                ? `${success} data berhasil disinkronkan, ${failed} gagal — akan dicoba lagi nanti`
                : `${success} data berhasil disinkronkan`
            toast.success(msg, { duration: 4000 })
          }
        })
      }
      wasOffline.current = false
    } else {
      wasOffline.current = true
    }
  }, [online])

  return <>{children}</>
}
