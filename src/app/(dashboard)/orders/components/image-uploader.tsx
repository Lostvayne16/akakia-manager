'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { saveImageReference } from '../actions-media'

type ImageUploaderProps = {
  orderId: string
  type: 'before' | 'after'
  onUploadSuccess: () => void
}

export function ImageUploader({ orderId, type, onUploadSuccess }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Kompresi Gambar di Sisi Client menggunakan Canvas API
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200 // Batas resolusi maksimal untuk kecepatan upload
          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Gagal melakukan kompresi canvas ke blob.'))
              }
            },
            'image/jpeg',
            0.8 // Kualitas JPEG 80% (keseimbangan ukuran file dan ketajaman gambar)
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    try {
      // 1. Kompresi Gambar
      const compressedBlob = await compressImage(file)

      // 2. Tentukan nama berkas dan path penyimpanan
      const fileExt = 'jpg'
      const fileName = `${type}_${Date.now()}.${fileExt}`
      const filePath = `${orderId}/${fileName}`

      // 3. Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('order-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // 4. Dapatkan Public URL
      const { data: urlData } = supabase.storage
        .from('order-images')
        .getPublicUrl(filePath)

      const imageUrl = urlData.publicUrl

      // 5. Simpan referensi ke database PostgreSQL
      const res = await saveImageReference(orderId, imageUrl, type)
      if (res.error) {
        throw new Error(res.error)
      }

      // 6. Callback sukses
      onUploadSuccess()
    } catch (err: any) {
      alert(`Gagal mengunggah foto: ${err.message || err}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Reset input file
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 py-5 font-semibold"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Mengunggah...</span>
          </>
        ) : (
          <>
            <Camera className="h-5 w-5" />
            <span>Ambil Foto {type === 'before' ? 'Before' : 'After'}</span>
          </>
        )}
      </Button>
    </div>
  )
}
