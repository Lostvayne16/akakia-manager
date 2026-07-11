'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Zod schemas ---

const createOrderSchema = z.object({
  customer_id: z.string().uuid('ID pelanggan tidak valid'),
  sofa_type: z.string().min(1, 'Tipe sofa wajib diisi'),
  service_type: z.string().min(1, 'Tipe layanan wajib diisi'),
  price: z.coerce
    .number({ message: 'Harga harus berupa angka' })
    .positive('Harga harus lebih dari 0'),
})

const recordDpSchema = z.object({
  dp_amount: z.coerce
    .number({ message: 'Jumlah DP harus berupa angka' })
    .positive('Jumlah DP harus lebih dari 0'),
})

const recordPaymentSchema = z.object({
  paid_amount: z.coerce
    .number({ message: 'Jumlah pelunasan harus berupa angka' })
    .positive('Jumlah pelunasan harus lebih dari 0'),
})

const updateOrderSchema = z.object({
  sofa_type: z.string().min(1, 'Tipe sofa wajib diisi'),
  service_type: z.string().min(1, 'Tipe layanan wajib diisi'),
  price: z.coerce
    .number({ message: 'Harga harus berupa angka' })
    .positive('Harga harus lebih dari 0')
    .optional(),
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

export async function getOrders() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(id, name, phone, address)
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// --- Autocomplete suggestions (CLAUDE.md §14) ---

export async function getAutocompleteValues(
  field: 'sofa_type' | 'service_type',
  query: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(field)
    .ilike(field, `${query}%`)
    .order(field, { ascending: true })
    .limit(10)

  if (error) return []

  const seen = new Set<string>()
  const values: string[] = []
  for (const row of data) {
    const val = (row as Record<string, unknown>)[field] as string
    if (!seen.has(val)) {
      seen.add(val)
      values.push(val)
    }
  }
  return values
}

// --- Create ---

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  const parsed = createOrderSchema.safeParse({
    customer_id: formData.get('customer_id'),
    sofa_type: formData.get('sofa_type'),
    service_type: formData.get('service_type'),
    price: formData.get('price'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([parsed.data])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, data }
}

// --- Payment actions (wajib try/catch — CLAUDE.md §10 no.7) ---

export async function recordDp(id: string, formData: FormData) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pesanan tidak valid' }
  }

  const parsed = recordDpSchema.safeParse({
    dp_amount: formData.get('dp_amount'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('price, dp_amount')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return { error: 'Pesanan tidak ditemukan' }
    }

    if (order.dp_amount !== null) {
      return { error: 'DP sudah pernah dicatat untuk pesanan ini' }
    }

    if (parsed.data.dp_amount > Number(order.price)) {
      return {
        error: `Jumlah DP tidak boleh melebihi harga (Rp ${Number(order.price).toLocaleString('id-ID')})`,
      }
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update({
        dp_amount: parsed.data.dp_amount,
        dp_paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true, data }
  } catch (err) {
    return { error: formatError(err) }
  }
}

export async function recordPayment(id: string, formData: FormData) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pesanan tidak valid' }
  }

  const parsed = recordPaymentSchema.safeParse({
    paid_amount: formData.get('paid_amount'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('price, dp_amount, paid_amount')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return { error: 'Pesanan tidak ditemukan' }
    }

    if (order.paid_amount !== null) {
      return { error: 'Pelunasan sudah pernah dicatat untuk pesanan ini' }
    }

    const expectedAmount =
      order.dp_amount !== null
        ? Number(order.price) - Number(order.dp_amount)
        : Number(order.price)

    if (parsed.data.paid_amount !== expectedAmount) {
      return {
        error:
          `Jumlah pelunasan harus Rp ${expectedAmount.toLocaleString('id-ID')}` +
          ` (${order.dp_amount !== null ? 'sisa setelah DP' : 'harga penuh — belum ada DP'})`,
      }
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update({
        paid_amount: parsed.data.paid_amount,
        paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true, data }
  } catch (err) {
    return { error: formatError(err) }
  }
}

// --- Update ---

export async function updateOrder(id: string, formData: FormData) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pesanan tidak valid' }
  }

  const parsed = updateOrderSchema.safeParse({
    sofa_type: formData.get('sofa_type'),
    service_type: formData.get('service_type'),
    price: formData.get('price') || undefined,
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  // Cek pembayaran sebelum izinkan edit price
  if (parsed.data.price !== undefined) {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('dp_amount, paid_amount')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return { error: 'Pesanan tidak ditemukan' }
    }

    if (order.dp_amount !== null || order.paid_amount !== null) {
      return { error: 'Harga tidak dapat diubah karena sudah ada pembayaran tercatat' }
    }
  }

  // Hanya kirim field yang ada
  const updateData: Record<string, unknown> = {
    sofa_type: parsed.data.sofa_type,
    service_type: parsed.data.service_type,
  }
  if (parsed.data.price !== undefined) {
    updateData.price = parsed.data.price
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, data }
}

// --- Delete (mengikuti delete policy CLAUDE.md §4) ---

export async function deleteOrder(id: string, confirmed = false) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pesanan tidak valid' }
  }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('dp_amount, paid_amount')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return { error: 'Pesanan tidak ditemukan' }
  }

  const hasPayment = order.dp_amount !== null || order.paid_amount !== null

  // Jika sudah ada pembayaran tapi belum dikonfirmasi, minta konfirmasi dulu
  if (hasPayment && !confirmed) {
    return {
      requiresConfirmation: true,
      warning:
        'Order ini sudah memiliki pembayaran tercatat. ' +
        'Menghapusnya akan menghilangkan data ini dari laporan keuangan secara permanen.',
    }
  }

  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')

  return { success: true }
}
