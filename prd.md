# Product Requirements Document (PRD)

- **Nama Produk:** Arenivo
- **Tagline & Deskripsi:** Satu Aplikasi, Banyak Arena. Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.
- **Repository GitHub:** https://github.com/Alfifauzan14/Arenivo.git
- **Identitas Visual & Logo:** Huruf monogram atletis "A" 3D Faceted Crimson Red (#DC2626) menyatu dengan jaring gawang futsal & sepak bola hitam.
- **Platform:** Aplikasi Web Responsif (Penyewa, Mitra, Super Admin)
- **Arsitektur:** Monorepo (frontend React + Vite, backend Next.js API Route Handlers, shared TypeScript + Zod)
- **Acuan Desain:** docs/desain.md — Referensi UX tiket.com, Tema Sporty Crimson Red (#DC2626), Anti-AI Slop

---

## 1. Latar Belakang Masalah & Tujuan Produk

### 1.1 Identifikasi Masalah

#### Dari Sisi Penyewa:
- Pemesanan lapangan masih dilakukan lewat telepon atau chat, sehingga penyewa harus menunggu balasan untuk mengetahui jadwal yang kosong.
- Penyewa tidak bisa melihat ketersediaan jadwal dan harga beberapa lapangan sekaligus, sehingga sulit membandingkan pilihan.
- Bukti pemesanan dan pembayaran tidak seragam (screenshot chat atau transfer manual), sehingga rawan sengketa saat tiba di lapangan.

#### Dari Sisi Pemilik Lapangan (Mitra):
- Pencatatan jadwal dilakukan manual (buku atau chat), sehingga rawan terjadi pemesanan ganda (double booking) pada jam yang sama.
- Pemilik harus memverifikasi pembayaran satu per satu dan sering terlambat membalas pesanan.
- Tidak ada rekap pesanan dan pendapatan yang rapi untuk bahan evaluasi usaha.

#### Dari Sisi Pengelola Platform (Super Admin):
- Tidak ada pengawasan terpusat terhadap mitra, lapangan, dan transaksi.
- Tidak ada mekanisme verifikasi mitra, sehingga kualitas dan keabsahan data lapangan sulit dijamin.

### 1.2 Tujuan Produk

- **Tujuan Umum:** Membangun sistem ticketing booking lapangan futsal dan sepak bola yang terintegrasi berbasis web untuk penyewa, mitra, dan super admin agar proses pemesanan, pembayaran, dan pengelolaan jadwal berjalan lebih cepat, akurat, dan terdokumentasi.
- **Tujuan Khusus:**
  - Memungkinkan penyewa mencari lapangan, melihat jadwal kosong, memesan, dan membayar secara online tanpa komunikasi manual.
  - Mencegah pemesanan ganda dengan memastikan satu jadwal hanya dapat dipesan oleh satu penyewa.
  - Mencatat pembayaran secara otomatis dan menerbitkan e-tiket ber-QR Code sebagai bukti pemesanan yang sah.
  - Memberi mitra dashboard web yang responsif untuk mengelola lapangan, jadwal, pesanan masuk, check-in, dan pendapatan, termasuk dari ponsel.
  - Memberi super admin sarana untuk memverifikasi mitra serta memantau seluruh pengguna dan transaksi.

---

## 2. Standar UI/UX & Identitas Visual (docs/desain.md)

### Referensi UX (tiket.com):
- Mengadopsi tata letak Online Travel & Ticketing Agent (OTA) yang bersih, padat informasi, dan memiliki alur pemesanan yang jelas dari pencarian hingga penerbitan e-tiket.
- Menggunakan Floating Search Widget di bawah hero banner, kartu katalog venue yang mudah dipindai, matriks pemilihan jam yang interaktif, serta Sticky Checkout Summary.

### Palet Warna Utama (Sporty Crimson Red — Light Mode First):
- **Background Utama:** #F8FAFC (bg-slate-50) dan permukaan kartu #FFFFFF (bg-white) dengan garis tepi tegas 1px solid #E2E8F0 (border-slate-200).
- **Primary Crimson Red:** #DC2626 (bg-red-600, hover bg-red-700) untuk tombol aksi utama (CTA), slot jadwal yang sedang dipilih, dan indikator menu aktif.
- **Dark Crimson Header/Hero:** #991B1B (bg-red-800) untuk hero banner dan kop e-tiket.
- **Soft Red Tint:** #FEF2F2 (bg-red-50 text-red-700 border-red-200) untuk badge kategori dan sorotan elemen aktif.
- **Warna Semantik Status:** Hijau Emerald (#059669) untuk status dikonfirmasi dan tiket sah; Kuning Amber (#D97706) untuk menunggu_bayar dan slot dikunci; Biru (#2563EB) untuk tiket digunakan; Abu-abu (#64748B) untuk selesai/terisi; serta Rose Tua (#BE123C) disertai ikon peringatan tegas untuk status gagal/batal/penolakan scan.

### Prinsip Anti-AI Slop:
- Dilarang menggunakan gradien ungu/indigo/neon, glassmorphism buram yang menurunkan kontras baca, glowing blobs abstrak, maupun bento grid kosong tanpa fungsi bisnis.
- Tipografi menggunakan Plus Jakarta Sans untuk teks antarmuka dan JetBrains Mono (tabular-nums) untuk nominal harga rupiah, hitungan mundur 15 menit, kode booking, dan kode e-tiket.

### Responsivitas Lintas Perangkat (S14):
- Seluruh halaman wajib responsif untuk layar HP, tablet, dan laptop di ketiga role (dilengkapi bottom bar di layar HP untuk checkout Penyewa dan navigasi cepat Mitra di lapangan).

---

## 3. Ringkasan Role & Cakupan Fitur

| Role | Platform | Peran Utama |
| :--- | :--- | :--- |
| Penyewa | Web (/) | Mencari lapangan, memesan slot jadwal, membayar online, dan menggunakan e-tiket. |
| Mitra (Pemilik Lapangan) | Web (/mitra) | Mengelola venue, lapangan, jadwal, pesanan, Gate Scanner check-in, dan pencairan pendapatan. |
| Super Admin | Web (/admin) | Memverifikasi mitra serta mengawasi pengguna, venue, transaksi, refund, pencairan, dan sistem. |

### 3.1 Fitur Role Penyewa (Web Publik & Member)
- **P1. Akun & Profil:** Registrasi email/password, login/logout, login Google, Facebook, dan TikTok, verifikasi email, lupa & reset password, edit profil (nama, no. HP, foto), dan ganti password.
- **P2. Landing Page & Pencarian:** Hero banner, pencarian cepat, venue populer, banner promo, daftar venue dengan pagination, pencarian nama venue, filter (jenis futsal/sepak bola, kota, rentang harga, fasilitas, rating), pengurutan (terdekat, termurah, rating), peta lokasi & venue terdekat (Google Maps), serta favorit venue.
- **P3. Detail Venue:** Galeri foto, video profil YouTube, alamat, jam operasional, fasilitas, daftar lapangan (jenis, ukuran, permukaan, harga), ulasan & rating, serta aturan venue & kebijakan pembatalan.
- **P4. Pemilihan Slot:** Pilih lapangan dan tanggal, tampilan jadwal per jam (tersedia, terisi, dikunci, diblokir, lewat), pilih satu atau beberapa jam berurutan, pembaruan status slot real-time (Pusher), dan penguncian slot sementara selama menunggu pembayaran.
- **P5. Checkout & Pembayaran:** Ringkasan harga (per jam, total, biaya layanan), validasi kode promo/voucher, catatan untuk mitra, pembayaran Midtrans (VA, e-wallet, QRIS, kartu), hitung mundur batas waktu bayar 15 menit, pembaruan status pembayaran otomatis via webhook, lanjutkan pembayaran yang belum selesai, dan invoice/bukti pembayaran.
- **P6. E-Tiket & Pesanan:** E-tiket dengan kode booking dan QR Code, unduh tiket PDF, riwayat pesanan dengan filter status, detail pesanan, pembatalan sesuai aturan beserta estimasi refund, reschedule jadwal, tambah ke Google Calendar, dan bagikan tiket.
- **P7. Setelah Bermain:** Memberikan ulasan dan rating bintang (1–5) setelah status pesanan selesai.
- **P8. Bantuan & Fitur Tambahan:** Chatbot AI (Gemini & Groq) untuk bantuan dan rekomendasi lapangan berdasarkan data nyata di database. (Catatan: Fitur P8.2 Membership, P8.3 Split bill, P8.4 Cari lawan tanding, dan P8.5 Booking berulang dicatat sebagai pengembangan tahap lanjut di luar skema inti saat ini).
- **P9. Notifikasi:** Email (verifikasi, konfirmasi booking, pembatalan, pengingat sebelum main) dan notifikasi di dalam aplikasi via Pusher.

### 3.2 Fitur Role Mitra / Pemilik Lapangan (Web /mitra)
- **M1. Akun & Usaha:** Registrasi mitra (data usaha & dokumen), pantau status verifikasi (menunggu, disetujui, ditolak beserta alasan), login/logout (hanya email & Google), edit profil & data usaha, pengaturan rekening pencairan dana, dan ganti password.
- **M2. Kelola Venue:** Tambah, ubah, nonaktifkan venue, unggah foto ke Storage, link video YouTube, titik lokasi di peta (Google Maps), fasilitas venue, serta aturan venue & kebijakan pembatalan (refund_rules).
- **M3. Kelola Lapangan:** Tambah, ubah, nonaktifkan lapangan, atur jenis, ukuran, permukaan, jam operasional per hari (day_of_week 0–6), harga dasar per jam (base_price), dan harga dinamis (field_price_rules: siang/malam, weekday/weekend).
- **M4. Jadwal & Slot:** Kalender jadwal harian dan mingguan, lihat status slot (tersedia, terisi, diblokir), blokir slot manual dengan alasan, input booking manual (walk-in / telepon), dan pengaturan libur khusus / tutup sementara.
- **M5. Pesanan:** Daftar pesanan masuk dengan filter status dan tanggal, detail pesanan (termasuk nama dan no. HP penyewa), serta batalkan pesanan (otomatis refund 100% penuh ke penyewa).
- **M6. Gate Scanner:** Scan QR e-tiket penyewa lewat kamera browser untuk check-in, validasi tiket (sah, sudah_dipakai, belum_dibayar, salah_waktu, salah_venue, dibatalkan, tidak_ditemukan), input kode tiket manual jika QR gagal terbaca, dan tabel riwayat check-in (ticket_scans).
- **M7. Keuangan & Laporan:** Dashboard ringkasan (pesanan hari ini, pendapatan), laporan pendapatan harian/bulanan (memisahkan online vs offline manual), rincian komisi platform dan pendapatan bersih, buku besar saldo (mitra_balances), pengajuan & riwayat pencairan dana (payouts), serta grafik pendapatan dan okupansi.
- **M8. Interaksi Pelanggan:** Lihat dan balas ulasan penyewa, serta buat kode promo untuk venue sendiri.
- **M9. Notifikasi:** Web push notification Firebase (pesanan baru, pembayaran, pembatalan) dan update pesanan real-time lewat Pusher.

### 3.3 Fitur Role Super Admin (Web /admin)
- **A1. Akun & Akses:** Login khusus email/password di /admin/login (dengan opsi 2FA TOTP) dan pencatatan seluruh aktivitas di audit_logs.
- **A2. Manajemen Pengguna:** Daftar penyewa (cari, filter, blokir/aktifkan akun) dan daftar mitra (lihat detail & dokumen usaha via signed URL, setujui atau tolak pendaftaran mitra wajib dengan alasan, blokir/aktifkan akun mitra).
- **A3. Manajemen Venue & Master Data:** Lihat semua venue dan lapangan, nonaktifkan venue bermasalah, serta kelola master data (cities, field_types, facilities).
- **A4. Manajemen Transaksi, Refund & Pencairan:** Daftar seluruh pesanan dan pembayaran Midtrans, penanganan refund (proses via API Midtrans atau tandai selesai manual dengan referensi transfer, atau tolak dengan alasan), persetujuan & penyelesaian pencairan dana ke mitra (payouts), serta pengaturan komisi platform.
- **A5. Konten & Moderasi:** Kelola banner landing page, moderasi ulasan, dan kelola promo/voucher global.
- **A6. Laporan & Analitik:** Dashboard analitik (total pengguna, mitra, pesanan, pendapatan), grafik tren pesanan dan pendapatan, daftar venue terpopuler, dan ekspor laporan ke PDF / Excel.
- **A7. Pengaturan Sistem:** Ubah parameter system_settings secara dinamis tanpa mengubah kode (batas waktu bayar, aturan pembatalan default, komisi, pencairan minimum, dan pilihan provider utama Chatbot AI gemini atau groq).

---

## 4. Aturan Bisnis & Alur Sistem Inti

### 4.1 Parameter Aturan Bisnis Default (system_settings)

| Aturan Bisnis | Ketentuan Default |
| :--- | :--- |
| Batas waktu bayar & kunci slot | 15 menit sejak booking dibuat (expires_at). |
| Durasi slot | 1 jam per slot; penyewa boleh memilih beberapa jam berurutan dalam satu booking. |
| Batas pemesanan ke depan | Maksimal 30 hari dari hari ini. |
| Komisi platform | 10% dari harga sewa (subtotal); biaya layanan (service_fee) 100% milik platform. |
| Penambahan saldo Mitra | Saldo Mitra baru bertambah setelah booking berstatus selesai (bukan saat dibayar). |
| Pencairan dana minimum | Minimal Rp100.000 per pengajuan payout. |
| Aturan Refund (Penyewa batal) | > 24 jam sebelum main = 100%; 6 s.d. 24 jam = 50%; < 6 jam = 0% (biaya layanan tidak dikembalikan). |
| Aturan Refund (Mitra batal) | 100% penuh (termasuk biaya layanan kembali ke penyewa). |
| Aturan Reschedule | Maksimal 1 kali (reschedule_count = 0), hanya untuk status dikonfirmasi, minimal 24 jam sebelum jadwal, ke slot kosong dengan total harga setara. |
| Jendela Waktu Check-in (Scanner) | Dibuka mulai 30 menit sebelum jam mulai bermain sampai jam selesai bermain. |
| Aturan Ulasan | Hanya untuk booking berstatus selesai, maksimal 1 ulasan per booking. |
| Dampak Pemblokiran Akun | Penyewa diblokir tidak bisa membuat booking baru; Mitra diblokir venue-nya disembunyikan dari publik, namun pesanan yang sudah ada tetap berjalan. |

### 4.2 Siklus Status Pesanan (bookings.status)
- **Jalur normal:** menunggu_bayar (slot dikunci 15 menit) -> dikonfirmasi (webhook Midtrans berhasil diterima & e-tiket terbit) -> digunakan (QR e-tiket dipindai oleh Mitra di lapangan) -> selesai (otomatis oleh pg_cron setelah jam bermain usai & saldo mitra bertambah).
- **Catatan penyelesaian:** Jika penyewa tidak datang (tidak ada scan QR), pesanan berstatus dikonfirmasi tetap otomatis berubah menjadi selesai setelah jam main berakhir dan tidak mendapat refund.
- **Jalur gagal/batal:** menunggu_bayar yang melewati 15 menit berubah menjadi kedaluwarsa dan slot dilepas otomatis. Pesanan menunggu_bayar atau dikonfirmasi yang dibatalkan berubah menjadi dibatalkan (dan memicu pembuatan catatan refunds otomatis jika sebelumnya sudah dikonfirmasi).

### 4.3 Aturan High Concurrency & Pembayaran Terlambat
- **Pencegahan Double Booking:** Pembuatan booking dan penguncian slot di tabel slot_reservations berjalan dalam satu transaksi database (create_booking) yang dilindungi aturan unik (field_id, slot_start) WHERE is_active = true. Jika dua penyewa memesan slot yang sama bersamaan, satu berhasil (201) dan satu langsung ditolak (409 SLOT_TAKEN).
- **Kunci Kedaluwarsa Tanpa Bergantung Cron:** Fungsi create_booking menganggap kunci slot yang sudah melewati expires_at sebagai kosong dan melepasnya dalam transaksi yang sama, sehingga kebenaran data tidak bergantung pada jeda waktu pg_cron.
- **Penanganan Webhook Pembayaran Terlambat:** Jika webhook sukses dari Midtrans tiba setelah booking berstatus kedaluwarsa dan slot masih kosong, booking dihidupkan kembali menjadi dikonfirmasi. Namun jika slot tersebut sudah diambil pemesan lain, pembayaran tetap dicatat berhasil, booking tetap kedaluwarsa, dan refund penuh dibuat secara otomatis.
- **Perhitungan Komisi & Diskon Promo:** total_price = subtotal + service_fee - discount. platform_commission = subtotal * commission_rate (dibulatkan). Diskon promo venue ditanggung Mitra, sedangkan diskon promo global ditanggung platform, sehingga mitra_amount = subtotal - platform_commission - diskon_promo_venue.
- **Booking Manual (Walk-in Mitra):** Langsung berstatus dikonfirmasi, tanpa pembayaran Midtrans, tanpa e-tiket, tanpa komisi platform, tidak masuk ke buku besar saldo online Mitra, dan dipisahkan sebagai transaksi offline pada laporan pendapatan.

---

## 5. Arsitektur Teknis & Struktur Folder Monorepo

### 5.1 Stack Teknologi
- **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS.
- **Backend:** Next.js (App Router Route Handlers saja, tanpa halaman UI Next.js), TypeScript.
- **Kode Bersama (shared):** TypeScript interfaces, skema validasi Zod, konstanta status & kode error.
- **Database, Auth, Storage:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, pg_cron).
- **Layanan Pihak Ketiga:** Midtrans (Snap & Refund API), Pusher (Real-time), Firebase Cloud Messaging (Web Push), Brevo (SMTP Email), Google Maps (Iframe Embed), Google Calendar (Template Link), YouTube (youtube-nocookie.com Embed), Gemini & Groq (Chatbot AI), TikTok Login Kit.

### 5.2 Struktur Direktori Monorepo
```plaintext
futsal-booking/
├─ frontend/                    # React + Vite + Tailwind CSS
│  └─ src/
│     ├─ app/                   # router, provider, konfigurasi root
│     ├─ pages/                 # halaman per role (public, penyewa, mitra, admin)
│     ├─ features/              # logika per fitur (auth, booking, payment, venue, ticket, scanner, chatbot)
│     ├─ components/ui/         # komponen UI reusable sesuai desain.md
│     ├─ layouts/               # PublicLayout, MitraLayout, AdminLayout
│     ├─ routes/                # proteksi halaman per role (ProtectedRoute)
│     ├─ lib/                   # api client, supabase client, pusher, mock-data, utilitas
│     └─ styles/                # Tailwind & font setup
├─ backend/                     # Next.js (Route Handlers API saja)
│  ├─ src/
│  │  ├─ app/api/v1/            # route handler tipis: auth, venues, fields, bookings, mitra, admin, webhooks, health
│  │  ├─ modules/               # logika bisnis per modul (service, repository, schema)
│  │  ├─ middleware/            # autentikasi withAuth, role check, rate limiting, error handler
│  │  ├─ lib/                   # klien Supabase, Midtrans, Pusher, Brevo, Firebase, Gemini, Groq, TikTok
│  │  └─ config/                # validasi environment variable (Zod)
│  ├─ supabase/migrations/      # migrasi SQL, RLS, trigger, dan 8 fungsi transaksi
│  └─ tests/                    # pengujian high concurrency, webhook, dan gate scanner
├─ shared/
│  └─ src/                      # types, schemas (Zod), constants (status & error codes), utils
├─ docs/                        # PRD.md, desain.md, ERD, dokumentasi API
├─ package.json                 # npm workspaces
├─ tsconfig.base.json
├─ .env.example
└─ README.md
```

### 5.3 Standar Kode & Lapisan Backend
- **Lapisan Backend Wajib:** Route handler (hanya membaca request, memanggil service, mengembalikan response) -> Service (seluruh logika bisnis) -> Repository (satu-satunya tempat yang mengakses Supabase) -> Database (aturan unik & fungsi transaksi).
- **Konvensi Penamaan:** File kebab-case, komponen React PascalCase, variabel & fungsi camelCase, konstanta UPPER_SNAKE_CASE, tabel & kolom database snake_case, field JSON camelCase, dan nilai enum tetap snake_case (contoh: menunggu_bayar).
- **Keamanan Kunci:** Semua rahasia (service role Supabase, server key Midtrans, secret Pusher, client secret TikTok, API key Gemini/Groq/Brevo) hanya ada di backend dan dilarang menggunakan awalan NEXT_PUBLIC_.

---

## 6. Rancangan Database (Supabase PostgreSQL)

Nilai uang disimpan sebagai bilangan bulat (integer/bigint) dalam Rupiah, waktu disimpan sebagai timestamptz (ditampilkan dalam WIB di frontend), kunci utama menggunakan uuid, dan setiap tabel memiliki created_at serta updated_at.

### 6.1 Daftar Tabel Inti

#### Identitas:
- **profiles:** id (sama dengan Supabase Auth), full_name, email, phone, avatar_url, role (penyewa, mitra, admin), status (aktif, diblokir), tiktok_open_id (unik, boleh kosong).
- **mitra_profiles:** id, user_id (unik), business_name, business_address, document_url, verification_status (menunggu, disetujui, ditolak), rejection_reason, verified_by, verified_at, bank_name, bank_account_number, bank_account_holder.

#### Master Data:
- **cities:** (id, name, province), **facilities:** (id, name, icon), **field_types:** (id, code, name).

#### Venue & Lapangan:
- **venues:** id, mitra_id, city_id, name, slug (unik), description, address, latitude, longitude, youtube_url, rules, status (aktif, nonaktif, diblokir), rating_avg, review_count.
- **venue_photos:** (id, venue_id, url, sort_order, is_cover) & **venue_facilities:** (venue_id, facility_id).
- **fields:** id, venue_id, field_type_id, name, size_description, surface, base_price, status (aktif, nonaktif).
- **field_operating_hours:** id, field_id, day_of_week (0–6), open_time, close_time, is_closed.
- **field_price_rules:** id, field_id, day_of_week (nullable), start_time, end_time, price, priority.
- **refund_rules:** id, venue_id (nullable untuk default global), min_hours_before, refund_percent.

#### Slot & Booking:
- **slot_reservations:** id, field_id, slot_start, slot_end, type (booking, blokir), booking_id, price, reason, created_by, is_active — Unique Index: (field_id, slot_start) WHERE is_active = true.
- **bookings:** id, booking_code (unik), user_id (nullable untuk walk-in), customer_name, customer_phone, field_id, venue_id, play_start, play_end, total_hours, source (online, manual), status, subtotal, service_fee, discount, total_price, commission_rate, platform_commission, mitra_amount, expires_at, notes, cancelled_by, cancelled_at, cancel_reason, reschedule_count, idempotency_key (unik per user_id).

#### Pembayaran, Tiket & Refund:
- **payments:** id, booking_id, midtrans_order_id (unik), midtrans_transaction_id, payment_type, gross_amount, status (pending, berhasil, gagal, kedaluwarsa), snap_token, paid_at, raw_notification.
- **webhook_events:** id, event_key (unik), payload, processed, created_at.
- **tickets:** id, booking_id (unik), ticket_code (unik, isi QR), status (aktif, digunakan, dibatalkan), issued_at, used_at, checked_in_by.
- **ticket_scans:** id, ticket_id, scanned_code, venue_id, scanned_by, result (sah, sudah_dipakai, belum_dibayar, salah_waktu, salah_venue, dibatalkan, tidak_ditemukan), scanned_at.
- **refunds:** id, booking_id, payment_id, amount, refund_percent, status (diajukan, disetujui, diproses, selesai, ditolak), reason, midtrans_refund_key, requested_by, processed_by, processed_at.

#### Keuangan Mitra:
- **mitra_balance_entries:** (buku besar bertanda plus/minus), **payouts:** (riwayat & pengajuan pencairan dengan salinan rekening bank), dan **view mitra_balances:** (saldo_total, saldo_tertahan, saldo_bisa_dicairkan).

#### Konten, Notifikasi & Sistem:
- reviews, favorites, promos, banners, notifications, push_subscriptions, chat_sessions, chat_messages, system_settings, dan audit_logs.

### 6.2 Delapan Fungsi Transaksi Database (PostgreSQL RPC)
- **create_booking:** Validasi jam operasional & tanggal, lepas kunci lama yang sudah lewat expires_at, hitung harga per slot, dan simpan ke slot_reservations + bookings dalam satu transaksi.
- **confirm_payment:** Dipanggil secara idempotent oleh webhook untuk mengubah status pembayaran & booking menjadi dikonfirmasi, lalu menerbitkan tickets.
- **expire_bookings:** Dijalankan pg_cron setiap menit untuk mengubah booking menunggu_bayar yang melewati expires_at menjadi kedaluwarsa dan menonaktifkan kunci slot.
- **cancel_booking:** Menghitung persentase refund dari refund_rules, melepas slot, membatalkan tiket, dan membuat baris refunds otomatis jika sudah dibayar.
- **complete_booking:** Dijalankan pg_cron setelah jam main berakhir untuk mengubah booking dikonfirmasi atau digunakan menjadi selesai dan mencatat pendapatan Mitra di mitra_balance_entries (kecuali booking manual).
- **validate_ticket:** Memeriksa keabsahan tiket pada Gate Scanner sesuai venue dan jendela waktu (30 menit sebelum main s.d. selesai) serta mencatat setiap percobaan ke ticket_scans.
- **reschedule_booking:** Memeriksa syarat reschedule (status dikonfirmasi, >24 jam, reschedule_count = 0, harga setara) dan memindahkan slot dalam satu transaksi.
- **request_payout:** Mengunci baris mitra, memeriksa saldo_bisa_dicairkan dan batas minimum Rp100.000, lalu membuat baris payouts.

---

## 7. Spesifikasi Kontrak REST API (/api/v1)

### 7.1 Format Response & Kode Error Seragam

#### Response Berhasil:
```json
{
  "data": { "id": "...", "bookingCode": "FB-8K2M4Q", "status": "menunggu_bayar" },
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

#### Response Gagal:
```json
{
  "error": {
    "code": "SLOT_TAKEN",
    "message": "Slot 19.00 sudah dipesan. Silakan pilih jam lain.",
    "details": [{ "field": "slots[0]", "issue": "taken" }],
    "requestId": "req_01HX..."
  }
}
```

#### Pemetaan HTTP Status & Kode Error:
- **400:** VALIDATION_ERROR
- **401:** UNAUTHENTICATED
- **403:** FORBIDDEN, ACCOUNT_BLOCKED, MITRA_NOT_VERIFIED, PROFILE_REQUIRED, EMAIL_NOT_VERIFIED
- **404:** NOT_FOUND (juga dipakai jika data milik pengguna lain agar keberadaan data tidak bocor)
- **409:** SLOT_TAKEN, INVALID_STATUS_TRANSITION, TICKET_ALREADY_USED, TICKET_NOT_AVAILABLE, IDEMPOTENCY_CONFLICT
- **422:** OUT_OF_OPERATING_HOURS, BOOKING_EXPIRED, CANCEL_NOT_ALLOWED, RESCHEDULE_NOT_ALLOWED, REFUND_NOT_ALLOWED, REVIEW_NOT_ALLOWED, PROMO_INVALID, PAYOUT_BELOW_MINIMUM, INSUFFICIENT_BALANCE
- **429:** RATE_LIMITED
- **500:** INTERNAL_ERROR | **502:** PROVIDER_ERROR

### 7.2 Daftar Endpoint Utama

#### Publik & Penyewa:
- **Auth & Profil:** `POST /auth/sync-profile`, `POST /auth/tiktok/callback`, `GET /me`, `PATCH /me`, `POST /uploads/sign`.
- **Katalog & Jadwal:** `GET /venues`, `GET /venues/{slug}`, `GET /venues/{slug}/reviews`, `GET /fields/{id}/availability?date=`, `GET /master/cities`, `GET /master/facilities`, `GET /master/field-types`, `GET /banners`.
- **Booking & Pembayaran:** `POST /promos/validate`, `POST /bookings` (wajib header Idempotency-Key), `GET /bookings`, `GET /bookings/{id}`, `POST /bookings/{id}/payments`, `GET /bookings/{id}/refund-preview`, `POST /bookings/{id}/cancel`, `POST /bookings/{id}/reschedule`, `GET /bookings/{id}/ticket`, `GET /bookings/{id}/invoice`, `GET /bookings/{id}/calendar`, `POST /bookings/{id}/review`.
- **Lainnya:** `GET/PUT/DELETE /me/favorites`, `GET/PATCH /me/notifications`, `POST/DELETE /me/push-subscriptions`, `POST /chat/messages`, `GET /chat/sessions`, `POST /pusher/auth`.

#### Mitra (`/api/v1/mitra/...`):
- `GET/PUT /mitra/application`, `GET/PATCH /mitra/profile`, `GET /mitra/dashboard`, `GET/POST/PATCH /mitra/venues`, `POST/DELETE /mitra/venues/{id}/photos`, `PUT /mitra/venues/{id}/facilities`, `GET/PUT /mitra/venues/{id}/refund-rules`, `GET/POST/PATCH /mitra/fields`, `PUT /mitra/fields/{id}/operating-hours`, `GET/POST/PATCH/DELETE /mitra/price-rules`, `GET /mitra/fields/{id}/schedule`, `POST/DELETE /mitra/blocks`, `GET/POST /mitra/bookings`, `POST /mitra/bookings/{id}/cancel`, `POST /mitra/tickets/validate`, `GET /mitra/check-ins`, `GET /mitra/balance`, `GET /mitra/reports/revenue`, `GET/POST /mitra/payouts`, `GET /mitra/reviews`, `POST /mitra/reviews/{id}/reply`, `GET/POST/PATCH /mitra/promos`.

#### Super Admin (`/api/v1/admin/...`):
- `GET /admin/dashboard`, `GET /admin/reports/overview`, `GET /admin/users`, `PATCH /admin/users/{id}/status`, `GET /admin/mitra`, `POST /admin/mitra/{id}/approve`, `POST /admin/mitra/{id}/reject`, `PATCH /admin/mitra/{id}/status`, `GET /admin/venues`, `PATCH /admin/venues/{id}/status`, `CRUD /admin/{cities,facilities,field-types}`, `GET /admin/bookings`, `GET /admin/payments`, `GET /admin/refunds`, `POST /admin/refunds/{id}/{process,reject}`, `GET /admin/payouts`, `POST /admin/payouts/{id}/{approve,reject,complete}`, `GET/PATCH /admin/settings`, `CRUD /admin/banners`, `GET/POST/PATCH /admin/promos`, `PATCH /admin/reviews/{id}/status`, `GET /admin/audit-logs`.

#### Sistem:
- `POST /webhooks/midtrans` dan `GET /health`.

---

## 8. Autentikasi, Otorisasi & Keamanan

- **Satu Akun Satu Role:** Role ditentukan saat panggilan pertama POST /auth/sync-profile (penyewa atau mitra) dan tidak pernah bisa diubah lewat API; akun admin hanya dibuat melalui seed database.
- **Urutan Pemeriksaan Middleware withAuth di Backend:** Verifikasi tanda tangan JWT Supabase secara lokal -> Muat role dan status dari tabel profiles (tidak pernah mempercayai user_metadata dari token) -> Cek status === 'aktif' (jika diblokir, tolak dengan 403 ACCOUNT_BLOCKED) -> Cek kecocokan role (403 FORBIDDEN) -> Khusus /mitra/* (kecuali /mitra/application, /mitra/profile, /me), pastikan verification_status === 'disetujui' (403 MITRA_NOT_VERIFIED) -> Cek kepemilikan data (jika bukan miliknya, kembalikan 404 NOT_FOUND).
- **Alur Khusus Login TikTok:** Karena TikTok tidak membagikan email, akun dibuat menggunakan alamat email pengganti berdomain .invalid yang dilewati oleh pengirim email Brevo.
- **Keamanan Storage & Rate Limiting:**
  - Dua bucket Supabase Storage: venue-photos (baca publik) dan mitra-documents (privat, hanya diakses Admin lewat signed URL).
  - Rate limiting (Upstash Redis): POST /bookings 10/menit/user, /chat/messages 20/menit/user, /mitra/tickets/validate 60/menit/mitra, dan endpoint publik 120/menit/IP.

---

## 9. Integrasi Layanan Pihak Ketiga & Penanganan Kegagalan

- **Midtrans:** Menggunakan Snap popup di frontend dan verifikasi signature SHA512 + cek ulang status ke API Midtrans pada webhook. Dilengkapi sinkronisasi otomatis saat GET /bookings/{id} dibuka untuk pesanan menunggu_bayar yang belum dicek >15 detik terakhir.
- **Pusher:** Channel publik field-{fieldId} (event slot.updated) hanya dilanggan saat halaman jadwal/checkout dibuka (ditambah polling setiap 45 detik sebagai cadangan), serta channel privat private-user-{userId} dan private-mitra-{mitraId}.
- **Google Maps, YouTube & Google Calendar:** Peta menggunakan komponen VenueMap berbasis iframe embed tanpa billing + tombol tautan "Buka di Google Maps"; video profil memakai iframe youtube-nocookie.com; kalender memakai tautan template Google Calendar.
- **Brevo Email & Firebase Web Push (FCM):** Kegagalan pengiriman email atau push notification dibungkus try/catch dan dicatat di log sehingga tidak pernah menggagalkan transaksi utama.
- **Chatbot AI (Gemini & Groq):** Membaca provider utama dari system_settings, mengambil konteks venue & jadwal nyata dari database (hanya baca), tidak mengirimkan data pribadi penyewa, dan otomatis berpindah ke provider cadangan atau pesan bawaan jika mengalami kegagalan/timeout.

---

## 10. Urutan Eksekusi Pembangunan (Roadmap Implementasi)

- **Tahap 1 — Setup Monorepo (frontend, backend, shared) & Design System (desain.md):** Inisialisasi workspace, skema Zod & tipe di shared, kerangka Next.js API + GET /api/v1/health di backend, serta konfigurasi Tailwind CSS Merah Anti-AI Slop + komponen UI dasar + mock data di frontend.
- **Tahap 2 — UI/UX Publik & Penyewa (Katalog & Pemilihan Slot):** PublicLayout, Landing Page bergaya tiket.com, Katalog & Filter Venue, Detail Venue, dan matriks interaktif SlotPickerGrid.
- **Tahap 3 — UI/UX Penyewa (Checkout, E-Tiket QR, Riwayat Pesanan & Auth):** Halaman Checkout dengan hitung mundur 15 menit, E-Tiket QR berlekuk, modal Reschedule & Batal/Refund, form Ulasan, Chatbot AI, dan halaman Login/Register Penyewa.
- **Tahap 4 — UI/UX Mitra (/mitra):** MitraLayout (Sidebar desktop + Bottom Bar HP), Verifikasi Usaha, Dashboard Mitra, Kelola Venue & Lapangan (harga dinamis), Kalender Slot (blokir & walk-in), Gate Scanner Check-in, serta Keuangan & Payout.
- **Tahap 5 — UI/UX Super Admin (/admin):** AdminLayout, Dashboard Analitik, Verifikasi Mitra, Manajemen Pengguna/Venue/Master Data, Proses Refund & Payout, Konten/Moderasi, system_settings, dan audit_logs.
- **Tahap 6 — Database Supabase & Implementasi REST API (/api/v1):** Migrasi SQL lengkap, RLS, 8 fungsi transaksi PostgreSQL, pg_cron, middleware withAuth, seluruh endpoint /api/v1/..., dan penyambungan penuh ke frontend.
- **Tahap 7 — Integrasi Third-Party:** Penyambungan Midtrans Snap & Webhook, Pusher, Supabase Storage signed URL, Brevo SMTP, Firebase FCM, Chatbot AI (Gemini/Groq), dan TikTok OAuth.