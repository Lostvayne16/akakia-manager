'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Edit2, Trash2, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createCustomer, updateCustomer, deleteCustomer } from './actions'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  created_at: string
}

export function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  )

  const openAddDialog = () => {
    setEditingCustomer(null)
    setName('')
    setPhone('')
    setAddress('')
    setError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setName(customer.name)
    setPhone(customer.phone)
    setAddress(customer.address || '')
    setError('')
    setIsDialogOpen(true)
  }

  const validatePhone = (num: string) => {
    // Validasi nomor HP Indonesia: harus dimulai dengan 08 atau +628 dan panjang 9-13 digit setelah kode
    const regex = /^(08|\+628)\d{7,11}$/
    return regex.test(num)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama pelanggan wajib diisi.')
      return
    }

    if (!validatePhone(phone)) {
      setError('Nomor HP tidak valid. Harus dimulai dengan 08 atau +628 dan terdiri dari 9-13 digit.')
      return
    }

    startTransition(async () => {
      if (editingCustomer) {
        // Edit
        const res = await updateCustomer(editingCustomer.id, { name, phone, address })
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          setCustomers((prev) =>
            prev.map((c) => (c.id === editingCustomer.id ? (res.data![0] as Customer) : c))
          )
          setIsDialogOpen(false)
        }
      } else {
        // Add
        const res = await createCustomer({ name, phone, address })
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          setCustomers((prev) => [res.data![0] as Customer, ...prev])
          setIsDialogOpen(false)
        }
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini? Semua pesanan pelanggan ini juga akan terhapus.')) {
      startTransition(async () => {
        const res = await deleteCustomer(id)
        if (res.error) {
          alert(res.error)
        } else {
          setCustomers((prev) => prev.filter((c) => c.id !== id))
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Pelanggan</h1>
          <p className="text-sm text-muted-foreground">Kelola informasi kontak pelanggan jasa servis sofa.</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau nomor HP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Customers List (Cards for Mobile-First) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <span className="text-lg font-semibold block text-foreground">{customer.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(customer)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(customer.id)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground pb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href={`tel:${customer.phone}`} className="hover:underline hover:text-primary transition-colors">{customer.phone}</a>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Tidak ada pelanggan ditemukan.
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {editingCustomer ? 'Ubah Pelanggan' : 'Tambah Pelanggan Baru'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Isi data lengkap pelanggan di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="bg-input border-border text-foreground focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                required
                className="bg-input border-border text-foreground focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat (Opsional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Sudirman No. 25"
                className="bg-input border-border text-foreground focus-visible:ring-ring"
              />
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
