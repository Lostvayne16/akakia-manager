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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Dikerjakan':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'Selesai':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Diambil':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Pesanan</h1>
          <p className="text-sm text-muted-foreground">Kelola status servis sofa, cuci, dan reupholstery.</p>
        </div>
        <Button
          onClick={openAddDialog}
          disabled={customers.length === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Tambah Pesanan
        </Button>
      </div>

      {customers.length === 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
          Anda perlu menambahkan minimal 1 pelanggan di halaman <strong>Pelanggan</strong> sebelum dapat membuat pesanan baru.
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama pelanggan, jenis sofa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'Semua')}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border text-foreground focus:ring-ring">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
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
            <Card key={order.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                  <Link href={`/orders/${order.id}`} className="hover:underline hover:text-primary transition-colors">
                    <CardTitle className="text-lg font-bold pt-1 text-foreground">{order.sofa_type}</CardTitle>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(order)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(order.id)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-foreground">{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Layanan: <strong className="text-foreground">{order.service_type}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-primary font-semibold">
                    {formatToRupiah(order.estimated_price.toString())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground text-xs">
                    Masuk: {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>

                {/* Quick Status Control for Mobile */}
                <div className="border-t border-border pt-3 flex flex-wrap gap-2 justify-between items-center">
                  <span className="text-xs text-muted-foreground">Ubah Status:</span>
                  <div className="flex gap-1">
                    {(['Masuk', 'Dikerjakan', 'Selesai', 'Diambil'] as const).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={order.status === st ? 'default' : 'outline'}
                        onClick={() => handleQuickStatusUpdate(order.id, st)}
                        className={`h-7 px-2 text-[10px] ${
                          order.status === st
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
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
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Tidak ada pesanan ditemukan.
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {editingOrder ? 'Ubah Pesanan' : 'Tambah Pesanan Baru'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Masukkan detail pekerjaan servis sofa di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="customer">Pelanggan</Label>
              <Select value={customerId} onValueChange={(val) => setCustomerId(val || '')}>
                <SelectTrigger className="bg-input border-border text-foreground focus:ring-ring">
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
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
                className="bg-input border-border text-foreground focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Jenis Layanan</Label>
              <Select value={serviceType} onValueChange={(val) => setServiceType(val || 'Cuci')}>
                <SelectTrigger className="bg-input border-border text-foreground focus:ring-ring">
                  <SelectValue placeholder="Pilih Layanan" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
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
                className="bg-input border-border text-foreground focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Awal</Label>
              <Select value={status} onValueChange={(val) => setStatus((val || 'Masuk') as any)}>
                <SelectTrigger className="bg-input border-border text-foreground focus:ring-ring">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
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
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
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
