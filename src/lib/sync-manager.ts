import { addPendingItem, getPendingItems, removePendingItem } from './offline-db'
import {
  createOrder,
  updateOrder,
  deleteOrder,
} from '@/app/(dashboard)/orders/actions'
import {
  createCustomer,
  updateCustomer,
  deactivateCustomer,
} from '@/app/(dashboard)/customers/actions'
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/app/(dashboard)/expenses/actions'
import type { PendingAction } from './offline-db'

type SyncResult = { success: number; failed: number }

/**
 * Helper: ubah object payload jadi FormData untuk server action.
 * Semua server action existing menerima FormData.
 */
function objectToFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value))
    }
  }
  return fd
}

/**
 * Helper: panggil server action yang sesuai berdasarkan store + action.
 * Return true jika sukses, false jika gagal.
 */
async function executeSync(
  store: string,
  action: PendingAction,
  data: Record<string, unknown>,
): Promise<boolean> {
  const fd = objectToFormData(data)

  switch (store) {
    // --- Orders ---
    case 'pending_orders': {
      if (action === 'create') {
        const res = await createOrder(fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'update') {
        if (!data.id || typeof data.id !== 'string') return false
        const res = await updateOrder(data.id, fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'delete') {
        if (!data.id || typeof data.id !== 'string') return false
        const res = await deleteOrder(data.id, true)
        if ('error' in res) return false
        return true
      }
      return false
    }

    // --- Customers ---
    case 'pending_customers': {
      if (action === 'create') {
        const res = await createCustomer(fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'update') {
        if (!data.id || typeof data.id !== 'string') return false
        const res = await updateCustomer(data.id, fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'delete') {
        // Customer menggunakan soft-delete (deactivate)
        if (!data.id || typeof data.id !== 'string') return false
        const res = await deactivateCustomer(data.id)
        if ('error' in res) return false
        return true
      }
      return false
    }

    // --- Expenses ---
    case 'pending_expenses': {
      if (action === 'create') {
        const res = await createExpense(fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'update') {
        if (!data.id || typeof data.id !== 'string') return false
        const res = await updateExpense(data.id, fd)
        if ('error' in res) return false
        return true
      }
      if (action === 'delete') {
        if (!data.id || typeof data.id !== 'string') return false
        const res = await deleteExpense(data.id)
        if ('error' in res) return false
        return true
      }
      return false
    }

    default:
      return false
  }
}

/**
 * Sinkronisasi semua pending items ke server.
 *
 * Proses sequential (bukan paralel) untuk menjaga konsistensi:
 * - customers dulu (agar customer_id tersedia untuk order yang mereferensikannya)
 * - orders
 * - expenses
 *
 * BATASAN: Server action create selalu generate ID baru di database
 * (gen_random_uuid). Customer yang dibuat offline akan punya ID
 * berbeda di server vs client. Order offline yang mereferensikan
 * customer baru offline tersebut akan gagal foreign key saat sync.
 *
 * Untuk itu, form Order Baru saat offline hanya menampilkan customer
 * yang SUDAH ada di server (pernah ter-load sebelum offline), bukan
 * customer yang masih pending sync. Limitation ini wajar untuk
 * skala aplikasi ini (±3 user).
 *
 * Items yang gagal tetap di queue (tidak dihapus) untuk dicoba lagi.
 * Items yang sukses dihapus dari IndexedDB.
 */
export async function syncPendingItems(): Promise<SyncResult> {
  const stores = ['pending_customers', 'pending_orders', 'pending_expenses'] as const
  let success = 0
  let failed = 0

  for (const store of stores) {
    const items = await getPendingItems<Record<string, unknown>>(store)

    for (const item of items) {
      try {
        const ok = await executeSync(store, item.action, item.data)
        if (ok) {
          await removePendingItem(store, item.id)
          success++
        } else {
          failed++
        }
      } catch {
        // Server error (bukan validation dari server action), jangan hapus
        failed++
      }
    }
  }

  return { success, failed }
}
