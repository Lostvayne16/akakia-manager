import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { OrderDetailClient } from './order-detail-client'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Ambil detail pesanan, data pelanggan, dan galeri foto sekaligus
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(id, name, phone, address),
      images:order_images(*)
    `)
    .eq('id', id)
    .single()

  // === DEBUG ===
  console.log('[OrderDetailPage] id:', id)
  console.log('[OrderDetailPage] error:', error)
  console.log('[OrderDetailPage] order:', order)
  if (error || !order) {
    notFound()
  }

  return (
    <div className="w-full">
      <OrderDetailClient order={order} />
    </div>
  )
}
