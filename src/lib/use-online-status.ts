'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook untuk deteksi status koneksi browser.
 * Inisialisasi dengan true (SSR-safe) — nilai asli dari navigator.onLine
 * baru dibaca di useEffect setelah hydration.
 *
 * Return boolean — true jika online, false jika offline.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true) // sama di server maupun initial client render

  useEffect(() => {
    setOnline(navigator.onLine) // baca nilai sebarometer setelah mount

    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
