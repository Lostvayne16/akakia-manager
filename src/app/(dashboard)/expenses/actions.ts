'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/constants'

export type Expense = {
  id: string
  expense_date: string
  category: ExpenseCategory
  amount: number
  notes: string | null
  created_at: string
}

/**
 * Ambil semua expense, diurutkan dari tanggal terbaru.
 */
export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as Expense[]
}

const expenseSchema = z.object({
  expense_date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: 'Kategori tidak valid' }),
  }),
  amount: z.coerce
    .number({ message: 'Jumlah harus berupa angka' })
    .positive('Jumlah harus lebih dari 0'),
  notes: z.string().optional().default(''),
})

const expenseSchemaWithConditionalNotes = expenseSchema.superRefine((data, ctx) => {
  if (data.category === 'Lainnya' && (!data.notes || data.notes.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Catatan wajib diisi jika kategori Lainnya',
      path: ['notes'],
    })
  }
})

export type ExpenseFormData = z.infer<typeof expenseSchemaWithConditionalNotes>

function formatError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((i) => i.message).join(', ')
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient()

  const parsed = expenseSchemaWithConditionalNotes.safeParse({
    expense_date: formData.get('expense_date'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  const { expense_date, category, amount, notes } = parsed.data

  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        expense_date,
        category,
        amount,
        notes: notes || null,
      },
    ])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/expenses')
  revalidatePath('/')
  return { success: true, data }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pengeluaran tidak valid' }
  }

  const parsed = expenseSchemaWithConditionalNotes.safeParse({
    expense_date: formData.get('expense_date'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    return { error: formatError(parsed.error) }
  }

  const { expense_date, category, amount, notes } = parsed.data

  const { data, error } = await supabase
    .from('expenses')
    .update({
      expense_date,
      category,
      amount,
      notes: notes || null,
    })
    .eq('id', id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/expenses')
  revalidatePath('/')
  return { success: true, data }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  if (!id) {
    return { error: 'ID pengeluaran tidak valid' }
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/expenses')
  revalidatePath('/')
  return { success: true }
}
