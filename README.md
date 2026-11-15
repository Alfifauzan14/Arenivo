# 🏟️ Arenivo — Satu Aplikasi, Banyak Arena

<div align="center">
  <img src="frontend/public/arenivo-logo.png" alt="Arenivo Logo" width="160" />
  <h3>Platform Booking Lapangan Olahraga Real-Time</h3>
  <p>Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal ketersediaan real-time dan pembayaran instan langsung dari ponsel Anda.</p>
</div>

---

## 🌟 Tentang Arenivo

**Arenivo** adalah platform digital all-in-one yang menghubungkan penyewa lapangan olahraga dengan pemilik venue (mitra) secara transparan dan instan:
- **Penyewa**: Menemukan venue terbaik, memilih slot jam bermain tanpa risiko double-booking, bayar via payment gateway resmi, dan mendapatkan E-Tiket berformat QR Code.
- **Mitra Lapangan**: Dashboard operasional untuk memantau pemesanan masuk, validasi tiket menggunakan QR Scanner, kelola jadwal & tarif lapangan, serta penarikan saldo (payout) transparan.
- **Administrator**: Memantau transaksi platform, verifikasi pendaftaran mitra baru, dan manajemen master data wilayah/fasilitas.

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend API** | Next.js 15 (App Router), TypeScript, Zod Validation |
| **Database & Auth** | Supabase (PostgreSQL 16, Row Level Security, Supabase Auth) |
| **Payment Gateway** | Midtrans Snap (QRIS, Virtual Account, E-Wallet) |
| **Realtime Updates** | Pusher Channels |
| **Cloud Storage** | Supabase Storage (CDN Caching) |
| **PWA & Push Notif** | Progressive Web App, Firebase Cloud Messaging (FCM) |
| **Deployment** | Vercel (CI/CD otomatis dari branch `main`) |

---

## ✨ Fitur Utama

- 🔍 **Pencarian & Filter Venue**: Filter berdasarkan kota, jenis lapangan (vinyl, interlock, sintetis), fasilitas, rentang harga, dan rating.
- ⚡ **Real-Time Slot Locking**: Sistem penguncian slot otomatis selama 15 menit saat proses checkout untuk mencegah bentrok jadwal.
- 💳 **Pembayaran Instan**: Integrasi Midtrans Snap dengan verifikasi status pembayaran otomatis via webhook.
- 🎟️ **E-Tiket QR**: Tiket digital dinamis dengan sistem pemindaian kamera untuk verifikasi kehadiran di lokasi lapangan.
- 📱 **Mobile First & PWA**: Tampilan responsif di semua ukuran layar dan dapat diinstal langsung ke homescreen smartphone.

---

## 🚀 Panduan Menjalankan Project (Lokal)

### 1. Clone Repository
```bash
git clone https://github.com/Alfifauzan14/Arenivo.git
cd Arenivo
```

### 2. Konfigurasi Environment Variable
Salin template konfigurasi dan sesuaikan kredensial Anda:
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### 3. Menjalankan Aplikasi
Buka dua terminal terpisah:

**Terminal 1 — Backend (API)**
```bash
cd backend
npm install
npm run dev
# Berjalan di http://localhost:3000
```

**Terminal 2 — Frontend (Web App)**
```bash
cd frontend
npm install
npm run dev
# Berjalan di http://localhost:5173
```

---

## 🔒 Keamanan & Praktik Terbaik

- **Row Level Security (RLS)**: Seluruh tabel database dilindungi kebijakan akses ketat per role (penyewa, mitra, admin).
- **Environment Isolation**: Tidak ada kunci rahasia (*secret keys*) yang disimpan dalam repository. Seluruh kredensial sensitif dikelola melalui Environment Variables Vercel yang terenkripsi.
- **Validasi Data**: Validasi skema end-to-end menggunakan Zod pada seluruh request API.

---

## 📄 Lisensi

Proyek ini dikembangkan di bawah lisensi [MIT](LICENSE).

---
<div align="center">
  <b>Arenivo Team</b> • 2026
</div>
