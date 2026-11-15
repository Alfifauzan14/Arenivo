# 📋 PRD — Arenivo (Production Version)

> **Status**: Live on Vercel  •  **Last Updated**: Nov 2026  •  **Version**: 2.0
> **Frontend**: `https://arenivo-frontend-2f6kd5r49-alfifauzan14s-projects.vercel.app`
> **Backend**: `https://arenivo-backend-ccagqxss4-alfifauzan14s-projects.vercel.app`

---

## 1. PRODUCT OVERVIEW

**Arenivo** — *Satu Aplikasi, Banyak Arena*

Platform booking lapangan olahraga (futsal, mini soccer, sepak bola) yang menghubungkan **penyewa** dengan **mitra (pemilik venue)** melalui marketplace real-time dengan pembayaran instan (Midtrans), e-tiket QR, dan sistem payout otomatis.

### 1.1 Core Value Proposition

| Actor | Problem | Solution |
|-------|---------|----------|
| **Penyewa** | Cari lapangan manual, tidak tahu ketersediaan real-time, bayar transfer manual | Cari & filter venue → lihat slot real-time → booking 30 detik → bayar QRIS/VA → e-tiket QR instan |
| **Mitra** | Kelola jadwal manual (WA/Excel), double booking, payout manual, tidak punya brand digital | Dashboard terpusat: terima pesanan, kelola jadwal/harga, gate scanner QR, keuangan real-time, payout 1-klik |
| **Admin** | Tidak ada visibility platform-wide, verifikasi mitra manual, komisi manual | Super admin panel: transaksi global, verifikasi mitra, master data, audit log, komisi otomatis |

---

## 2. TECH STACK (Production)

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React 18 + Vite + TypeScript | 18.3 / 5.7 |
| **Backend** | Next.js 15 (App Router) + TypeScript | 15.x |
| **Database** | Supabase (PostgreSQL 16) + RLS | — |
| **Auth** | Supabase Auth (Email/Password + Email Confirmation) | — |
| **Realtime** | Pusher Channels | 8.x |
| **Payments** | Midtrans Snap (Sandbox) | — |
| **Push Notif** | Firebase Cloud Messaging (FCM) | — |
| **Email** | Brevo (Transactional) | — |
| **Storage** | Supabase Storage (Venue photos, Documents) | — |
| **Hosting** | Vercel (Hobby) — 2 projects | — |
| **Monitoring** | Sentry (configured, DSN optional) | — |
| **CI/CD** | GitHub → Vercel Auto Deploy (main branch) | — |

---

## 3. USER ROLES & PERMISSIONS

| Role | Auth | Key Capabilities |
|------|------|------------------|
| **Penyewa** | Email confirmed | Browse venues, book slots, pay, view e-ticket QR, manage profile, favorites, notifications |
| **Mitra** | Email confirmed + **Verified (`disetujui`)** | Dashboard metrics, manage orders, venue/field CRUD, promo CRUD, gate scanner, financial (balance, mutations, payout), profile |
| **Admin** | Email confirmed | Platform dashboard, all transactions, payout approval, venue management, mitra verification, master data CRUD, user management, audit log |

---

## 4. FEATURE SPECIFICATIONS (Production Verified)

### 4.1 Penyewa Flow

| Feature | Spec | Status |
|---------|------|--------|
| **Landing Page** | Hero search → value props → venue carousel → CTA | ✅ Live |
| **Explore Venues (`/venues`)** | Left filter drawer (city, price, rating, facilities), grid 1/2/3/4 col responsive, infinite scroll ready | ✅ Live |
| **Venue Detail** | Image carousel, description/facilities/rules tabs, weekly calendar, **slot matrix real-time** (2 fields), sticky CTA | ✅ Live |
| **Booking Flow** | Select slot → confirm detail → checkout (promo, fee breakdown) → Midtrans Snap → redirect | ✅ Live |
| **Checkout** | Stepper (Detail → Pembayaran → Selesai), promo code validation, service fee Rp 5k, commission 10% | ✅ Live |
| **Payment (Midtrans Sandbox)** | QRIS, VA (BCA/BNI/BRI/Mandiri), Gopay, Shopeepay — test card `4811 1111 1111 1111` | ✅ Configured |
| **E-Ticket** | QR code (booking code + token), status badge, scan history, valid 30 min before play | ✅ Live |
| **My Orders (`/pesanan`)** | 4 tabs: Aktif / Menunggu Bayar / Selesai / Batal — each card: venue, field, time, status, actions | ✅ Live |
| **Profile** | Avatar upload (Supabase Storage), edit name/WA/email, **change password**, push notification toggle, logout | ✅ Live |
| **Favorites** | Heart icon on venue cards → `/favorites` grid | ✅ Live |
| **Notifications** | In-app list (booking, promo, system), read/unread, deep link | ✅ Live |
| **Email Confirmation UX** | Toast with **Gmail Spam/Junk folder hint** after register/resend | ✅ Live |

### 4.2 Mitra Flow

| Feature | Spec | Status |
|---------|------|--------|
| **Dashboard (`/mitra`)** | 4 metric cards (Pesanan Hari Ini, Okupansi, Saldo, Siap Dicairkan), mini occupancy chart, 5 recent bookings | ✅ Live |
| **Pesanan Masuk (`/mitra/pesanan`)** | Venue selector, search, status filter, paginated table (Kode, Penyewa, Lapangan, Jadwal, Total, Status, Aksi: Detail/Terima/Tolak) | ✅ Live |
| **Keuangan (`/mitra/keuangan`)** | 3 balance cards (Total, Tersedia, Tertahan), mutasi table (search, date filter), payout history table, **Tarik Saldo** (min Rp 100k) | ✅ Live — **Saldo Rp 135k, Payout kosong** |
| **Venue CRUD (`/mitra/venues`)** | Add venue modal, venue cards (image, name, rating, location, field count), Edit → detail, Fields button | ✅ Live |
| **Field CRUD (`/mitra/venues/[id]/fields`)** | Add field (type, size, surface, base price, status), edit/delete per field | ✅ Live |
| **Promo CRUD (`/mitra/promos`)** | Create promo (code, fixed/percent, min spend, max discount, quota, date range), table with used count | ✅ Live |
| **Gate Scanner (`/mitra/scanner`)** | Camera access, scan QR → result modal (SAH / SUDAH DIPAKAI / EXPIRED / INVALID), scan history list | ✅ Live |
| **Profile (`/mitra/profile`)** | Business info, bank account (BCA/Mandiri/BNI/BRI), document upload (KTP/NIB), verification status badge | ✅ Live |

### 4.3 Admin Flow

| Feature | Spec | Status |
|---------|------|--------|
| **Login (`/admin`)** | Centered card, email/password, redirect to dashboard | ✅ Live |
| **Dashboard** | Platform metrics (GMV, orders, mitra, users), revenue chart, recent transactions, mitra applications queue | ✅ Live |
| **Transaksi (`/admin/transaksi`)** | Date range, status, search, table (Tanggal, Mitra, Venue, Penyewa, Nominal, Komisi, Status) | ✅ Live |
| **Payouts (`/admin/payouts`)** | Status filter, table (Tanggal, Mitra, Bank, Nominal, Status), actions: Approve/Reject/Detail | ✅ Live |
| **Venue Management** | All venues platform-wide, status toggle, view detail | ✅ Live |
| **Mitra Verification** | Table with verification status, approve/reject with notes, view documents | ✅ Live |
| **User Management** | Role badge, status toggle, view bookings | ✅ Live |
| **Master Data** | Tabs: Kota, Fasilitas, Jenis Lapangan — CRUD each | ✅ Live |
| **Audit Log** | Admin email, action, target, details, IP, timestamp | ✅ Live |

---

## 5. DATABASE STATE (Clean Production)

| Entity | Count | Details |
|--------|-------|---------|
| **auth.users** | 3 | `alfifauzan897@gmail.com` (penyewa), `mitra@arenivo.id` (mitra, verified), `admin@arenivo.id` (admin) — all email confirmed |
| **mitra_profiles** | 1 | Champion Arena Group — `disetujui`, bank BCA `8830192837` |
| **venues** | 1 | **Champion Futsal Arena Cilandak** (Jakarta Selatan) — aktif, rating 4.8 |
| **fields** | 2 | **Vinyl Taraflex A** (Rp 150k/jam), **Rumput Sintetis B** (Rp 175k/jam) |
| **bookings** | 2 | 1 `selesai` (FB-E51AB7), 1 `kedaluwarsa` (FB-C2QGWK) |
| **mitra_balance** | 1 | Total Rp 135k, Tersedia Rp 135k, Tertahan Rp 0 |
| **payouts** | 0 | Empty (clean) |
| **promos** | 2 | FUTSALASIK (Rp 25k fixed), WEEKENDSERU (10% max Rp 50k) |
| **reviews** | 1 | 5-star review from penyewa |

---

## 6. ENVIRONMENT VARIABLES (Vercel Encrypted)

### Frontend (10 vars — public keys safe for client)

```bash
VITE_SUPABASE_URL=https://vtfcigukjtmplgcihjgw.supabase.co
VITE_SUPABASE_ANON_KEY=*** (public anon key)
VITE_API_BASE_URL=https://arenivo-backend-ccagqxss4-alfifauzan14s-projects.vercel.app
VITE_MIDTRANS_CLIENT_KEY=*** (public client key)
VITE_PUSHER_KEY=621b58e6b023f0ef6b85
VITE_PUSHER_CLUSTER=ap1
VITE_FIREBASE_API_KEY=*** (public API key)
VITE_FIREBASE_AUTH_DOMAIN=arenivo-51e64.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=arenivo-51e64
VITE_FIREBASE_VAPID_KEY=*** (public VAPID key)
```

### Backend (20 vars — all encrypted in Vercel)

```bash
# Supabase
SUPABASE_URL=https://vtfcigukjtmplgcihjgw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=*** (encrypted in Vercel)
SUPABASE_JWT_SECRET=*** (encrypted in Vercel)

# Midtrans (Sandbox)
MIDTRANS_SERVER_KEY=*** (encrypted in Vercel)
MIDTRANS_CLIENT_KEY=*** (encrypted in Vercel)
MIDTRANS_MERCHANT_ID=M443624305
MIDTRANS_IS_PRODUCTION=false

# Pusher
PUSHER_APP_ID=2204912
PUSHER_KEY=621b58e6b023f0ef6b85
PUSHER_SECRET=*** (encrypted in Vercel)
PUSHER_CLUSTER=ap1

# Firebase
FIREBASE_PROJECT_ID=arenivo-51e64
FIREBASE_CLIENT_EMAIL=*** (encrypted in Vercel)
FIREBASE_PRIVATE_KEY=*** (encrypted in Vercel)

# Brevo Email
BREVO_API_KEY=*** (encrypted in Vercel)

# CORS
CORS_ORIGINS=https://arenivo-frontend-2f6kd5r49-alfifauzan14s-projects.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Sentry (optional)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
```

---

## 7. MIDTRANS SANDBOX CONFIGURATION

**Dashboard**: `https://dashboard.sandbox.midtrans.com` → Settings → Configuration

| Field | Value |
|-------|-------|
| **Payment Notification URL** | `https://arenivo-backend-ccagqxss4-alfifauzan14s-projects.vercel.app/api/webhooks/midtrans` |
| **Finish Redirect URL** | `https://arenivo-frontend-2f6kd5r49-alfifauzan14s-projects.vercel.app/payment/finish` |
| **Unfinish Redirect URL** | `https://arenivo-frontend-2f6kd5r49-alfifauzan14s-projects.vercel.app/payment/unfinish` |

**Test Card**: `4811 1111 1111 1111` | `01/25` | `123`

---

## 8. API ENDPOINTS (Backend)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/venues` | Public | List venues with filters |
| GET | `/api/venues/[slug]` | Public | Venue detail + slots |
| POST | `/api/bookings` | Penyewa | Create booking (lock slot 10 min) |
| GET | `/api/bookings` | Penyewa | My bookings (tabbed) |
| GET | `/api/bookings/[id]` | Penyewa/Mitra | Booking detail + e-ticket |
| POST | `/api/payments/midtrans/snap` | Penyewa | Get Snap token |
| POST | `/api/webhooks/midtrans` | Public (Midtrans) | Payment notification handler |
| GET | `/api/mitra/dashboard` | Mitra | Metrics + recent |
| GET | `/api/mitra/bookings` | Mitra | Incoming orders |
| GET | `/api/mitra/balance` | Mitra | Balance + mutations + payouts |
| POST | `/api/mitra/payout` | Mitra | Request payout |
| POST | `/api/mitra/venues` | Mitra | Create venue |
| PUT | `/api/mitra/venues/[id]` | Mitra | Update venue |
| POST | `/api/mitra/venues/[id]/fields` | Mitra | Create field |
| POST | `/api/mitra/promos` | Mitra | Create promo |
| POST | `/api/scanner/validate` | Mitra | Validate QR ticket |
| GET | `/admin/*` | Admin | All admin endpoints |

---

## 9. REALTIME & NOTIFICATIONS

| Channel | Event | Payload | Consumers |
|---------|-------|---------|-----------|
| `venue-{venueId}` | `slot:update` | `{ fieldId, date, slots[] }` | Venue detail page |
| `booking-{bookingId}` | `booking:status` | `{ status, paymentStatus }` | Pesanan page, Mitra dashboard |
| `mitra-{mitraId}` | `order:new` | `{ booking }` | Mitra dashboard (toast + refresh) |
| `user-{userId}` | `notification:new` | `{ notification }` | Penyewa header bell |
| `admin` | `mitra:verification` | `{ mitraId, status }` | Admin dashboard |

**Pusher App**: `2204912` (Cluster `ap1`)

**Firebase FCM**: Project `arenivo-51e64` — VAPID key in env → Push notification on booking confirmation, payment success, promo.

---

## 10. SECURITY & COMPLIANCE

| Measure | Implementation |
|---------|----------------|
| **Auth** | Supabase Auth (JWT), email confirmation required |
| **RLS** | All tables: policies per role (penyewa/mitra/admin) |
| **CORS** | Whitelist: production frontend only |
| **Rate Limiting** | In-memory: auth endpoints 10 req/min, bookings 30 req/min |
| **Secrets** | All in Vercel Encrypted Env (never in repo) |
| **Webhook Verify** | Midtrans signature verification (SHA512) |
| **Input Validation** | Zod schemas on all API routes |
| **File Upload** | Supabase Storage: signed URLs, 5MB max, image only |
| **HTTPS** | Vercel managed TLS |

---

## 11. PERFORMANCE BUDGET (Lighthouse)

| Metric | Target | Actual |
|--------|--------|--------|
| LCP | < 2.5s | ~1.8s |
| INP | < 100ms | ~45ms |
| CLS | < 0.1 | ~0.02 |
| TTI | < 3.5s | ~2.2s |
| JS Bundle (gz) | < 200KB | ~180KB |
| CSS Bundle (gz) | < 30KB | ~21KB |

**Optimizations**: Route code-splitting, dynamic imports (Scanner, Charts), Unsplash auto-format, SW cache-first static / network-first API.

---

## 12. PWA

- **Manifest**: `standalone`, theme `#ff6b2e`, icons 192/512 maskable
- **Shortcuts**: Cari Lapangan (`/venues`), Pesanan Saya (`/pesanan`)
- **Service Worker**: Workbox — precache static, runtime cache API
- **Push**: FCM via VAPID

---

## 13. DEMO ACCOUNTS (Production)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Penyewa | `alfifauzan897@gmail.com` | `Arenivo123!` | 2 bookings (1 selesai, 1 kedaluwarsa) |
| Mitra | `mitra@arenivo.id` | `Arenivo123!` | Verified, 1 venue 2 fields, saldo Rp 135k |
| Admin | `admin@arenivo.id` | `Arenivo123!` | Full access |

---

## 14. KNOWN LIMITATIONS / FUTURE WORK

| Area | Current | Future |
|------|---------|--------|
| **Rate Limiter** | In-memory (single instance) | Redis cluster for multi-instance scaling |
| **Sentry** | Configured, DSN not set | Enable DSN for error tracking |
| **Custom Domain** | Vercel subdomains | Add `arenivo.id` → update CORS |
| **Midtrans** | Sandbox only | Production keys when go-live |
| **Search** | Client-side filter | PostgreSQL full-text / Meilisearch |
| **Analytics** | None | Vercel Analytics / PostHog |
| **Multi-city** | 5 cities seeded | Expand venue coverage |
| **i18n** | Indonesian only | English support |

---

## 15. FILES RETAINED (Documentation)

| File | Purpose |
|------|---------|
| `DESIGN.md` | Complete design system (colors, typography, spacing, components, accessibility, PWA) |
| `PRD.md` | This file — product requirements & production spec |
| `Tasks.md` | Task tracker with deployment status |

**Removed**: `DEPLOY_VERCEL.md` (obsolete), `README.md` (redundant with PRD), `backend/AGENTS.md` (Next.js generated)

---

## 16. DEPLOYMENT COMMANDS

```bash
# Frontend build & deploy (auto on push to main)
cd frontend && npm run build

# Backend build & deploy (auto on push to main)
cd backend && npm run build

# Local dev
cd frontend && npm run dev      # :5173
cd backend && npm run dev       # :3000

# Database (Supabase CLI)
supabase db push                # Apply migrations
supabase db reset               # Reset local
```

---

**End of PRD v2.0** — Arenivo is production-ready on Vercel. 🚀