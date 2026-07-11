'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook untuk deteksi status koneksi browser.
 * Return boolean — true jika online, false jika offline.
 *
 * Gunakan di komponen yang perlu reaksi terhadap perubahan koneksi
 * (misal: disable tombol submit, tampilkan banner offline, trigger sync).
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
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
