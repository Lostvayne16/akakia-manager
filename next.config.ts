import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [
    { url: '/offline.html', revision: '1' },
  ],
})

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    // Client Router Cache untuk halaman dinamis (semua page di sini query
    // Supabase live per-request, jadi default Next.js men-treat cache-nya
    // basi seketika — tiap navigasi termasuk tombol Back selalu re-fetch
    // dari server). Aman dinaikkan karena semua mutasi (create/update/
    // delete) sudah manggil revalidatePath() eksplisit, jadi cache tetap
    // otomatis kebuang begitu ada perubahan data, terlepas dari nilai ini.
    staleTimes: {
      dynamic: 30,
    },
  },
}

export default withSerwist(nextConfig)
