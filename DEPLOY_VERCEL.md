# 🚀 Tutorial Deploy Arenivo ke Vercel (Gratis) dengan Midtrans Sandbox

> **Target**: Frontend (Vite React) + Backend (Next.js API) di Vercel Hobby Gratis  
> **Database**: Supabase (PostgreSQL + Auth + Storage)  
> **Realtime**: Pusher Channels  
> **Payment**: Midtrans Sandbox  
> **Email**: Brevo SMTP  
> **Push Notif**: Firebase Cloud Messaging  
> **Monitoring**: Sentry (opsional)

---

## 📋 Prasyarat

- [ ] Akun GitHub (repo: `Alfifauzan14/Arenivo`)
- [ ] Akun Vercel (gratis: vercel.com)
- [ ] Project Supabase sudah jalan (migrasi 0001-0003 sudah dijalankan)
- [ ] Akun Midtrans Sandbox (dashboard.sandbox.midtrans.com)
- [ ] Akun Pusher (pusher.com)
- [ ] Akun Brevo (brevo.com) untuk email transaksional
- [ ] Project Firebase (console.firebase.google.com) untuk Web Push

---

## 1️⃣ Setup Environment Variables

### Frontend (`frontend/.env.production`)
```bash
VITE_API_BASE_URL=https://arenivo-backend.vercel.app/api/v1
VITE_USE_MOCK=false

# Supabase Client (Public)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Midtrans Snap Client (SANDBOX)
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

# Pusher Client
VITE_PUSHER_KEY=xxxxxxxxxxxxxxxxxxxx
VITE_PUSHER_CLUSTER=ap1

# Firebase Web Push (VAPID Key dari Firebase Console)
VITE_FIREBASE_VAPID_KEY=xxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_PROJECT_ID=arenivo-51e64
```

### Backend (`backend/.env.production`)
```bash
PORT=3000
NODE_ENV=production

# CORS - GANTI DENGAN DOMAIN VERCEL ANDA
CORS_ORIGIN=https://arenivo-frontend.vercel.app
CORS_ORIGINS=https://arenivo-frontend.vercel.app,https://arenivo-backend.vercel.app

# Supabase Admin (Service Role - RAHASIA)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_JWKS_URL=...

# Midtrans SANDBOX
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Pusher Server
PUSHER_APP_ID=123456
PUSHER_KEY=xxxxxxxxxxxxxxxxxxxx
PUSHER_SECRET=xxxxxxxxxxxxxxxxxxxx
PUSHER_CLUSTER=ap1

# Brevo Email
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=noreply@arenivo.id
BREVO_SENDER_NAME="Arenivo"

# Firebase Admin (untuk FCM)
FIREBASE_PROJECT_ID=arenivo-51e64
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@arenivo-51e64.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Chatbot
SYSTEM_AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Sentry (opsional)
SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntryu_xxxxxxxx

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 2️⃣ Konfigurasi Supabase Dashboard

### Authentication → URL Configuration
```
Site URL: https://arenivo-frontend.vercel.app
Redirect URLs: 
  - https://arenivo-frontend.vercel.app/**
  - https://arenivo-backend.vercel.app/**
  - http://localhost:5173/** (untuk dev)
```

### Authentication → Providers → Email
- ✅ **Confirm email**: ON (production) / OFF (dev only)
- ✅ **Secure email change**: ON

### Storage → Buckets
Buat bucket `venue-photos` (public) untuk upload foto lapangan.

---

## 3️⃣ Konfigurasi Midtrans Sandbox

### Dashboard Midtrans Sandbox → Settings → Configuration
```
Environment: Sandbox
Payment Notification URL: https://arenivo-backend.vercel.app/api/v1/webhooks/midtrans
Finish Redirect URL: https://arenivo-frontend.vercel.app/bookings
Unfinish Redirect URL: https://arenivo-frontend.vercel.app/bookings
Error Redirect URL: https://arenivo-frontend.vercel.app/bookings
```

### Ambil Credentials
- **Server Key**: `SB-Mid-server-xxxxxxxxxxxxxxxxxxxx` → backend env
- **Client Key**: `SB-Mid-client-xxxxxxxxxxxxxxxxxxxx` → frontend + backend env
- **Merchant ID**: `G123456789` → backend env

### Test Card Numbers (Sandbox)
| Jenis | Nomor | CVV | Expired |
|-------|-------|-----|---------|
| Visa | 4811 1111 1111 1114 | 123 | 01/25 |
| Mastercard | 5111 1111 1111 1118 | 123 | 01/25 |
| BCA VA | - | - | - |
| BRI VA | - | - | - |
| QRIS | - | - | - |

---

## 4️⃣ Konfigurasi Pusher Channels

### Dashboard Pusher → App Keys
```
App ID: 123456
Key: xxxxxxxxxxxxxxxxxxxx
Secret: xxxxxxxxxxxxxxxxxxxx
Cluster: ap1
```
→ Masukkan ke frontend & backend env.

### Allowed Origins (untuk development)
Tambahkan: `http://localhost:5173`, `https://arenivo-frontend.vercel.app`

---

## 5️⃣ Konfigurasi Brevo (Email)

### SMTP & API → API Keys
Buat API Key v3 → `xkeysib-xxxxxxxxxxxxxxxxxxxx`

### Senders & Domains
Verifikasi domain `arenivo.id` atau gunakan sender default `noreply@arenivo.id`

---

## 6️⃣ Konfigurasi Firebase (Web Push)

### Project Settings → Cloud Messaging → Web Configuration
- Generate **VAPID Key** → `VITE_FIREBASE_VAPID_KEY`
- **Project ID** → `VITE_FIREBASE_PROJECT_ID` & `FIREBASE_PROJECT_ID`

### Service Accounts → Generate Private Key
Download JSON → extract:
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (escape `\n` jadi `\\n`)

---

## 7️⃣ Deploy ke Vercel (via GitHub)

### Step 1: Push ke GitHub (sudah selesai)
```bash
git push origin main
```

### Step 2: Deploy Frontend
1. Buka https://vercel.com/new
2. **Import Git Repository** → `Alfifauzan14/Arenivo`
3. **Configure Project**:
   - Project Name: `arenivo-frontend`
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** → Tambah semua `VITE_*` dari `frontend/.env.production`
5. **Deploy**

### Step 3: Deploy Backend
1. Vercel Dashboard → **Add New Project** → Import repository yang sama
2. **Configure Project**:
   - Project Name: `arenivo-backend`
   - Framework Preset: **Next.js**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
3. **Environment Variables** → Tambah SEMUA dari `backend/.env.production`
   - ⚠️ `FIREBASE_PRIVATE_KEY` paste langsung dengan `\n` (Vercel auto-handle)
4. **Deploy**

### Step 4: Update CORS & URLs
Setelah dapat URL:
- Frontend: `https://arenivo-frontend.vercel.app`
- Backend: `https://arenivo-backend.vercel.app`

Update di **Supabase** (Site URL), **Midtrans** (Notification/Redirect URL), **Pusher** (Allowed Origins), **Vercel Env Vars** (`CORS_ORIGIN`, `VITE_API_BASE_URL`).

Redeploy keduanya setelah update env.

---

## 8️⃣ Verifikasi Post-Deploy

### Checklist
- [ ] Frontend load di `https://arenivo-frontend.vercel.app`
- [ ] API health: `https://arenivo-backend.vercel.app/api/v1/health` → `{"status":"ok"}`
- [ ] Register user baru → cek email verifikasi → login
- [ ] Login admin/mitra/penyewa
- [ ] Cari lapangan → filter → detail venue
- [ ] Booking flow: pilih slot → checkout → Midtrans Snap terbuka
- [ ] Bayar pakai test card → redirect ke `/bookings` → status `dikonfirmasi`
- [ ] Mitra dashboard: lihat booking masuk
- [ ] Admin dashboard: lihat transaksi, kelola banner/promo
- [ ] Gate scanner: validate ticket code
- [ ] Push notif: subscribe di browser → test kirim dari backend

### Debug Umum
| Error | Penyebab | Solusi |
|-------|----------|--------|
| CORS error | Origin tidak di-whitelist | Update `CORS_ORIGINS` di backend env |
| Midtrans 404 | Webhook URL salah | Pastikan URL backend benar di Midtrans Dashboard |
| Supabase auth error | Site URL mismatch | Update Site URL di Supabase Dashboard |
| Pusher connection failed | Key/Cluster salah | Cek `VITE_PUSHER_KEY` & `VITE_PUSHER_CLUSTER` |
| Function timeout (60s) | Vercel limit | Optimasi query, atau move heavy task ke queue |

---

## 9️⃣ Monitoring & Maintenance

### Sentry (Opsional tapi Direkomendasikan)
- DSN di env → error tracking otomatis
- Alert ke email/Slack saat error rate naik

### Supabase Backup
- Dashboard → Database → Backups → Enable **Point-in-Time Recovery** (gratis di Pro, manual di Free)

### Log Vercel
- Dashboard → Functions → View logs per invocation

---

## 💰 Estimasi Biaya (Bulanan)

| Service | Tier Gratis | Limit | Upgrade Jika |
|---------|-------------|-------|--------------|
| Vercel Frontend | Hobby | 100GB bandwidth | Traffic >100GB |
| Vercel Backend | Hobby | 1000 invocations/day, 60s timeout | >1k req/day atau butuh >60s |
| Supabase | Free | 500MB DB, 1GB storage, 50k MAU | DB >500MB atau MAU >50k |
| Pusher | Sandbox | 200k messages/day, 100 connections | Production traffic |
| Midtrans | Sandbox | Unlimited test | Go live → Production keys |
| Brevo | Free | 300 email/hari | >300 email/hari |
| Firebase | Spark | Unlimited FCM | - |

---

## 🔗 Link Berguna

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Auth Helpers**: https://supabase.com/docs/guides/auth/server-side/nextjs
- **Midtrans Snap Docs**: https://docs.midtrans.com/reference/snap-api
- **Pusher Channels**: https://pusher.com/docs/channels
- **Brevo API**: https://developers.brevo.com/reference
- **Firebase FCM Web**: https://firebase.google.com/docs/cloud-messaging/js/client

---

## 🆘 Troubleshooting Cepat

### "Email not confirmed" saat login
→ User belum klik link verifikasi. Cek Spam/Junk Gmail. Atau disable "Confirm email" di Supabase (dev only).

### Midtrans Snap tidak terbuka
→ Cek `VITE_MIDTRANS_CLIENT_KEY` benar (sandbox). Cek console browser error.

### Booking gagal "Slot sudah dipesan"
→ Race condition normal. User pilih slot lain.

### Realtime tidak update (slot/booking)
→ Cek Pusher connection di browser DevTools Network → WS. Pastikan key/cluster benar.

### Upload foto gagal
→ Cek Supabase Storage bucket `venue-photos` public + policy insert/select.

---

**Selamat deploy! 🎉**  
Kalau ada error, cek log Vercel Functions atau Supabase Logs → cari `requestId` dari error response.