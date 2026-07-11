---
name: pwa-nextjs
description: Build Progressive Web Apps on Next.js 15 App Router. Use when adding manifest, service worker, install prompt, offline cache, or any PWA capability. Covers Serwist (preferred 2026), native manifest.ts, beforeinstallprompt handling, HTTPS requirements, and offline fallback.
---

# PWA on Next.js 15+ App Router (2026 best practice)

## Stack pilihan

- **Manifest**: native `app/manifest.ts` (App Router auto-links)
- **Service Worker**: **Serwist** (`@serwist/next`) — successor `next-pwa`
- **Install prompt**: `beforeinstallprompt` event di Client Component
- **HTTPS**: wajib (kecuali localhost)

Hindari `next-pwa` (kurang maintained).

## 1. Web App Manifest

Buat `app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'App Name',
    short_name: 'AppName',
    description: 'App description',
    start_url: '/',
    display: 'standalone', // PWA immersive — no browser chrome
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

Next.js otomatis link ke `<head>`.

## 2. Service Worker (Serwist)

Install:
```bash
npm install @serwist/next serwist
```

`next.config.ts`:
```typescript
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist({})
```

`app/sw.ts`:
```typescript
import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      { url: '/offline', matcher: ({ request }) => request.destination === 'document' },
    ],
  },
})

serwist.addEventListeners()
```

## 3. Install Prompt Handler

`components/pwa-install-prompt.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <button onClick={handleInstall}>Install App</button>
  )
}
```

`beforeinstallprompt` fires hanya kalau:
- HTTPS aktif
- Manifest valid
- Service worker registered

Jangan force-trigger. Tampilkan tombol subtle saat event fired.

## 4. Offline Fallback Page

`app/offline/page.tsx`:
```tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1>Anda sedang offline</h1>
        <p>Aplikasi tetap dapat menampilkan data yang sudah pernah dimuat.</p>
      </div>
    </div>
  )
}
```

## 5. Service Worker Registration

Di root layout client component atau useEffect di komponen utama:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js')
  }
}, [])
```

## Caching strategy

| Asset | Strategy |
|---|---|
| Static (JS, CSS, images, fonts) | `cache-first` (via Serwist `defaultCache`) |
| HTML pages | `stale-while-revalidate` |
| API responses | Tergantung use case — biasanya `network-first` dengan fallback ke cache |
| Offline navigation | Fallback ke `/offline` |

## Things to avoid

- `next-pwa` — abandoned, pakai Serwist
- Hardcoded warna di manifest — pakai CSS variables atau design system
- Force install prompt — tunggu event natural
- Lupa `skipWaiting` + `clientsClaim` — user stuck di versi lama
- Cache `sw.js` di service worker itu sendiri — skip via `Cache-Control: no-cache`
- Test PWA tanpa Chrome DevTools "Application" tab + "Offline" checkbox

## PWA immersive considerations (iOS)

- `viewport-fit=cover` di meta
- Safe-area inset untuk notch/dynamic island
- Status bar theme color
- `display: standalone` (bukan `fullscreen`)

## Verification checklist

- [ ] `app/manifest.ts` valid (test di Chrome DevTools)
- [ ] Service worker registered (lihat di `chrome://serviceworker-internals`)
- [ ] HTTPS aktif di production
- [ ] Lighthouse PWA audit pass
- [ ] Offline mode: buka DevTools → Application → Service Workers → Offline
- [ ] Install prompt muncul (jika criteria terpenuhi)

## References

- Serwist docs: https://serwist.pages.dev/
- Next.js manifest: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
- Web.dev PWA checklist: https://web.dev/pwa-checklist/
