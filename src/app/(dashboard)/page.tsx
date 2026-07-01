import { getOrders } from './orders/actions'
import { ClipboardList, CheckCircle2, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const orders = await getOrders()

  // Hitung Statistik
  const activeOrders = orders.filter((o) => o.status === 'Masuk' || o.status === 'Dikerjakan')
  const completedOrdersCount = orders.filter((o) => o.status === 'Selesai' || o.status === 'Diambil').length

  // Hitung Pendapatan
  const completedRevenue = orders
    .filter((o) => o.status === 'Selesai' || o.status === 'Diambil')
    .reduce((sum, o) => sum + Number(o.estimated_price), 0)

  const potentialRevenue = orders
    .filter((o) => o.status === 'Masuk' || o.status === 'Dikerjakan')
    .reduce((sum, o) => sum + Number(o.estimated_price), 0)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp')
  }

  // 5 Pesanan Aktif Terbaru
  const latestActiveOrders = activeOrders.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-neutral-400">Ringkasan operasional Lostvayne Sofa Service.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Pesanan Aktif</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-neutral-500">Sedang diproses / antrean</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrdersCount}</div>
            <p className="text-xs text-neutral-500">Pesanan selesai & diambil</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Pendapatan Selesai</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{formatRupiah(completedRevenue)}</div>
            <p className="text-xs text-neutral-500">Dari pesanan selesai</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Potensi Pendapatan</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{formatRupiah(potentialRevenue)}</div>
            <p className="text-xs text-neutral-500">Dalam antrean aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Latest Active Orders */}
        <Card className="col-span-2 border-neutral-800 bg-neutral-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">5 Antrean Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestActiveOrders.length > 0 ? (
              latestActiveOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-neutral-800 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{order.sofa_type}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>{order.customer.name}</span>
                      <span>•</span>
                      <span>{order.service_type}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-emerald-400 font-semibold">{formatRupiah(order.estimated_price)}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      order.status === 'Masuk'
                        ? 'bg-blue-950/40 text-blue-400 border-blue-900/50'
                        : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-6">Tidak ada pesanan aktif saat ini.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-neutral-800 bg-neutral-900 text-white flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/orders" className="block w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white justify-center py-5 font-semibold">
                  Kelola Pesanan
                </Button>
              </Link>
              <Link href="/customers" className="block w-full">
                <Button variant="outline" className="w-full border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-800 justify-center py-5 font-semibold">
                  Kelola Pelanggan
                </Button>
              </Link>
            </CardContent>
          </div>
          <div className="p-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
            Lostvayne Sofa Service System v1.0
          </div>
        </Card>
      </div>
    </div>
  )
}
