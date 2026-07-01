'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createCustomer(formData: { name: string; phone: string; address?: string }) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name: formData.name,
      phone: formData.phone,
      address: formData.address || null
    }])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true, data }
}

export async function updateCustomer(id: string, formData: { name: string; phone: string; address?: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .update({
      name: formData.name,
      phone: formData.phone,
      address: formData.address || null
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

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true }
}
