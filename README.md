# 🏟️ Arenivo

<div align="center">
  <img src="frontend/public/arenivo-logo.png" alt="Arenivo Logo" width="160" />
  <h3>Satu Aplikasi, Banyak Arena</h3>
  <p>Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.</p>
  
  <p>
    <a href="https://github.com/Alfifauzan14/Arenivo">
      <img src="https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github" alt="Repository" />
    </a>
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Midtrans-Payment-002f6c?style=flat-square" alt="Midtrans" />
  </p>
</div>

---

## 📌 Ringkasan Proyek

**Arenivo** adalah platform ticketing dan booking arena olahraga (futsal, mini soccer, dan sepak bola) terintegrasi berbasis web yang dirancang dengan standar UX OTA modern (tiket.com style) berorientasi *High-Conversion* & *Anti-AI Slop*.

### 👥 3 Peran Utama:
1. **Penyewa (`/`)**: Eksplorasi venue terdekat, jadwal slot real-time, checkout aman Midtrans (QRIS, VA Bank, E-Wallet), E-Tiket ber-QR Code, reschedule 1x, dan chatbot asisten AI.
2. **Mitra Pengelola (`/mitra`)**: Manajemen venue, pengaturan jadwal & harga dinamis (*weekday/weekend/peak*), Gate Scanner QR Code check-in lapangan, laporan pendapatan bersih, dan penarikan saldo (payout).
3. **Super Admin (`/admin`)**: Verifikasi mitra usaha, pengawasan transaksi platform, moderasi konten/ulasan, proses refund otomatis, dan audit log komprehensif.

---

## 🚀 Memulai (Quick Start)

### 1. Kloning Repository
```bash
git clone https://github.com/Alfifauzan14/Arenivo.git
cd Arenivo
```

### 2. Instalasi Dependensi Monorepo
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas contoh environment:
```bash
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
* **Frontend Penyewa & Mitra:** `http://localhost:5173`
* **Portal Super Admin:** `http://localhost:5173/admin`
* **Backend API Route Handlers:** `http://localhost:3000/api/v1`

### 5. Menjalankan Pengujian Otomatis (Integration & Stress Test)
```bash
npm run test
```
* **Test 1:** High Concurrency Slot Reservation (Pencegahan Double-Booking)
* **Test 2:** Midtrans Webhook Edge Cases (Settlement, Idempotency, Tampered Signature, Expire)
* **Test 3:** Gate Scanner Validation (Sah, Sudah Dipakai, Salah Waktu, Fiktif, Dibatalkan, & Audit Log)

### 6. Pengecekan Type & Production Build
```bash
npm run typecheck
npm run build
```

---

## 📂 Struktur Monorepo

```
Arenivo/
├── frontend/          # React 18 + Vite + Tailwind CSS + Lucide Icons + PWA
│   ├── public/        # Aset logo Arenivo, favicon, manifest PWA, service worker FCM
│   └── src/           # Pages, Layouts, Features, dan Components UI
├── backend/           # Next.js 15 App Router (API Route Handlers)
│   ├── src/app/api/   # 66 Route Handlers REST API
│   ├── src/modules/   # Logika bisnis, Repositori, dan Layanan integrasi
│   ├── supabase/      # Migrasi SQL, RLS, dan 8 fungsi transaksi atomik ACID
│   └── tests/         # Suite pengujian otomatis konkurensi, webhook, dan scanner
├── shared/            # Kontrak bersama TypeScript, Skema Zod, Enums, dan Utils
└── docs/              # PRD, Desain Sistem, dan Dokumen Arsitektur
```

---

## 🛡️ Lisensi & Hak Cipta

© 2026 **Arenivo** (`PT Arenivo Sport Indonesia`). Seluruh hak cipta dilindungi undang-undang.
Repository resmi: [https://github.com/Alfifauzan14/Arenivo.git](https://github.com/Alfifauzan14/Arenivo.git)
