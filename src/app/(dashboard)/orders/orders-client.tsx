'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2, Calendar, User, Hammer, CircleDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createOrder, updateOrder, deleteOrder, updateOrderStatus } from './actions'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
}

type Order = {
  id: string
  customer_id: string
  sofa_type: string
  service_type: string
  estimated_price: number
  status: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'
  created_at: string
  updated_at: string
  customer: Customer
}

export function OrdersClient({
  initialOrders,
  customers,
}: {
  initialOrders: Order[]
  customers: Customer[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Form states
  const [customerId, setCustomerId] = useState('')
  const [sofaType, setSofaType] = useState('')
  const [serviceType, setServiceType] = useState('Cuci')
  const [priceInput, setPriceInput] = useState('') // Formatted Rupiah string
  const [status, setStatus] = useState<'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'>('Masuk')
  
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Input Mask Rupiah
  const formatToRupiah = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers) return ''
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(numbers))
    return formatted.replace('IDR', 'Rp').trim()
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setPriceInput(formatToRupiah(rawValue))
  }

  const getCleanPrice = (val: string) => {
    return Number(val.replace(/[^0-9]/g, '')) || 0
  }

  // Filter & Search
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'Semua' || o.status === statusFilter
    const matchesSearch =
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sofa_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.service_type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const openAddDialog = () => {
    setEditingOrder(null)
    setCustomerId(customers[0]?.id || '')
    setSofaType('')
    setServiceType('Cuci')
    setPriceInput('')
    setStatus('Masuk')
    setError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (order: Order) => {
    setEditingOrder(order)
    setCustomerId(order.customer_id)
    setSofaType(order.sofa_type)
    setServiceType(order.service_type)
    setPriceInput(formatToRupiah(order.estimated_price.toString()))
    setStatus(order.status)
    setError('')
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerId) {
      setError('Silakan pilih pelanggan.')
      return
    }

    if (!sofaType.trim()) {
      setError('Jenis sofa wajib diisi.')
      return
    }

    const numericPrice = getCleanPrice(priceInput)
    if (numericPrice <= 0) {
      setError('Estimasi harga harus lebih besar dari Rp 0.')
      return
    }

    startTransition(async () => {
      const payload = {
        customer_id: customerId,
        sofa_type: sofaType,
        service_type: serviceType,
        estimated_price: numericPrice,
        status,
      }

      if (editingOrder) {
        // Update
        const res = await updateOrder(editingOrder.id, payload)
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          const updated = {
            ...res.data[0],
            customer: customers.find((c) => c.id === customerId)!,
          } as Order
          setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)))
          setIsDialogOpen(false)
        }
      } else {
        // Create
        const res = await createOrder(payload)
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          const created = {
            ...res.data[0],
            customer: customers.find((c) => c.id === customerId)!,
          } as Order
          setOrders((prev) => [created, ...prev])
          setIsDialogOpen(false)
        }
      }
    })
  }

  const handleQuickStatusUpdate = (orderId: string, newStatus: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil') => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus)
      if (res.error) {
        alert(res.error)
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      startTransition(async () => {
        const res = await deleteOrder(id)
        if (res.error) {
          alert(res.error)
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== id))
        }
      })
    }
  }

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Masuk':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/50'
      case 'Dikerjakan':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/50'
      case 'Selesai':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
      case 'Diambil':
        return 'bg-purple-950/40 text-purple-400 border-purple-900/50'
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Daftar Pesanan</h1>
          <p className="text-sm text-neutral-400">Kelola status servis sofa, cuci, dan reupholstery.</p>
        </div>
        <Button
          onClick={openAddDialog}
          disabled={customers.length === 0}
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Tambah Pesanan
        </Button>
      </div>

      {customers.length === 0 && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-sm text-amber-300">
          Anda perlu menambahkan minimal 1 pelanggan di halaman <strong>Pelanggan</strong> sebelum dapat membuat pesanan baru.
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Cari nama pelanggan, jenis sofa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500 focus-visible:ring-emerald-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'Semua')}>
          <SelectTrigger className="w-full sm:w-[180px] border-neutral-800 bg-neutral-900 text-white focus:ring-emerald-500">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
            <SelectItem value="Semua">Semua Status</SelectItem>
            <SelectItem value="Masuk">Masuk</SelectItem>
            <SelectItem value="Dikerjakan">Dikerjakan</SelectItem>
            <SelectItem value="Selesai">Selesai</SelectItem>
            <SelectItem value="Diambil">Diambil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="border-neutral-800 bg-neutral-900 text-white hover:border-neutral-700 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                  <Link href={`/orders/${order.id}`} className="hover:underline hover:text-emerald-400 transition-colors">
                    <CardTitle className="text-lg font-bold pt-1">{order.sofa_type}</CardTitle>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(order)}
                    className="text-neutral-400 hover:text-white h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(order.id)}
                    className="text-red-400 hover:text-red-350 hover:bg-red-950/20 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-300 pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-white">{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Layanan: <strong className="text-white">{order.service_type}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-400 font-semibold">
                    {formatToRupiah(order.estimated_price.toString())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-neutral-400 text-xs">
                    Masuk: {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>

                {/* Quick Status Control for Mobile */}
                <div className="border-t border-neutral-800 pt-3 flex flex-wrap gap-2 justify-between items-center">
                  <span className="text-xs text-neutral-500">Ubah Status:</span>
                  <div className="flex gap-1">
                    {(['Masuk', 'Dikerjakan', 'Selesai', 'Diambil'] as const).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={order.status === st ? 'default' : 'outline'}
                        onClick={() => handleQuickStatusUpdate(order.id, st)}
                        className={`h-7 px-2 text-[10px] ${
                          order.status === st
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-500">
            Tidak ada pesanan ditemukan.
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-neutral-800 bg-neutral-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-500">
              {editingOrder ? 'Ubah Pesanan' : 'Tambah Pesanan Baru'}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Masukkan detail pekerjaan servis sofa di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="customer">Pelanggan</Label>
              <Select value={customerId} onValueChange={(val) => setCustomerId(val || '')}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white focus:ring-emerald-500">
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sofaType">Jenis Sofa</Label>
              <Input
                id="sofaType"
                value={sofaType}
                onChange={(e) => setSofaType(e.target.value)}
                placeholder="Contoh: Sofa Bed 3 Seater, Sofa Kulit L"
                required
                className="border-neutral-700 bg-neutral-800 text-white focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Jenis Layanan</Label>
              <Select value={serviceType} onValueChange={(val) => setServiceType(val || 'Cuci')}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white focus:ring-emerald-500">
                  <SelectValue placeholder="Pilih Layanan" />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectItem value="Cuci">Cuci</SelectItem>
                  <SelectItem value="Reupholstery">Reupholstery (Ganti Kulit/Kain)</SelectItem>
                  <SelectItem value="Perbaikan">Perbaikan Rangka/Busa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Estimasi Harga</Label>
              <Input
                id="price"
                value={priceInput}
                onChange={handlePriceChange}
                placeholder="Contoh: Rp 1.500.000"
                required
                className="border-neutral-700 bg-neutral-800 text-white focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Awal</Label>
              <Select value={status} onValueChange={(val) => setStatus((val || 'Masuk') as any)}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white focus:ring-emerald-500">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectItem value="Masuk">Masuk</SelectItem>
                  <SelectItem value="Dikerjakan">Dikerjakan</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Diambil">Diambil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-emerald-800"
              >
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
