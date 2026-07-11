/**
 * Offline IndexedDB layer — menyimpan data yang dibuat/diubah saat offline
 * sebelum di-sync ke Supabase.
 *
 * Pendekatan: native IndexedDB API (tanpa library). Sederhana, tanpa dep.
 * UUID dari crypto.randomUUID() (native browser).
 *
 * 3 object store:
 *   - pending_orders
 *   - pending_customers
 *   - pending_expenses
 */

const DB_NAME = 'akakia-offline'
const DB_VERSION = 1

type StoreName = 'pending_orders' | 'pending_customers' | 'pending_expenses'

export type PendingAction = 'create' | 'update' | 'delete'

export type PendingRecord<T = unknown> = {
  id: string // UUID (client-generated)
  data: T
  action: PendingAction
  created_at: string // ISO timestamp (lokal)
  synced: boolean
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      for (const store of ['pending_orders', 'pending_customers', 'pending_expenses'] as StoreName[]) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Tambah item pending ke store tertentu. */
export async function addPendingItem<T>(
  store: StoreName,
  item: { data: T; action: PendingAction },
): Promise<string> {
  const db = await openDB()
  const tx = db.transaction(store, 'readwrite')
  const objectStore = tx.objectStore(store)

  const id = crypto.randomUUID()
  const record: PendingRecord<T> = {
    id,
    data: item.data,
    action: item.action,
    created_at: new Date().toISOString(),
    synced: false,
  }

  return new Promise((resolve, reject) => {
    const req = objectStore.add(record)
    req.onsuccess = () => resolve(id)
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

/** Ambil semua item pending dari store tertentu (belum sync). */
export async function getPendingItems<T = unknown>(
  store: StoreName,
): Promise<PendingRecord<T>[]> {
  const db = await openDB()
  const tx = db.transaction(store, 'readonly')
  const objectStore = tx.objectStore(store)

  return new Promise((resolve, reject) => {
    const req = objectStore.getAll()
    req.onsuccess = () => {
      const records = (req.result as PendingRecord<T>[]).filter(
        (r) => !r.synced,
      )
      resolve(records)
    }
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

/** Hapus item pending dari store (setelah sukses sync atau dibatalkan). */
export async function removePendingItem(
  store: StoreName,
  id: string,
): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(store, 'readwrite')
  const objectStore = tx.objectStore(store)

  return new Promise((resolve, reject) => {
    const req = objectStore.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

/** Hitung total semua item pending di semua store (yang belum sync). */
export async function getAllPendingCount(): Promise<number> {
  const db = await openDB()
  let total = 0

  const stores: StoreName[] = [
    'pending_orders',
    'pending_customers',
    'pending_expenses',
  ]

  for (const store of stores) {
    const tx = db.transaction(store, 'readonly')
    const objectStore = tx.objectStore(store)
    const records: PendingRecord[] = await new Promise((resolve, reject) => {
      const req = objectStore.getAll()
      req.onsuccess = () => resolve(req.result as PendingRecord[])
      req.onerror = () => reject(req.error)
    })
    total += records.filter((r) => !r.synced).length
  }

  db.close()
  return total
}
