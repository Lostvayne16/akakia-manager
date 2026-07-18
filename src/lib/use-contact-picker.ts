'use client'

import { useCallback, useState } from 'react'

type PickedContact = {
  name: string
  phone: string
}

/**
 * Hook untuk Contact Picker API (`navigator.contacts.select`).
 *
 * Cuma didukung Chrome Android (belum ada di iOS Safari/desktop) — jadi
 * `isSupported` WAJIB dicek dulu sebelum menampilkan tombolnya, dan form
 * manual (input teks biasa) harus selalu tetap ada sebagai fallback,
 * jangan pernah gantikan sepenuhnya.
 *
 * Tujuan: owner biasanya udah nyimpen kontak customer duluan di WhatsApp
 * sebelum input ke aplikasi — hook ini menghindari copy-paste manual
 * bolak-balik antar app.
 */
export function useContactPicker() {
  const [isPicking, setIsPicking] = useState(false)

  const isSupported =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window

  const pickContact = useCallback(async (): Promise<PickedContact | null> => {
    if (!isSupported) return null

    setIsPicking(true)
    try {
      // @ts-expect-error - Contact Picker API belum ada di lib.dom.d.ts TypeScript standar
      const contacts = await navigator.contacts.select(['name', 'tel'], {
        multiple: false,
      })

      if (!contacts || contacts.length === 0) return null

      const contact = contacts[0] as { name?: string[]; tel?: string[] }
      const name = contact.name?.[0]?.trim() || ''
      const phone = contact.tel?.[0]?.trim() || ''

      if (!name && !phone) return null

      return { name, phone }
    } catch {
      // User membatalkan picker, atau permission ditolak — bukan error yang perlu ditampilkan
      return null
    } finally {
      setIsPicking(false)
    }
  }, [isSupported])

  return { isSupported, isPicking, pickContact }
}
