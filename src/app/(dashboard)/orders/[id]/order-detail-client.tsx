'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, Send, Trash2, Calendar, User, Hammer, CircleDollarSign, Clock, MapPin, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageUploader } from '../components/image-uploader'
import { deleteImage } from '../actions-media'
import { getOrderStatus, getStatusColor } from '@/lib/order-status'
import { toWhatsAppNumber, toTelHref } from '@/lib/phone'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
}

type OrderImage = {
  id: string
  order_id: string
  image_url: string
  type: 'before' | 'after'
  created_at: string
}

type Order = {
  id: string
  customer_id: string
  sofa_type: string
  service_type: string
  price: number
  dp_amount: number | null
  dp_paid_at: string | null
  paid_amount: number | null
  paid_at: string | null
  created_at: string
  updated_at: string
  customer: Customer
  images: OrderImage[]
}

export function OrderDetailClient({ order: initialOrder }: { order: Order }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order>(initialOrder)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const status = getOrderStatus(order)
  const colors = getStatusColor(status)

  const beforeImages = order.images.filter((img) => img.type === 'before')
  const afterImages = order.images.filter((img) => img.type === 'after')

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp')
  }

  // Generate WhatsApp Link
  const getWhatsAppLink = (phone: string, name: string, sofa: string) => {
    const clean = toWhatsAppNumber(phone)
    const message = encodeURIComponent(
      `Halo Bapak/Ibu ${name}, kami dari Akakia Manager ingin menginfokan bahwa pesanan servis Anda (${sofa}) saat ini berstatus: *${status}*.`
    )
    return `https://wa.me/${clean}?text=${message}`
  }

  // Refresh data setelah upload
  const handleUploadSuccess = () => {
    router.refresh()
    // Karena Next.js server-side, panggil fetch client-side ringan atau biarkan router.refresh() memperbarui prop
    // Untuk reaktivitas instan, kita bisa melakukan refresh.
    // Kita juga bisa reload window atau membiarkan server component merender ulang.
    setTimeout(() => {
      window.location.reload() // Paling andal untuk mereload data gambar baru dari database
    }, 1000)
  }

  const handleDeleteImage = (imageId: string, imageUrl: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      // Dapatkan path relatif file dari URL public Supabase
      // URL: https://xxx.supabase.co/storage/v1/object/public/order-images/orderId/fileName.jpg
      // Path relatif yang dibutuhkan remove(): orderId/fileName.jpg
      const urlParts = imageUrl.split('/order-images/')
      if (urlParts.length < 2) return
      const storagePath = urlParts[1]

      startTransition(async () => {
        const res = await deleteImage(imageId, storagePath, order.id)
        if (res.error) {
          alert(res.error)
        } else {
          setOrder((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img.id !== imageId),
          }))
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Detail Pesanan</h1>
          <p className="text-xs text-muted-foreground">ID: {order.id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Info Utama */}
      <Card className="border-border bg-card text-foreground glow-primary-hover">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <span className="text-xs text-muted-foreground block">Jenis Sofa</span>
            <CardTitle className="text-xl font-bold text-foreground">{order.sofa_type}</CardTitle>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {status}
          </span>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-sm">
          {/* Detail Pelanggan */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Pelanggan</span>
              </div>
              <p className="font-semibold text-foreground pl-6">{order.customer.name}</p>
              <p className="text-muted-foreground pl-6">{order.customer.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Alamat Pelanggan</span>
              </div>
              <p className="text-foreground pl-6">{order.customer.address || 'Alamat tidak diisi'}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Detail Layanan */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Hammer className="h-3.5 w-3.5 text-primary" /> Layanan
              </span>
              <p className="font-semibold">{order.service_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CircleDollarSign className="h-3.5 w-3.5 text-primary" /> Harga
              </span>
              <p className="font-bold text-positive font-mono">{formatRupiah(order.price)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Tanggal Masuk
              </span>
              <p className="text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Hubungi Pelanggan */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={toTelHref(order.customer.phone)} className="flex-1">
              <Button variant="outline" className="w-full border-border bg-card text-foreground hover:bg-muted gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Hubungi via Telepon
              </Button>
            </a>
            <a
              href={getWhatsAppLink(order.customer.phone, order.customer.name, order.sofa_type)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <Send className="h-4 w-4" />
                Hubungi via WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Galeri Gambar */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* BEFORE PHOTOS */}
        <Card className="border-border bg-card text-foreground glow-primary-hover">
          <CardHeader>
            <CardTitle className="text-md font-bold flex items-center justify-between">
              <span>Foto Sebelum (Before)</span>
              <span className="text-xs text-muted-foreground font-normal">{beforeImages.length} Foto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {beforeImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {beforeImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-border bg-card">
                    <img
                      src={img.image_url}
                      alt="Before Service"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setPreviewImageUrl(img.image_url)}
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteImage(img.id, img.image_url)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                Belum ada foto dokumentasi sebelum servis.
              </div>
            )}
            <ImageUploader orderId={order.id} type="before" onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        {/* AFTER PHOTOS */}
        <Card className="border-border bg-card text-foreground glow-primary-hover">
          <CardHeader>
            <CardTitle className="text-md font-bold flex items-center justify-between">
              <span>Foto Sesudah (After)</span>
              <span className="text-xs text-muted-foreground font-normal">{afterImages.length} Foto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {afterImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {afterImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-border bg-card">
                    <img
                      src={img.image_url}
                      alt="After Service"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setPreviewImageUrl(img.image_url)}
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteImage(img.id, img.image_url)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                Belum ada foto dokumentasi sesudah servis.
              </div>
            )}
            <ImageUploader orderId={order.id} type="after" onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      </div>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="border-border bg-card text-foreground max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border flex flex-row justify-between items-center">
            <DialogTitle className="text-sm font-semibold">Pratinjau Foto</DialogTitle>
          </DialogHeader>
          <div className="relative w-full max-h-[80vh] flex items-center justify-center bg-black">
            {previewImageUrl && (
              <img
                src={previewImageUrl}
                alt="Full Preview"
                className="object-contain w-full max-h-[75vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
