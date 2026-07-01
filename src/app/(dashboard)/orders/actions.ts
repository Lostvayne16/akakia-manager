'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(id, name, phone, address)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createOrder(formData: {
  customer_id: string
  sofa_type: string
  service_type: string
  estimated_price: number
  status: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      customer_id: formData.customer_id,
      sofa_type: formData.sofa_type,
      service_type: formData.service_type,
      estimated_price: formData.estimated_price,
      status: formData.status
    }])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, data }
}

export async function updateOrder(
  id: string,
  formData: {
    customer_id: string
    sofa_type: string
    service_type: string
    estimated_price: number
    status: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({
      customer_id: formData.customer_id,
      sofa_type: formData.sofa_type,
      service_type: formData.service_type,
      estimated_price: formData.estimated_price,
      status: formData.status
    })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, data }
}

export async function updateOrderStatus(
  id: string,
  status: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, data }
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true }
}
