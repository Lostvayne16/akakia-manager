'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveImageReference(
  orderId: string,
  imageUrl: string,
  type: 'before' | 'after'
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_images')
    .insert([{
      order_id: orderId,
      image_url: imageUrl,
      type: type
    }])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  return { success: true, data }
}

export async function deleteImage(
  imageId: string,
  storagePath: string,
  orderId: string
) {
  const supabase = await createClient()

  // 1. Hapus file fisik dari Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('order_images')
    .remove([storagePath])

  if (storageError) {
    return { error: `Gagal menghapus file dari storage: ${storageError.message}` }
  }

  // 2. Hapus referensi dari database PostgreSQL
  const { error: dbError } = await supabase
    .from('order_images')
    .delete()
    .eq('id', imageId)

  if (dbError) {
    return { error: `Gagal menghapus data dari database: ${dbError.message}` }
  }

  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}
