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
  estimated_price: number
  status: 'Masuk' | 'Dikerjakan' | 'Selesai' | 'Diambil'
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
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    }
    const message = encodeURIComponent(
      `Halo Bapak/Ibu ${name}, kami dari Lostvayne Sofa Service ingin menginfokan bahwa pesanan servis Anda (${sofa}) saat ini berstatus: *${order.status}*.`
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Detail Pesanan</h1>
          <p className="text-xs text-neutral-400">ID: {order.id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Info Utama */}
      <Card className="border-neutral-800 bg-neutral-900 text-white">
        <CardHeader className="pb-3 border-b border-neutral-850 flex flex-row items-center justify-between space-y-0">
          <div>
            <span className="text-xs text-neutral-400 block">Jenis Sofa</span>
            <CardTitle className="text-xl font-bold text-white">{order.sofa_type}</CardTitle>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(order.status)}`}>
            {order.status}
          </span>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-sm">
          {/* Detail Pelanggan */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <User className="h-4 w-4 text-emerald-500" />
                <span>Pelanggan</span>
              </div>
              <p className="font-semibold text-white pl-6">{order.customer.name}</p>
              <p className="text-neutral-400 pl-6">{order.customer.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Alamat Pelanggan</span>
              </div>
              <p className="text-white pl-6">{order.customer.address || 'Alamat tidak diisi'}</p>
            </div>
          </div>

          <hr className="border-neutral-800" />

          {/* Detail Layanan */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Hammer className="h-3.5 w-3.5 text-emerald-500" /> Layanan
              </span>
              <p className="font-semibold">{order.service_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" /> Estimasi Harga
              </span>
              <p className="font-bold text-emerald-400">{formatRupiah(order.estimated_price)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Tanggal Masuk
              </span>
              <p className="text-neutral-300">
                {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          <hr className="border-neutral-800" />

          {/* Hubungi Pelanggan */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={`tel:${order.customer.phone}`} className="flex-1">
              <Button variant="outline" className="w-full border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-800 gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
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
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader>
            <CardTitle className="text-md font-bold flex items-center justify-between">
              <span>Foto Sebelum (Before)</span>
              <span className="text-xs text-neutral-400 font-normal">{beforeImages.length} Foto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {beforeImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {beforeImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-neutral-800 bg-neutral-950">
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Belum ada foto dokumentasi sebelum servis.
              </div>
            )}
            <ImageUploader orderId={order.id} type="before" onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        {/* AFTER PHOTOS */}
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader>
            <CardTitle className="text-md font-bold flex items-center justify-between">
              <span>Foto Sesudah (After)</span>
              <span className="text-xs text-neutral-400 font-normal">{afterImages.length} Foto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {afterImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {afterImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-neutral-800 bg-neutral-950">
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Belum ada foto dokumentasi sesudah servis.
              </div>
            )}
            <ImageUploader orderId={order.id} type="after" onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      </div>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="border-neutral-850 bg-neutral-950 text-white max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-neutral-900 flex flex-row justify-between items-center">
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
