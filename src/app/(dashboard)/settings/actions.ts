'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateUserProfile(formData: FormData) {
  const fullName = (formData.get('fullName') as string)?.trim()

  if (!fullName) {
    redirect('/settings?error=Nama tidak boleh kosong.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  })

  if (error) {
    redirect('/settings?error=Gagal menyimpan: ' + encodeURIComponent(error.message))
  }

  revalidatePath('/settings')
  redirect('/settings?success=1')
}
