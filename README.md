# 🏟️ Arenivo — Satu Aplikasi, Banyak Arena

<div align="center">
  <img src="frontend/public/arenivo-logo.png" alt="Arenivo Logo" width="160" />
  <h3>Platform Booking Lapangan Olahraga Real-Time</h3>
  <p>Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.</p>
</div>

---

## 🚀 Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://arenivo-frontend-8kvj3iywn-alfifauzan14s-projects.vercel.app |
| **Backend** | https://arenivo-backend-4fd70noym-alfifauzan14s-projects.vercel.app |

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [`PRD.md`](PRD.md) | **Product Requirements Document v2.0** — Complete production spec: features, tech stack, DB state, API, env vars, demo accounts |
| [`DESIGN.md`](DESIGN.md) | **Design System** — Colors, typography, spacing, components, accessibility, PWA, tokens |
| [`Tasks.md`](Tasks.md) | **Task Tracker** — Deployment status, clean DB state, Playwright test results |

---

## ⚡ Quick Start

```bash
# Clone & install
git clone https://github.com/Alfifauzan14/Arenivo.git
cd Arenivo

# Frontend (Vite + React + TS)
cd frontend && npm install && npm run dev      # http://localhost:5173

# Backend (Next.js 15 + TS)
cd ../backend && npm install && npm run dev    # http://localhost:3000
```

---

## 🔐 Demo Accounts (Production)

**Password: `Arenivo123!`**

| Role | Email | Status |
|------|-------|--------|
| **Penyewa** | `alfifauzan897@gmail.com` | ✅ Email confirmed, 2 booking history |
| **Mitra** | `mitra@arenivo.id` | ✅ Verified (`disetujui`), 1 venue 2 fields, saldo Rp 135k |
| **Admin** | `admin@arenivo.id` | ✅ Full access |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Next.js 15 (App Router) + TypeScript |
| **Database** | Supabase (PostgreSQL 16) + RLS |
| **Auth** | Supabase Auth (Email/Password + Confirmation) |
| **Realtime** | Pusher Channels |
| **Payments** | Midtrans Snap (Sandbox) |
| **Push Notif** | Firebase Cloud Messaging |
| **Email** | Brevo (Transactional) |
| **Hosting** | Vercel (Hobby) — 2 projects |
| **CI/CD** | GitHub → Vercel Auto Deploy (main branch) |

---

## ✨ Key Features (Verified Live)

- **Penyewa**: Cari venue → Slot real-time → Booking → Midtrans → E-Tiket QR → Profil
- **Mitra**: Dashboard → Pesanan → Keuangan (Rp 135k bersih) → Venue/Field CRUD → Promo → Gate Scanner
- **Admin**: Transaksi global → Payout approval → Mitra verification → Master data → Audit log

---

## 📊 Clean Database State

| Entity | Count |
|--------|-------|
| Users | 3 (penyewa, mitra, admin — all confirmed) |
| Venues | 1 (Champion Futsal Arena Cilandak) |
| Fields | 2 (Vinyl Taraflex Rp 150k, Sintetis Rp 175k) |
| Bookings | 2 (1 selesai, 1 kedaluwarsa) |
| Mitra Balance | Rp 135k (tersedia), Rp 0 (tertahan) |
| Payouts | 0 (empty) |

---

## 📄 License

MIT License — see [`PRD.md`](PRD.md) for full specification.

---

**Maintained by Arenivo Team** • Last updated: Nov 2026