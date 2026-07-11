'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Zod schemas ---

const customerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  address: z.string().optional().default(''),
})

// --- Helpers ---

function formatError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((i) => i.message).join(', ')
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}

// --- Read ---

export async function getCustomers(includeInactive = false) {
  const supabase = await createClient()

  let query = supabase.from('customers').select('*').order('name', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function getCustomerOrderCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('customer_id')

  if (error) throw new Error(error.message)

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.customer_id] = (counts[row.customer_id] || 0) + 1
  }
  return counts
}

// --- Create ---

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const parsed = customerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address || null,
      },
    ])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true, data }
}

// --- Update ---

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pelanggan tidak valid' }
  }

  const parsed = customerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  const { data, error } = await supabase
    .from('customers')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address || null,
    })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  revalidatePath('/orders')
  return { success: true, data }
}

// --- Soft-delete / Reactivate ---

export async function deactivateCustomer(id: string) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pelanggan tidak valid' }
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true, data }
}

export async function reactivateCustomer(id: string) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pelanggan tidak valid' }
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ is_active: true })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true, data }
}

// --- Hard delete (mengikuti delete policy CLAUDE.md §4) ---

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pelanggan tidak valid' }
  }

  // Cek apakah customer memiliki riwayat order
  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', id)

  if (countError) {
    return { error: countError.message }
  }

  if (count !== null && count > 0) {
    return {
      error:
        'Pelanggan ini memiliki riwayat pesanan dan tidak dapat dihapus permanen. ' +
        'Gunakan opsi nonaktifkan sebagai gantinya.',
    }
  }

  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/customers')
  return { success: true }
}
