# Akakia Manager

> Sofa Service Management Application

Aplikasi manajemen operasional jasa servis sofa.

## Features

- **Pengaturan Akun** – Edit nama dan email
- **Notifikasi** – Toggle notifikasi email
- **Tema** – Dark / Light theme
- **Keamanan** – Session management
- **Fitur Lengkap** – Manajemen pesanan sofa, dashboard 📊

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn UI
**Backend:** Supabase (PostgreSQL + Auth + Realtime)
**Auth:** Google OAuth via Supabase
**Hosting:** Vercel

## Development

```bash
# Clone & setup
cp .env.example .env.local

# Install dependencies (Python dependencies)
# (Project primarily uses Node.js, so npm/yarn)
npm install

# Run development server
npm run dev
# Visit http://localhost:3000
```

## Building & Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production env vars are set in Vercel Dashboard → Environment Variables.

## Project Structure

```
/src
  /app                     # Next.js pages & layouts
  /components              # UI components
  /hooks                   # custom hooks
  /lib                     # utilities & auth
  /types                   # TypeScript definitions
  /utils                   # Supabase client & helpers

/contract
```

## Project Timeline

**Phase 1 (Week 1–2)** – Database & Auth setup
  - Migrations
  - RLS policies
  - Google OAuth integration

**Phase 2 (Week 3–4)** – Core features
  - Form management (orders, customers)
  - Dashboard & charts
  - Email notifications

**Phase 3 (Week 5–6)** – UI polish
  - Responsive design
  - Theme switching
  - Settings page

## Key Screenshots

1. **Dashboard Overview**
   - Statistik orders, revenue, customer
   - Chart visualisasi data

2. **Order Management**
   - Form pembuatan & tracking pesanan sofa
   - List order + status CRUD

3. **Authentication**
   - Google OAuth login
   - Email/password fallback

4. **Settings**
   - Edit profil
   - Toggle notifications
   - Theme selection

## Getting Started

1. Clone this repo
2. Install dependencies
3. Configure `.env.local`
4. `npm run dev`
5. Explore the dashboard!

For detailed documentation, check the `/docs` folder (if available) or open an issue for specific questions.

---

*Built with ❤️ using Next.js & Supabase*