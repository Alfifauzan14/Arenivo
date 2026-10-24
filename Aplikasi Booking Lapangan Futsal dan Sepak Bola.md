# Arenivo — Daftar Role dan Fitur

- **Nama Produk:** Arenivo
- **Tagline & Deskripsi:** Satu Aplikasi, Banyak Arena. Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.
- **Repository GitHub:** https://github.com/Alfifauzan14/Arenivo.git
- **Identitas Logo:** Monogram "A" 3D Faceted Crimson Red (#DC2626) & Gawang Jaring Sepak Bola Hitam

Aplikasi Ticketing Booking Lapangan Futsal dan Sepak Bola Terintegrasi (Penyewa, Mitra, Super Admin)

## Identifikasi Masalah

### Masalah dari sisi penyewa

1. Pemesanan lapangan masih dilakukan lewat telepon atau chat, sehingga penyewa harus menunggu balasan untuk mengetahui jadwal yang kosong.
2. Penyewa tidak bisa melihat ketersediaan jadwal dan harga beberapa lapangan sekaligus, sehingga sulit membandingkan pilihan.
3. Bukti pemesanan dan pembayaran tidak seragam (screenshot chat atau transfer manual), sehingga rawan sengketa saat tiba di lapangan.

### Masalah dari sisi pemilik lapangan (mitra)

1. Pencatatan jadwal dilakukan manual (buku atau chat), sehingga rawan terjadi pemesanan ganda pada jam yang sama.
2. Pemilik harus memverifikasi pembayaran satu per satu dan sering terlambat membalas pesanan.
3. Tidak ada rekap pesanan dan pendapatan yang rapi untuk bahan evaluasi usaha.

### Masalah dari sisi pengelola platform

1. Tidak ada pengawasan terpusat terhadap mitra, lapangan, dan transaksi.
2. Tidak ada mekanisme verifikasi mitra, sehingga kualitas dan keabsahan data lapangan sulit dijamin.

## Tujuan

### Tujuan umum

Membangun sistem ticketing booking lapangan futsal dan sepak bola yang terintegrasi: aplikasi web untuk penyewa, mitra, dan super admin, sehingga proses pemesanan, pembayaran, dan pengelolaan jadwal berjalan lebih cepat, akurat, dan terdokumentasi.

### Tujuan khusus

1. Memungkinkan penyewa mencari lapangan, melihat jadwal kosong, memesan, dan membayar secara online tanpa komunikasi manual.
2. Mencegah pemesanan ganda dengan memastikan satu jadwal hanya dapat dipesan oleh satu penyewa.
3. Mencatat pembayaran secara otomatis dan menerbitkan e-tiket sebagai bukti pemesanan yang sah.
4. Memberi mitra dashboard web yang responsif untuk mengelola lapangan, jadwal, pesanan masuk, dan pendapatan, termasuk dari ponsel.
5. Memberi super admin sarana untuk memverifikasi mitra serta memantau seluruh pengguna dan transaksi.

## Ringkasan Role

| Role | Platform | Peran |
| --- | --- | --- |
| Penyewa | Web | Mencari lapangan, memesan, membayar, dan menggunakan e-tiket |
| Mitra (Pemilik Lapangan) | Web | Mengelola venue, lapangan, jadwal, pesanan, check-in, dan pendapatan |
| Super Admin | Web | Memverifikasi mitra serta mengawasi pengguna, transaksi, dan sistem |

## 1. Penyewa (Web)

### P1. Akun dan Profil

- P1.1 Registrasi email/password
- P1.2 Login dan logout
- P1.3 Login Google
- P1.4 Login Facebook
- P1.6 Verifikasi email
- P1.7 Lupa dan reset password
- P1.8 Edit profil (nama, no. HP, foto)
- P1.9 Ganti password

### P2. Landing Page dan Pencarian

- P2.1 Landing page (hero, pencarian cepat, venue populer, banner)
- P2.2 Daftar venue dengan pagination
- P2.3 Pencarian nama venue
- P2.4 Filter: jenis (futsal/sepak bola), kota, rentang harga, fasilitas, rating
- P2.5 Pengurutan: terdekat, termurah, rating
- P2.6 Peta lokasi dan venue terdekat (Google Maps)
- P2.7 Favorit venue

### P3. Detail Venue

- P3.1 Galeri foto
- P3.2 Video profil (YouTube)
- P3.3 Alamat, jam operasional, fasilitas
- P3.4 Daftar lapangan: jenis, ukuran, permukaan, harga
- P3.5 Ulasan dan rating
- P3.6 Aturan venue dan kebijakan pembatalan

### P4. Pemilihan Slot

- P4.1 Pilih lapangan dan tanggal
- P4.2 Tampilan jadwal per jam (kosong / terisi / dikunci)
- P4.3 Pilih satu atau beberapa jam berurutan
- P4.4 Status slot real-time (Pusher)
- P4.5 Slot terkunci sementara selama menunggu pembayaran

### P5. Checkout dan Pembayaran

- P5.1 Ringkasan harga (per jam, total, biaya layanan)
- P5.2 Kode promo / voucher
- P5.3 Catatan untuk mitra
- P5.4 Pembayaran Midtrans (VA, e-wallet, QRIS, kartu)
- P5.5 Hitung mundur batas waktu bayar
- P5.6 Status pembayaran otomatis (webhook)
- P5.7 Lanjutkan pembayaran yang belum selesai
- P5.8 Invoice / bukti pembayaran

### P6. E-tiket dan Pesanan

- P6.1 E-tiket dengan kode booking dan QR
- P6.2 Unduh tiket PDF
- P6.3 Riwayat pesanan dengan filter status
- P6.4 Detail pesanan
- P6.5 Pembatalan sesuai aturan
- P6.6 Pengajuan refund
- P6.7 Reschedule
- P6.8 Tambah ke Google Calendar
- P6.9 Bagikan tiket

### P7. Setelah Bermain

- P7.1 Ulasan dan rating (teks + foto)

### P8. Fitur Sosial dan Bantuan

- P8.1 Chatbot AI (Google Gemini Flash): bantuan dan rekomendasi lapangan
- P8.2 Membership
- P8.3 Split bill
- P8.4 Cari lawan tanding
- P8.5 Booking berulang

### P9. Notifikasi

- P9.1 Email: verifikasi, konfirmasi booking, pembatalan
- P9.2 Email pengingat sebelum jadwal main
- P9.3 Notifikasi di dalam aplikasi (Pusher)

## 2. Mitra / Pemilik Lapangan (Web)

### M1. Akun dan Usaha

- M1.1 Registrasi mitra (data usaha, dokumen)
- M1.2 Status verifikasi (menunggu / disetujui / ditolak)
- M1.3 Login dan logout (email, Google)
- M1.4 Edit profil dan data usaha
- M1.5 Data rekening pencairan dana
- M1.6 Ganti password

### M2. Kelola Venue

- M2.1 Tambah, ubah, nonaktifkan venue
- M2.2 Upload foto
- M2.3 Link video YouTube
- M2.4 Lokasi di peta (Google Maps)
- M2.5 Fasilitas venue
- M2.6 Aturan venue dan kebijakan pembatalan

### M3. Kelola Lapangan

- M3.1 Tambah, ubah, nonaktifkan lapangan
- M3.2 Jenis, ukuran, permukaan
- M3.3 Jam operasional per hari
- M3.4 Harga default per jam
- M3.5 Harga dinamis (siang/malam, weekday/weekend)

### M4. Jadwal dan Slot

- M4.1 Kalender jadwal harian dan mingguan
- M4.2 Status slot (kosong / dipesan / diblokir)
- M4.3 Blokir slot manual
- M4.4 Input booking manual (walk-in / telepon)
- M4.5 Libur khusus / tutup sementara

### M5. Pesanan

- M5.1 Daftar pesanan masuk dengan filter
- M5.2 Detail pesanan
- M5.3 Batalkan pesanan
- M5.4 Proses permintaan refund / reschedule

### M6. Gate Scanner

- M6.1 Scan QR e-tiket penyewa (check-in) lewat kamera browser
- M6.2 Validasi tiket: sah / sudah dipakai / salah tanggal / belum dibayar
- M6.3 Input kode booking manual (jika QR gagal)
- M6.4 Riwayat check-in

### M7. Keuangan dan Laporan

- M7.1 Dashboard ringkasan (pesanan hari ini, pendapatan)
- M7.2 Laporan pendapatan harian / bulanan
- M7.3 Rincian komisi platform dan pendapatan bersih
- M7.4 Riwayat pencairan dana
- M7.5 Grafik pendapatan dan okupansi

### M8. Interaksi Pelanggan

- M8.1 Lihat dan balas ulasan
- M8.2 Buat promo untuk venue sendiri

### M9. Notifikasi

- M9.1 Web push notification Firebase (pesanan baru, pembayaran, pembatalan)
- M9.2 Update pesanan real-time (Pusher)

## 3. Super Admin (Web)

### A1. Akun dan Akses

- A1.1 Login dan logout
- A1.2 Log aktivitas admin

### A2. Manajemen Pengguna

- A2.1 Daftar penyewa (cari, filter)
- A2.2 Blokir dan aktifkan akun penyewa
- A2.3 Daftar mitra dan detailnya
- A2.4 Verifikasi / tolak pendaftaran mitra (dengan alasan)
- A2.5 Blokir dan aktifkan akun mitra

### A3. Manajemen Venue dan Lapangan

- A3.1 Lihat semua venue dan lapangan
- A3.2 Nonaktifkan venue bermasalah
- A3.3 Master data (kota, jenis lapangan, fasilitas)

### A4. Manajemen Transaksi dan Pembayaran

- A4.1 Daftar seluruh pesanan dengan filter
- A4.2 Daftar pembayaran dan status Midtrans
- A4.3 Penanganan refund
- A4.4 Pencairan dana ke mitra
- A4.5 Pengaturan komisi platform

### A5. Konten dan Moderasi

- A5.1 Kelola banner landing page
- A5.2 Moderasi ulasan
- A5.3 Promo / voucher global
- A5.4 Kelola membership

### A6. Laporan dan Analitik

- A6.1 Dashboard (total pengguna, mitra, pesanan, pendapatan)
- A6.2 Grafik tren pesanan dan pendapatan
- A6.3 Venue terpopuler
- A6.4 Ekspor laporan PDF / Excel

### A7. Pengaturan Sistem

- A7.1 Batas waktu bayar dan aturan pembatalan default
- A7.2 Konfigurasi chatbot AI (Google Gemini Flash)

## 4. Fitur Sistem (Otomatis / Lintas Role)

### S-A. Arsitektur dan Keamanan

- S1 Backend Next.js (TypeScript), REST API tunggal untuk frontend React
- S2 Database Supabase (PostgreSQL) dan ERD terstruktur
- S3 Autentikasi JWT dan role-based access control
- S4 Validasi input, rate limiting, sanitasi
- S5 Penyimpanan file (foto, dokumen)
- S6 Log aktivitas dan penanganan error

### S-B. High Concurrency

- S7 Pencegahan double booking (unique constraint di database)
- S8 Penguncian slot sementara dan pelepasan otomatis saat kedaluwarsa
- S9 Penanganan permintaan bersamaan pada slot yang sama (transaksi database)
- S10 Pengujian beban: dua pengguna memesan slot yang sama

### S-C. Otomatisasi

- S11 Webhook Midtrans dan pembaruan status otomatis
- S12 Penjadwalan tugas (kedaluwarsa pesanan, pengingat)
- S13 Pengiriman email dan push notification

### S-D. Antarmuka

- S14 Responsive design untuk layar HP, tablet, dan laptop di ketiga role

## 5. Alur dan Aturan Bisnis

### 5.1 Alur booking Penyewa

&#91;embedded content: alur booking penyewa · 2 keputusan, hijau = berhasil, merah = gagal\]

Slot dikunci 15 menit setelah dipilih. Jika tidak dibayar tepat waktu, pesanan kedaluwarsa dan slot terbuka lagi untuk penyewa lain.

### 5.2 Status pesanan

&#91;embedded content: status pesanan · jalur normal (hijau) dan jalur gagal atau batal (merah)\]

Pesanan hanya berpindah lewat panah yang digambar, dengan satu tambahan: jika penyewa tidak datang (tidak ada scan), pesanan Dikonfirmasi tetap menjadi Selesai setelah jam main berakhir. Status pembayaran berubah lewat webhook Midtrans, bukan lewat tombol di aplikasi.

### 5.3 Alur Mitra

&#91;embedded content: alur mitra · pendaftaran, verifikasi admin, lalu operasional\]

Mitra hanya melihat dan mengubah data miliknya sendiri. Venue yang belum diverifikasi tidak tampil di publik.

### 5.4 Alur Gate Scanner

&#91;embedded content: gate scanner · 1 hasil sah, 5 penolakan\]

Satu tiket hanya bisa dipindai sekali. Setiap check-in tercatat di riwayat Mitra, dan kode booking bisa diketik manual jika QR gagal terbaca.

### 5.5 Konsep pembayaran Organizer (Mitra)

&#91;embedded content: aliran dana mitra · dari pembayaran sampai pencairan\]

Semua pembayaran penyewa masuk ke akun Midtrans platform. Angka 10%, 90%, dan Rp100.000 adalah usulan awal yang bisa diubah di pengaturan sistem.

### 5.6 Aturan High Concurrency

&#91;embedded content: high concurrency · dua pemesan, satu slot\]

Pembuatan booking dan penguncian slot berjalan dalam satu transaksi database. Aturan unik pada kombinasi lapangan, tanggal, dan jam menjamin hanya satu booking aktif per slot. Webhook Midtrans diproses secara idempotent, dan rate limiting mencegah spam booking. Skenario ini diuji dengan banyak permintaan paralel ke slot yang sama.

### 5.7 Aturan bisnis (usulan awal)

Angka di bawah adalah usulan dan akan disimpan sebagai pengaturan sistem agar mudah diubah.

| Aturan | Ketentuan |
| --- | --- |
| Batas waktu bayar dan kunci slot | 15 menit |
| Durasi slot | 1 jam, boleh beberapa jam berurutan dalam satu booking |
| Batas pemesanan ke depan | Maksimal 30 hari |
| Komisi platform | 10% dari harga sewa |
| Saldo mitra bertambah | Setelah status Selesai |
| Pencairan minimum | Rp100.000 |
| Refund, lebih dari 24 jam sebelum jadwal | 100% (biaya layanan tidak kembali) |
| Refund, 6 sampai 24 jam sebelum jadwal | 50% |
| Refund, kurang dari 6 jam | 0% |
| Refund jika Mitra membatalkan | 100% |
| Reschedule | Sekali, minimal 24 jam sebelumnya, ke slot kosong dengan harga setara |
| Check-in dibuka | 30 menit sebelum jam mulai sampai jam selesai |
| Ulasan | Hanya status Selesai, satu ulasan per booking |
| Akun penyewa diblokir | Tidak bisa booking |
| Akun mitra diblokir | Venue disembunyikan, pesanan yang sudah ada tetap diproses |
| Login sosial | Email yang sama digabung menjadi satu akun |

## 6. Teknologi dan Arsitektur

### 6.1 Teknologi (usulan)

| Bagian | Teknologi | Tugas |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS | Tiga antarmuka web: Penyewa (publik), Mitra (/mitra), Super Admin (/admin) |
| Backend | Next.js (Route Handlers), TypeScript | REST API, logika bisnis, webhook, pemanggilan layanan third party. Tidak ada halaman Next.js |
| Database, Auth, Storage | Supabase | PostgreSQL, login, penyimpanan foto venue |
| Kode bersama | Folder shared (TypeScript, Zod) | Tipe data, skema validasi, konstanta status |
| Pembayaran | Midtrans | Pembayaran penyewa, webhook ke backend |
| Real-time | Pusher | Status slot dan pesanan masuk |
| Notifikasi | Firebase Web Push dan email | Pengingat dan konfirmasi |
| Hosting | Vercel (backend), Vercel atau Netlify (frontend), Supabase cloud | Dua deploy dari satu repo |

### 6.2 Cara kerja arsitektur

1. Frontend login lewat Supabase Auth (Google, Facebook), lalu mengirim token JWT ke backend pada setiap request.
2. Backend memverifikasi token dan mengecek role (Penyewa, Mitra, Super Admin) sebelum memproses permintaan.
3. Frontend tidak mengakses database langsung. Semua aturan bisnis (booking, refund, komisi) hanya ada di backend.
4. Rahasia (server key Midtrans, service role key Supabase, API key Gemini) hanya disimpan di backend.
5. Pembuatan booking dijalankan sebagai fungsi PostgreSQL dalam satu transaksi, dipanggil dari backend.
6. Midtrans memanggil webhook di backend, backend mengubah status pesanan, lalu Pusher menyiarkan perubahan ke layar.
7. Kedaluwarsa pesanan 15 menit dijalankan oleh tugas terjadwal Supabase pg\_cron.

### 6.3 Struktur repo (monorepo)

```
futsal-booking/
├─ frontend/                    React + Vite
│  └─ src/
│     ├─ app/                   router, provider, konfigurasi root
│     ├─ pages/                 halaman per role (public, penyewa, mitra, admin)
│     ├─ features/              logika per fitur (auth, booking, payment, venue, ticket, scanner, chatbot)
│     │  └─ booking/            components, hooks, api, types
│     ├─ components/ui/         komponen UI yang dipakai ulang
│     ├─ layouts/               layout per role
│     ├─ routes/                proteksi halaman per role
│     ├─ lib/                   api client, supabase client, pusher, utilitas
│     └─ styles/
├─ backend/                     Next.js (API saja)
│  ├─ src/
│  │  ├─ app/api/               route handler tipis: auth, venues, fields, slots, bookings, payments, tickets, mitra, admin, chatbot, cron
│  │  ├─ modules/               logika bisnis per modul (service, repository, schema)
│  │  ├─ middleware/            autentikasi, role, rate limiting
│  │  ├─ lib/                   klien Supabase, Midtrans, Pusher, email, Gemini
│  │  └─ config/                validasi environment variable
│  ├─ supabase/migrations/      migrasi SQL dan fungsi transaksi
│  └─ tests/
├─ shared/
│  └─ src/                      types, schemas (Zod), constants (status), utils
├─ docs/                        dokumen perancangan, ERD, UML, dokumentasi API
├─ package.json                 npm workspaces
├─ tsconfig.base.json
├─ .env.example
└─ README.md
```

### 6.4 Lapisan di backend

Setiap permintaan melewati urutan yang sama agar kode tetap rapi:

1. Route handler: hanya membaca request, memanggil service, dan mengembalikan response.
2. Service: seluruh logika bisnis (aturan booking, refund, komisi).
3. Repository: satu-satunya tempat yang berbicara dengan Supabase.
4. Database: aturan unik dan fungsi transaksi untuk menjamin tidak ada booking ganda.

### 6.5 Standar kode

- TypeScript mode strict di ketiga folder.
- ESLint dan Prettier dengan konfigurasi yang sama di seluruh repo.
- Penamaan: file kebab-case, komponen PascalCase, variabel dan fungsi camelCase, konstanta UPPER\_SNAKE\_CASE, tabel dan kolom database snake\_case.
- Satu file satu tanggung jawab, tanpa logika bisnis di route handler atau komponen tampilan.
- Format response API dan kode error yang seragam, divalidasi dengan skema dari shared.
- Environment variable divalidasi saat aplikasi mulai, dan rahasia tidak pernah masuk ke Git.
- Commit memakai format Conventional Commits (feat, fix, docs, refactor).

## 7. Rancangan Database

Database memakai PostgreSQL di Supabase. Nilai uang disimpan sebagai bilangan bulat dalam rupiah agar tidak ada selisih pembulatan.

### 7.1 Prinsip desain

1. Satu aturan unik di database menjamin satu slot hanya punya satu pemesan aktif. Kode aplikasi tidak bisa melanggarnya.
2. Harga dan komisi disimpan sebagai snapshot di booking, sehingga perubahan harga atau komisi tidak memengaruhi pesanan lama.
3. Saldo mitra memakai buku besar (ledger): saldo adalah jumlah semua catatan, sehingga selalu bisa diaudit.
4. Semua waktu disimpan sebagai timestamptz dan ditampilkan dalam WIB di frontend.
5. Penamaan: tabel dan kolom snake\_case, kunci utama uuid, setiap tabel punya created\_at dan updated\_at.
6. Data hanya diakses lewat backend. Row Level Security tetap diaktifkan sebagai lapisan pengaman tambahan.

### 7.2 ERD: identitas, venue, dan lapangan

&#91;embedded content: ERD bagian 1 · 10 tabel, venue sebagai pusat\]

Label di tengah garis dibaca dari tabel induk (kiri atau atas) ke tabel anak. Master data jenis lapangan (field\_types) tidak digambar dan dijelaskan di kamus data.

### 7.3 ERD: booking, slot, pembayaran, tiket, dan refund

&#91;embedded content: ERD bagian 2 · booking, slot, pembayaran, tiket, refund\]

Satu tabel slot\_reservations dipakai untuk booking online, booking manual, dan blokir slot oleh Mitra, sehingga satu aturan unik (field\_id + slot\_start, hanya untuk slot aktif) melindungi ketiganya sekaligus. Slot yang dilepas hanya ditandai tidak aktif, bukan dihapus. Refund terhubung ke booking dan ke pembayaran asalnya. Tabel webhook\_events (pencegah webhook ganda) dijelaskan di kamus data.

### 7.4 ERD: keuangan Mitra

&#91;embedded content: ERD bagian 3 · keuangan mitra, buku besar dan pencairan\]

Catatan pendapatan dibuat saat booking berstatus Selesai, dan catatan pencairan dibuat saat payout diproses. Data rekening disalin ke payouts saat pengajuan agar tidak berubah belakangan.

### 7.5 Kamus data

**A. Identitas**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| profiles | id (sama dengan id Supabase Auth), full\_name, email, phone, avatar\_url, role (penyewa, mitra, admin), status (aktif, diblokir) | Kredensial dan login sosial disimpan oleh Supabase Auth |
| mitra\_profiles | id, user\_id (unik), business\_name, business\_address, document\_url, verification\_status (menunggu, disetujui, ditolak), rejection\_reason, verified\_by, verified\_at, bank\_name, bank\_account\_number, bank\_account\_holder | Satu mitra, satu data usaha |

**B. Master data (dikelola Super Admin)**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| cities | id, name, province |  |
| facilities | id, name, icon |  |
| field\_types | id, code, name | Contoh: futsal, mini soccer, sepak bola |

**C. Venue dan lapangan**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| venues | id, mitra\_id, city\_id, name, slug (unik), description, address, latitude, longitude, youtube\_url, rules, status (aktif, nonaktif, diblokir), rating\_avg, review\_count | rating\_avg dan review\_count diisi trigger dari tabel reviews |
| venue\_photos | id, venue\_id, url, sort\_order, is\_cover |  |
| venue\_facilities | venue\_id, facility\_id | Kunci gabungan |
| fields | id, venue\_id, field\_type\_id, name, size\_description, surface, base\_price, status (aktif, nonaktif) | base\_price adalah harga per jam |
| field\_operating\_hours | id, field\_id, day\_of\_week (0 sampai 6), open\_time, close\_time, is\_closed | Unik per (field\_id, day\_of\_week) |
| field\_price\_rules | id, field\_id, day\_of\_week (kosong berarti semua hari), start\_time, end\_time, price, priority | Harga dinamis. Jika tidak ada aturan yang cocok, dipakai base\_price |
| refund\_rules | id, venue\_id (kosong berarti aturan default global), min\_hours\_before, refund\_percent | Contoh: (24, 100), (6, 50), (0, 0) |

**D. Slot dan booking**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| slot\_reservations | id, field\_id, slot\_start, slot\_end, type (booking, blokir), booking\_id (wajib jika type booking), price, reason, created\_by, is\_active | Satu-satunya sumber kebenaran status slot. Aturan unik: (field\_id, slot\_start) untuk is\_active = true |
| bookings | id, booking\_code (unik), user\_id (kosong untuk walk-in), customer\_name, customer\_phone, field\_id, venue\_id, play\_start, play\_end, total\_hours, source (online, manual), status, subtotal, service\_fee, discount, total\_price, commission\_rate, platform\_commission, mitra\_amount, expires\_at, notes, cancelled\_by, cancelled\_at, cancel\_reason, reschedule\_count, idempotency\_key (unik per user\_id) | Status: menunggu\_bayar, dikonfirmasi, digunakan, selesai, kedaluwarsa, dibatalkan |

**E. Pembayaran, tiket, dan refund**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| payments | id, booking\_id, midtrans\_order\_id (unik), midtrans\_transaction\_id, payment\_type, gross\_amount, status (pending, berhasil, gagal, kedaluwarsa), snap\_token, paid\_at, raw\_notification | Satu booking boleh punya beberapa percobaan bayar, tetapi hanya satu yang berhasil (aturan unik parsial) |
| webhook\_events | id, event\_key (unik), payload, processed, created\_at | Mencegah webhook Midtrans yang terkirim dua kali diproses ganda |
| tickets | id, booking\_id (unik), ticket\_code (unik, acak, isi QR), status (aktif, digunakan, dibatalkan), issued\_at, used\_at, checked\_in\_by |  |
| ticket\_scans | id, ticket\_id, scanned\_code, venue\_id, scanned\_by, result (sah, sudah\_dipakai, belum\_dibayar, salah\_waktu, salah\_venue, dibatalkan, tidak\_ditemukan), scanned\_at | Semua percobaan scan tercatat, termasuk yang ditolak. Ini menjadi riwayat check-in |
| refunds | id, booking\_id, payment\_id, amount, refund\_percent, status (diajukan, disetujui, diproses, selesai, ditolak), reason, midtrans\_refund\_key, requested\_by, processed\_by, processed\_at |  |

**F. Keuangan Mitra**

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| mitra\_balance\_entries | id, mitra\_id, booking\_id, payout\_id, type (pendapatan, pencairan, penyesuaian), amount (bertanda plus atau minus), description | Saldo adalah jumlah seluruh catatan. Catatan pendapatan dibuat saat booking berstatus Selesai |
| payouts | id, mitra\_id, amount, bank\_name, bank\_account\_number, bank\_account\_holder, status (diajukan, disetujui, selesai, ditolak), reject\_reason, requested\_at, processed\_by, processed\_at, transfer\_reference | Data rekening disalin saat pengajuan |
| mitra\_balances (view) | mitra\_id, saldo total, saldo tertahan, saldo bisa dicairkan | Dihitung dari mitra\_balance\_entries dan payouts |

**G. Konten, notifikasi, dan sistem**

| Tabel | Kolom utama |
| --- | --- |
| reviews | id, booking\_id (unik), user\_id, venue\_id, rating (1 sampai 5), comment, reply, replied\_at, status |
| favorites | user\_id, venue\_id |
| promos | id, code (unik), venue\_id (kosong berarti global), discount\_type, discount\_value, max\_discount, min\_order, quota, used\_count, valid\_from, valid\_until, is\_active |
| banners | id, title, image\_url, link\_url, sort\_order, is\_active |
| notifications | id, user\_id, type, title, body, data, is\_read |
| push\_subscriptions | id, user\_id, fcm\_token (unik) |
| chat\_sessions | id, user\_id |
| chat\_messages | id, session\_id, role (user, assistant), content, provider (gemini) |
| system\_settings | key (kunci utama), value, description, updated\_by |
| audit\_logs | id, actor\_id, action, entity\_type, entity\_id, metadata, created\_at |

system\_settings menyimpan semua angka yang masih berupa usulan (batas bayar 15 menit, komisi 10%, pencairan minimum Rp100.000, batas pemesanan 30 hari), sehingga perubahannya tidak perlu mengubah kode.

### 7.6 Fungsi dan aturan di database

| Fungsi | Tugas |
| --- | --- |
| create\_booking | Dalam satu transaksi: validasi jam operasional dan tanggal, hitung harga per slot, isi slot\_reservations dan bookings. Jika slot sudah terisi, aturan unik menolak dan backend mengembalikan error SLOT\_TAKEN |
| confirm\_payment | Dipanggil webhook: mengubah payment dan booking, lalu menerbitkan tiket. Aman dipanggil berulang |
| expire\_bookings | Dijalankan pg\_cron setiap menit. Pembuatan booking juga menganggap kunci yang lewat expires\_at sebagai kosong, jadi kebenaran data tidak bergantung pada cron: booking menunggu\_bayar yang lewat expires\_at menjadi kedaluwarsa dan slotnya dilepas |
| cancel\_booking | Menghitung persentase refund dari refund\_rules, melepas slot, dan membatalkan tiket |
| complete\_booking | Dijalankan pg\_cron setelah jam main berakhir untuk booking dikonfirmasi atau digunakan (penyewa yang tidak datang tetap Selesai). Mengubah status ke Selesai dan mencatat pendapatan Mitra di buku besar, kecuali untuk booking manual |
| validate\_ticket | Logika Gate Scanner: memeriksa tiket dan mencatat hasilnya di ticket\_scans |
| reschedule\_booking | Dalam satu transaksi: memeriksa status dikonfirmasi, batas 24 jam, reschedule\_count nol, dan slot baru kosong dengan harga setara, lalu memindahkan slot lama ke slot baru |
| request\_payout | Mengunci baris mitra, memeriksa saldo bisa dicairkan dan batas minimum, lalu membuat payout. Mencegah dua pengajuan bersamaan menarik saldo yang sama |

### 7.7 Indeks penting

- bookings (user\_id, created\_at)
- bookings (venue\_id, play\_start)
- bookings (status, expires\_at), khusus status menunggu\_bayar
- slot\_reservations (field\_id, slot\_start)
- payments (midtrans\_order\_id)
- tickets (ticket\_code)
- venues (city\_id, status)

### 7.8 Asumsi yang perlu dikonfirmasi

1. Slot tetap berdurasi 1 jam (tidak ada slot 30 menit atau 90 menit).
2. Booking manual untuk pelanggan walk-in tanpa akun didukung, lewat customer\_name dan customer\_phone.
3. Saldo Mitra memakai buku besar, bukan satu kolom saldo.
4. Riwayat chat AI disimpan (chat\_sessions dan chat\_messages).
5. Membership, split bill, cari lawan tanding, dan booking berulang belum dirancang karena tidak masuk list penilaian. Strukturnya aman ditambah nanti tanpa mengubah tabel di atas.

## 8. Desain REST API

Semua endpoint ada di backend Next.js dengan awalan /api/v1. Kolom Akses: Pub = tanpa login, P = Penyewa, M = Mitra (terverifikasi), A = Super Admin, Login = semua role.

### 8.1 Konvensi umum

| Aspek | Aturan |
| --- | --- |
| Versi | Semua endpoint di /api/v1/... |
| Format | JSON. Path memakai kata benda jamak, huruf kecil, dipisah tanda hubung |
| Nama field | camelCase di JSON. Nilai enum (status, role, tipe) tetap snake\_case, misalnya menunggu\_bayar |
| Waktu | ISO 8601 dengan zona waktu, contoh 2026-10-20T19:00:00+07:00. Disimpan UTC |
| Uang | Bilangan bulat dalam rupiah, contoh 150000 |
| Autentikasi | Header Authorization: Bearer (JWT Supabase) |
| Pagination | ?page=1&limit=20, limit maksimal 100. Hanya endpoint daftar yang memakai meta |
| Pengurutan | ?sort=-createdAt (tanda minus berarti menurun) |
| Metode | GET baca, POST buat atau aksi, PATCH ubah sebagian, PUT ganti seluruh koleksi (fasilitas, jam operasional, aturan refund, favorit), DELETE hapus |
| Pencegahan duplikat | Header Idempotency-Key wajib pada POST /bookings, disimpan di bookings.idempotency\_key |
| Validasi | Skema Zod dari folder shared, dipakai frontend dan backend |
| Identitas | Detail venue publik memakai slug. Selain itu memakai id (uuid) |

Login, logout, dan reset password memakai Supabase Auth langsung dari frontend. Backend hanya memverifikasi token dan mengelola profil.

### 8.2 Format response dan kode error

Berhasil:

```json
{
  "data": { "id": "...", "bookingCode": "FB-8K2M4Q", "status": "menunggu_bayar" },
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

Gagal (selalu satu bentuk):

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

| Status | Kode error | Arti |
| --- | --- | --- |
| 400 | VALIDATION\_ERROR | Input tidak valid |
| 401 | UNAUTHENTICATED | Token tidak ada atau kedaluwarsa |
| 403 | FORBIDDEN, ACCOUNT\_BLOCKED, MITRA\_NOT\_VERIFIED, PROFILE\_REQUIRED, EMAIL\_NOT\_VERIFIED | Role tidak sesuai, akun diblokir, atau mitra belum diverifikasi |
| 404 | NOT\_FOUND | Data tidak ada, atau ada tetapi bukan milik pemanggil |
| 409 | SLOT\_TAKEN, INVALID\_STATUS\_TRANSITION, TICKET\_ALREADY\_USED, TICKET\_NOT\_AVAILABLE, IDEMPOTENCY\_CONFLICT | Konflik dengan keadaan data |
| 422 | OUT\_OF\_OPERATING\_HOURS, BOOKING\_EXPIRED, CANCEL\_NOT\_ALLOWED, RESCHEDULE\_NOT\_ALLOWED, REFUND\_NOT\_ALLOWED, REVIEW\_NOT\_ALLOWED, PROMO\_INVALID, PAYOUT\_BELOW\_MINIMUM, INSUFFICIENT\_BALANCE | Melanggar aturan bisnis |
| 429 | RATE\_LIMITED | Terlalu banyak permintaan |
| 500 | INTERNAL\_ERROR | Kesalahan server. Detail hanya di log, tidak dikirim ke klien |
| 502 | PROVIDER\_ERROR | Layanan pihak ketiga gagal atau melebihi batas waktu |

IDEMPOTENCY\_CONFLICT berarti Idempotency-Key yang sama dikirim dengan isi permintaan berbeda. Jika isinya sama, backend mengembalikan hasil booking yang sudah dibuat.

### 8.3 Endpoint publik dan Penyewa

**Akun dan profil**

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| POST | /auth/sync-profile | Membuat profil setelah login pertama. Menerima intendedRole: penyewa atau mitra. Role admin tidak pernah diterima dari klien | Login |
| GET | /me | Profil sendiri | Login |
| PATCH | /me | Ubah nama, no. HP, foto | Login |
| POST | /uploads/sign | Meminta URL unggah bertanda tangan ke Supabase Storage (foto dan dokumen diunggah langsung dari frontend) | Login |

**Katalog dan jadwal**

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET | /venues | Daftar venue aktif dari mitra terverifikasi. Filter: type, cityId, minPrice, maxPrice, facilities, rating, q, lat, lng, sort | Pub |
| GET | /venues/{slug} | Detail venue: foto, video, fasilitas, lapangan, aturan | Pub |
| GET | /venues/{slug}/reviews | Ulasan venue | Pub |
| GET | /fields/{id}/availability?date= | Jadwal per jam. Status slot: tersedia, dikunci (sedang menunggu bayar oleh orang lain), terisi, diblokir, lewat. Slot di luar jam operasional tidak dikirim | Pub |
| GET | /master/cities, /master/facilities, /master/field-types | Data master untuk filter | Pub |
| GET | /banners | Banner landing page | Pub |

**Booking dan pembayaran**

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| POST | /promos/validate | Cek kode promo dan hitung diskon (hanya pratinjau, promo divalidasi ulang saat booking dibuat) | P |
| POST | /bookings | Membuat booking dan mengunci slot (status menunggu\_bayar) | P |
| GET | /bookings | Riwayat booking sendiri (filter status) | P |
| GET | /bookings/{id} | Detail booking, pembayaran, dan tiket | P |
| POST | /bookings/{id}/payments | Membuat pembayaran Midtrans dan mengembalikan snapToken. Jika sudah ada pembayaran pending yang belum kedaluwarsa, mengembalikan token yang sama | P |
| GET | /bookings/{id}/refund-preview | Estimasi refund sebelum membatalkan | P |
| POST | /bookings/{id}/cancel | Membatalkan booking. Jika sudah dibayar, refund dibuat otomatis | P |
| POST | /bookings/{id}/reschedule | Pindah jadwal (sekali, hanya status dikonfirmasi, minimal 24 jam sebelumnya) | P |
| GET | /bookings/{id}/ticket | Data e-tiket dan kode QR. Sebelum lunas menghasilkan TICKET\_NOT\_AVAILABLE | P |
| GET | /bookings/{id}/invoice | Invoice atau bukti bayar dalam bentuk JSON | P |
| GET | /bookings/{id}/calendar | Mengembalikan googleCalendarUrl untuk menyimpan jadwal ke Google Calendar | P |
| POST | /bookings/{id}/review | Memberi ulasan (hanya status selesai, satu per booking) | P |

**Lain-lain**

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET, PUT, DELETE | /me/favorites, /me/favorites/{venueId} | Favorit venue | P |
| GET | /me/notifications | Daftar notifikasi | Login |
| PATCH | /me/notifications/{id}/read, /me/notifications/read-all | Tandai dibaca | Login |
| POST, DELETE | /me/push-subscriptions | Daftarkan atau hapus token Firebase | Login |
| POST | /chat/messages | Kirim pesan ke chatbot (Google Gemini Flash) | P |
| GET | /chat/sessions, /chat/sessions/{id}/messages | Riwayat chat | P |
| POST | /pusher/auth | Otorisasi channel privat Pusher (private-user-{id}, private-mitra-{id}). Hanya channel milik pemanggil yang diizinkan | Login |

### 8.4 Endpoint Mitra (/mitra/...)

Endpoint di bawah hanya untuk role Mitra dan hanya menyentuh data milik sendiri. Mitra yang belum terverifikasi hanya boleh memakai /mitra/application, /mitra/profile, dan /me. Endpoint lain menghasilkan MITRA\_NOT\_VERIFIED.

| Kelompok | Method dan endpoint | Fungsi |
| --- | --- | --- |
| Pendaftaran | GET, PUT /mitra/application | Melihat status verifikasi, mengirim atau mengajukan ulang data usaha dan dokumen |
| Profil usaha | GET, PATCH /mitra/profile | Data usaha dan rekening pencairan |
| Dashboard | GET /mitra/dashboard | Pesanan hari ini dan ringkasan pendapatan |
| Venue | GET, POST /mitra/venues | Daftar dan tambah venue |
|  | GET, PATCH /mitra/venues/{id} | Detail dan ubah venue (termasuk nonaktifkan) |
|  | POST /mitra/venues/{id}/photos, DELETE .../photos/{photoId} | Mendaftarkan foto yang sudah diunggah ke Storage (kirim path), dan menghapus foto |
|  | PUT /mitra/venues/{id}/facilities | Atur fasilitas |
|  | GET, PUT /mitra/venues/{id}/refund-rules | Kebijakan refund venue |
| Lapangan | GET, POST /mitra/venues/{venueId}/fields | Daftar dan tambah lapangan |
|  | GET, PATCH /mitra/fields/{id} | Detail dan ubah lapangan |
|  | PUT /mitra/fields/{id}/operating-hours | Jam operasional per hari |
|  | GET, POST /mitra/fields/{id}/price-rules, PATCH, DELETE /mitra/price-rules/{id} | Harga dinamis |
| Jadwal | GET /mitra/fields/{id}/schedule?from=&to= | Kalender slot |
|  | POST /mitra/fields/{id}/blocks, DELETE /mitra/blocks/{id} | Blokir dan buka blokir slot |
|  | POST /mitra/bookings | Booking manual untuk walk-in |
| Pesanan | GET /mitra/bookings, GET /mitra/bookings/{id} | Pesanan masuk (filter status dan tanggal) |
|  | POST /mitra/bookings/{id}/cancel | Membatalkan pesanan, refund penuh termasuk biaya layanan |
| Gate Scanner | POST /mitra/tickets/validate | Validasi QR atau kode manual |
|  | GET /mitra/check-ins | Riwayat check-in |
| Keuangan | GET /mitra/balance | Saldo total, tertahan, dan bisa dicairkan |
|  | GET /mitra/reports/revenue?from=&to=&groupBy=day atau month | Laporan pendapatan: kotor, komisi, bersih. Booking manual dipisah sebagai offline |
|  | GET, POST /mitra/payouts | Riwayat dan pengajuan pencairan |
| Ulasan dan promo | GET /mitra/reviews, POST /mitra/reviews/{id}/reply | Balas ulasan |
|  | GET, POST /mitra/promos, PATCH /mitra/promos/{id} | Promo venue sendiri |

### 8.5 Endpoint Super Admin (/admin/...)

Akun admin dibuat manual (seed di database), tidak ada endpoint pendaftaran admin.

| Kelompok | Method dan endpoint | Fungsi |
| --- | --- | --- |
| Dashboard | GET /admin/dashboard, GET /admin/reports/overview | Total pengguna, mitra, pesanan, pendapatan |
| Pengguna | GET /admin/users, GET /admin/users/{id} | Daftar dan detail penyewa |
|  | PATCH /admin/users/{id}/status | Blokir atau aktifkan akun |
| Mitra | GET /admin/mitra, GET /admin/mitra/{id} | Daftar dan detail mitra (dokumen lewat URL baca bertanda tangan) |
|  | POST /admin/mitra/{id}/approve, POST .../reject | Verifikasi atau tolak (reject wajib reason) |
|  | PATCH /admin/mitra/{id}/status | Blokir atau aktifkan |
| Venue | GET /admin/venues, PATCH /admin/venues/{id}/status | Pantau dan nonaktifkan venue |
| Master data | GET, POST /admin/cities, PATCH, DELETE /admin/cities/{id} | Kota. Pola sama untuk /admin/facilities dan /admin/field-types |
| Transaksi | GET /admin/bookings, GET /admin/payments | Seluruh pesanan dan pembayaran |
| Refund | GET /admin/refunds | Daftar refund (dibuat otomatis saat pembatalan) |
|  | POST /admin/refunds/{id}/process | Memproses refund lewat Midtrans, atau menandai selesai manual dengan referensi transfer |
|  | POST /admin/refunds/{id}/reject | Menolak refund (wajib reason), hanya untuk kasus penyalahgunaan |
| Pencairan | GET /admin/payouts | Daftar pengajuan |
|  | POST /admin/payouts/{id}/approve, .../reject, .../complete | Setujui, tolak, tandai selesai (transferReference) |
| Pengaturan | GET /admin/settings, PATCH /admin/settings/{key} | Batas bayar, komisi, pencairan minimum, dan seterusnya |
| Konten | GET, POST /admin/banners, PATCH, DELETE /admin/banners/{id} | Banner |
|  | GET, POST /admin/promos, PATCH /admin/promos/{id} | Promo global |
|  | PATCH /admin/reviews/{id}/status | Moderasi ulasan |
| Audit | GET /admin/audit-logs | Log aktivitas admin |

### 8.6 Endpoint sistem

| Method | Endpoint | Fungsi | Perlindungan |
| --- | --- | --- | --- |
| POST | /webhooks/midtrans | Notifikasi pembayaran dari Midtrans | Verifikasi signature, lalu status transaksi dicek ulang ke API Midtrans. Idempotent lewat tabel webhook\_events |
| GET | /health | Cek kesehatan layanan | Publik |

Tidak ada endpoint cron. Kedaluwarsa pesanan dan penyelesaian pesanan dijalankan langsung di database oleh pg\_cron.

### 8.7 Diagram urutan: booking, pembayaran, dan webhook

&#91;embedded content: diagram urutan · booking, pembayaran, dan webhook (biru = bagian webhook)\]

Panah putus-putus adalah balasan. Tiga panah terakhir (webhook) adalah satu-satunya jalur yang mengubah status pembayaran. Backend memverifikasi signature dan mengecek ulang status transaksi ke API Midtrans sebelum memanggil confirm\_payment.

### 8.8 Contoh endpoint kritis

**POST /bookings**, dengan header Idempotency-Key berisi uuid:

```json
{
  "fieldId": "9b1f...",
  "date": "2026-10-20",
  "slots": ["19:00", "20:00"],
  "promoCode": "HEMAT10",
  "notes": "Bawa bola sendiri"
}
```

Respons 201:

```json
{
  "data": {
    "id": "c3d2...",
    "bookingCode": "FB-8K2M4Q",
    "status": "menunggu_bayar",
    "playStart": "2026-10-20T19:00:00+07:00",
    "playEnd": "2026-10-20T21:00:00+07:00",
    "subtotal": 300000,
    "serviceFee": 5000,
    "discount": 30000,
    "totalPrice": 275000,
    "expiresAt": "2026-10-14T10:15:00+07:00"
  }
}
```

Urutan di backend: validasi skema, cek akun tidak diblokir, cek Idempotency-Key, panggil create\_booking (satu transaksi), lalu siarkan perubahan slot lewat Pusher. Jika slot sudah diambil, hasilnya 409 SLOT\_TAKEN.

**GET /fields/{id}/availability?date=2026-10-20**:

```json
{
  "data": {
    "date": "2026-10-20",
    "slots": [
      { "start": "18:00", "end": "19:00", "status": "tersedia", "price": 150000 },
      { "start": "19:00", "end": "20:00", "status": "dikunci", "price": 150000 },
      { "start": "20:00", "end": "21:00", "status": "terisi", "price": 150000 }
    ]
  }
}
```

**POST /mitra/tickets/validate**:

```json
{ "code": "TKT-7F3A9C...", "venueId": "a41e..." }
```

Respons memuat result (sah, sudah\_dipakai, belum\_dibayar, salah\_waktu, salah\_venue, dibatalkan, tidak\_ditemukan), serta data penyewa, jam main, dan lapangan hanya jika result adalah sah. Setiap percobaan tercatat di ticket\_scans.

### 8.9 Aturan bisnis yang dipertegas

Bagian ini menutup hal yang bisa ditafsirkan ganda saat implementasi.

1. **Akun dan role.** Satu akun satu role. Penyewa dan Mitra mendaftar lewat /auth/sync-profile dengan intendedRole. Mitra berstatus menunggu sampai disetujui. Admin dibuat manual. Mitra yang ditolak mengajukan ulang lewat PUT /mitra/application.
2. **Kunci slot.** Kunci berlaku 15 menit (expires\_at). create\_booking menganggap kunci yang sudah lewat sebagai kosong dan melepasnya dalam transaksi yang sama, sehingga tidak bergantung pada cron. Perubahan karena cron tidak disiarkan lewat Pusher, jadi frontend memakai expiresAt untuk hitung mundur dan mengambil ulang jadwal saat perlu.
3. **Pembayaran.** Batas kedaluwarsa transaksi Midtrans diset sama dengan expires\_at booking. Status berubah hanya lewat webhook, dengan pemetaan: settlement atau capture menjadi berhasil, pending menjadi pending, deny atau cancel menjadi gagal, expire menjadi kedaluwarsa.
4. **Pembayaran terlambat.** Jika webhook berhasil tiba setelah booking kedaluwarsa dan slot masih kosong, booking dihidupkan kembali dan dikonfirmasi. Jika slot sudah diambil orang lain, pembayaran dicatat berhasil, booking tetap kedaluwarsa, dan refund penuh dibuat otomatis.
5. **Pembatalan dan refund.** Status menunggu\_bayar: slot dilepas, tidak ada refund. Status dikonfirmasi: refund dihitung dari refund\_rules (milik venue, atau default global) dan dibuat otomatis berstatus disetujui. Biaya layanan tidak dikembalikan pada pembatalan oleh penyewa, tetapi dikembalikan penuh jika Mitra yang membatalkan. Status digunakan atau selesai tidak bisa dibatalkan (CANCEL\_NOT\_ALLOWED). Admin memproses refund lewat Midtrans. Sejauh yang saya ketahui, tidak semua metode pembayaran bisa di-refund otomatis lewat API, sehingga admin juga bisa menandai refund selesai secara manual dengan referensi transfer.
6. **Reschedule.** Hanya sekali, hanya untuk status dikonfirmasi, minimal 24 jam sebelum jadwal, ke slot kosong dengan total harga yang sama. Jika total harga berbeda, permintaan ditolak (RESCHEDULE\_NOT\_ALLOWED).
7. **Booking manual oleh Mitra.** Status langsung dikonfirmasi, tanpa pembayaran Midtrans, tanpa tiket, tanpa komisi, dan tidak masuk saldo (uang diterima Mitra langsung). Muncul di laporan sebagai offline.
8. **Komisi dan promo.** total\_price = subtotal + service\_fee - discount. platform\_commission = subtotal x commission\_rate (dibulatkan). Biaya layanan seluruhnya pendapatan platform. Diskon promo venue ditanggung Mitra, diskon promo global ditanggung platform. mitra\_amount = subtotal - platform\_commission - diskon promo venue.
9. **Penyelesaian.** pg\_cron menjalankan complete\_booking setelah jam main berakhir untuk booking dikonfirmasi atau digunakan. Penyewa yang tidak datang tetap Selesai dan tidak mendapat refund. Saldo Mitra bertambah di langkah ini.
10. **Pencairan.** request\_payout mengunci baris mitra. Saldo bisa dicairkan = saldo total dikurangi pencairan yang masih diajukan atau disetujui. Catatan pencairan (bernilai minus) dibuat saat payout berstatus selesai.
11. **Gate Scanner.** Tiket hanya sah untuk venue yang dipilih Mitra di aplikasi. Tiket venue lain, termasuk milik mitra lain, menghasilkan salah\_venue tanpa membuka detail apa pun. Check-in dibuka 30 menit sebelum jam mulai sampai jam selesai, di luar itu hasilnya salah\_waktu.
12. **Unggah berkas.** Batas ukuran body pada fungsi serverless membuat unggahan foto lewat backend kurang cocok. Frontend meminta URL bertanda tangan lewat /uploads/sign dan mengunggah langsung ke Supabase Storage, backend hanya menyimpan path. Dokumen mitra memakai bucket privat dan admin melihatnya lewat URL baca bertanda tangan.
13. **Google Calendar.** /bookings/{id}/calendar mengembalikan tautan Google Calendar (tanpa OAuth). Integrasi penuh dengan Calendar API dan OAuth bisa ditambah nanti.
14. **Kode 403 dan 404.** Role yang salah menghasilkan 403. Role benar tetapi data bukan miliknya menghasilkan 404, agar keberadaan data tidak bocor.
15. **Akun diblokir.** Penyewa yang diblokir tidak bisa membuat booking baru, booking yang sudah ada tetap berjalan. Venue milik mitra yang diblokir disembunyikan dari publik, pesanan yang sudah ada tetap diproses.
16. **Kuota promo.** Kuota dikurangi saat booking dibuat dan dikembalikan jika booking kedaluwarsa atau dibatalkan.

### 8.10 Keamanan dan batas permintaan

- Urutan pemeriksaan di setiap endpoint: token valid, role cocok, akun aktif, lalu kepemilikan data.
- Aksi Super Admin (verifikasi, blokir, refund, pencairan, ubah pengaturan) selalu dicatat di audit\_logs.
- CORS hanya mengizinkan domain frontend.
- Batas permintaan (usulan): POST /bookings 10 per menit per pengguna, /chat/messages 20 per menit, /mitra/tickets/validate 60 per menit, endpoint publik 120 per menit per IP.
- Rahasia (server key Midtrans, service role Supabase, API key Gemini) hanya ada di backend.
- Perubahan status hanya lewat jalur pada diagram status (bagian 5.2). Percobaan lain menghasilkan 409 INVALID\_STATUS\_TRANSITION.

### 8.11 Keputusan yang perlu dikonfirmasi

1. Satu akun satu role (Mitra tidak bisa sekaligus memesan sebagai Penyewa dengan akun yang sama).
2. Booking manual tidak dikenai komisi dan tidak masuk saldo Mitra.
3. Pembagian diskon: promo venue ditanggung Mitra, promo global ditanggung platform.
4. Google Calendar cukup memakai tautan, bukan integrasi OAuth penuh.
6. Pencairan dana dan refund boleh disimulasikan (admin menandai selesai manual).

## 9. Autentikasi dan Otorisasi

### 9.1 Pembagian tugas

| Pihak | Tugas |
| --- | --- |
| Supabase Auth | Menyimpan akun, memeriksa kata sandi, login Google dan Facebook, mengirim email verifikasi dan reset, menerbitkan token |
| Backend | Memverifikasi token di setiap request, membaca role dan status dari tabel profiles, menegakkan hak akses |
| Frontend | Menampilkan halaman login, menyimpan sesi lewat supabase-js, mengarahkan pengguna sesuai role. Pengarahan ini hanya kenyamanan, bukan pengamanan |

### 9.2 Metode login

| Metode | Cara | Dipakai oleh | Catatan |
| --- | --- | --- | --- |
| Email dan kata sandi | Supabase Auth, email wajib diverifikasi, kata sandi minimal 8 karakter | Penyewa, Mitra, Admin | Pasang SMTP sendiri karena batas kirim email bawaan Supabase sangat kecil. Ini juga menjadi integrasi Email |
| Google | Provider bawaan Supabase | Penyewa, Mitra | Perlu OAuth client di Google Cloud |
| Facebook | Provider bawaan Supabase | Penyewa | Perlu mode live agar publik bisa masuk. Jika akun Facebook tidak membagikan email, login gagal dan pengguna diminta memakai metode lain |
| Lupa kata sandi | resetPasswordForEmail, tautan mengarah ke halaman /reset-password | Pengguna email | Pesan selalu sama baik email terdaftar maupun tidak, agar akun tidak bisa ditebak |

Aturan tambahan:

- Pembatasan metode per role hanya di tampilan: halaman daftar Mitra hanya menampilkan email dan Google, halaman admin hanya email. Ini bukan pengamanan, pengamanan ada di backend (bagian 9.7).
- Akun dari provider Supabase dengan email terverifikasi yang sama digabung menjadi satu (sejauh yang saya tahu ini perilaku bawaan Supabase). 
- Percobaan login berulang dibatasi oleh rate limit bawaan Supabase Auth.

### 9.3 Pembuatan profil dan penentuan role

1. Setelah login pertama, frontend memanggil POST /auth/sync-profile dengan intendedRole (penyewa atau mitra) sesuai halaman daftar yang dipakai.
2. Backend membuat baris profiles dengan service role. Role admin tidak pernah diterima dari klien.
3. Jika profil sudah ada, intendedRole diabaikan dan backend mengembalikan profil apa adanya. Frontend mengarahkan pengguna sesuai role pada respons. Jika pengguna datang dari halaman daftar Mitra tetapi akunnya Penyewa, frontend menampilkan pesan bahwa akun itu sudah terdaftar sebagai Penyewa dan pengguna perlu memakai email lain (sesuai keputusan satu akun satu role). Role tidak pernah berubah lewat API.
4. Menerima intendedRole mitra dari klien aman karena role itu tidak memberi akses apa pun sampai admin menyetujui (MITRA\_NOT\_VERIFIED).
5. Role dan status selalu dibaca dari tabel profiles, tidak pernah dari isi token. user\_metadata di token bisa diubah oleh penggunanya sendiri, jadi tidak boleh dipercaya untuk hak akses.
6. GET /me mengembalikan role, status akun, dan status verifikasi mitra, dipakai frontend untuk mengarahkan pengguna.
7. Endpoint yang dikecualikan dari pemeriksaan profil (karena dipanggil sebelum profil ada atau tanpa login): /auth/sync-profile, /health, /webhooks/midtrans, dan semua GET publik.

### 9.4 Diagram urutan: login dan request biasa

&#91;embedded content: diagram urutan · login email atau sosial, sinkron profil, lalu request biasa\]

Panah putus-putus adalah balasan. Tiga panah terakhir berlaku untuk setiap request setelah login. Login Google dan Facebook memakai alihan ke penyedia, lalu kembali ke Supabase Auth dengan hasil yang sama: sesi berisi JWT.

### 9.6 Sesi dan token

| Aspek | Aturan |
| --- | --- |
| Access token | Berumur pendek (bawaan Supabase sekitar 1 jam), dikirim lewat header Authorization: Bearer |
| Refresh | Otomatis oleh supabase-js. Jika gagal, pengguna dikembalikan ke halaman login |
| Verifikasi di backend | Tanda tangan JWT diverifikasi secara lokal sesuai jenis kunci proyek Supabase (JWKS atau JWT secret), tanpa panggilan jaringan. Satu query ke profiles per request untuk memuat role dan status |
| Logout | supabase.auth.signOut() |
| Akun diblokir | profiles.status dicek di setiap request tanpa cache, jadi efeknya langsung walau token masih berlaku. Sesi Supabase juga dapat dicabut lewat Admin API sebagai langkah tambahan |
| Penyimpanan token | Di browser lewat supabase-js. Karena memakai header Bearer (bukan cookie), CSRF tidak berlaku, tetapi risiko XSS tetap ada sehingga header CSP dipasang dan semua input disanitasi |
| Webhook Midtrans | Tidak memakai JWT, memakai verifikasi signature |

### 9.7 Pemeriksaan akses di backend

&#91;embedded content: alur pemeriksaan akses di backend · 7 langkah, 6 jalur gagal\]

Setiap endpoint melewati urutan ini. Penerapannya berupa pembungkus route handler di backend/src/middleware, misalnya withAuth dengan daftar role yang diizinkan, yang menyediakan user dan profile ke handler. Langkah 5 hanya berlaku untuk /mitra/\*, dengan pengecualian /mitra/application, /mitra/profile, dan /me.

### 9.8 Matriks akses

| Sumber daya | Publik | Penyewa | Mitra (terverifikasi) | Admin |
| --- | --- | --- | --- | --- |
| Venue dan jadwal aktif | Baca | Baca | Baca | Baca |
| Kelola venue, lapangan, harga | Tidak | Tidak | Milik sendiri | Baca semua, ubah status |
| Booking | Tidak | Milik sendiri | Booking di venue sendiri (baca, batalkan, buat manual) | Baca semua |
| Data penyewa | Tidak | Diri sendiri | Nama dan no. HP pada booking di venue sendiri | Semua |
| Pembayaran dan refund | Tidak | Milik sendiri | Tidak | Semua, memproses refund |
| Tiket | Tidak | Milik sendiri | Validasi untuk venue sendiri | Baca |
| Saldo dan pencairan | Tidak | Tidak | Milik sendiri | Semua, menyetujui |
| Ulasan | Baca | Tulis (booking selesai) | Balas ulasan venue sendiri | Moderasi |
| Notifikasi, favorit, chat AI | Tidak | Milik sendiri | Notifikasi milik sendiri | Notifikasi milik sendiri |
| Master data dan banner | Baca | Baca | Baca | Kelola |
| Promo | Tidak | Memakai kode | Promo venue sendiri | Promo global |
| Pengaturan sistem dan audit log | Tidak | Tidak | Tidak | Kelola |

### 9.9 Pengaturan khusus Admin

- Akun admin dibuat manual lewat seed di database, dan login memakai email dan kata sandi saja di halaman /admin/login.
- Autentikasi dua langkah (TOTP bawaan Supabase) disiapkan sebagai bonus. Jika diaktifkan, backend menolak token admin yang tingkat autentikasinya (aal) belum aal2.
- Semua aksi admin (verifikasi, blokir, refund, pencairan, ubah pengaturan) dan login admin dicatat di audit\_logs.

### 9.10 Pengamanan tambahan

1. **Row Level Security** diaktifkan di semua tabel tanpa kebijakan untuk anon dan authenticated, sehingga akses langsung dari browser selalu ditolak. Backend memakai service role yang tidak terkena RLS.
2. **Kunci rahasia** (service role Supabase, server key Midtrans, API key Gemini) hanya ada di backend dan tidak boleh berawalan NEXT\_PUBLIC\_. Frontend hanya memegang URL Supabase dan anon key lewat variabel berawalan VITE\_.
3. **Storage** memakai dua bucket: venue-photos (baca publik) dan mitra-documents (privat, dibaca admin lewat URL bertanda tangan). Unggahan memakai URL bertanda tangan dari /uploads/sign.
4. **Pusher**: status slot memakai channel publik per lapangan karena tidak memuat data pribadi. Notifikasi pengguna dan pesanan masuk Mitra memakai channel privat (private-user-{id}, private-mitra-{id}) yang diotorisasi lewat POST /pusher/auth, dan backend hanya mengizinkan channel milik pemanggil.
5. **Batas permintaan** pada fungsi serverless tidak bisa memakai penghitung di memori karena tiap instance terpisah. Diperlukan penyimpanan bersama, misalnya Upstash Redis dengan pustaka @upstash/ratelimit.
6. **CORS** hanya mengizinkan domain frontend.

### 9.11 Frontend

- Struktur features/auth berisi AuthProvider, hook useAuth, ProtectedRoute, serta halaman login, daftar, lupa dan reset kata sandi.
- Arah setelah login mengikuti role dari GET /me: Penyewa ke landing page, Mitra ke /mitra (ke halaman status pendaftaran jika belum disetujui), Admin ke /admin. Admin login lewat /admin/login.
- Penjaga rute hanya untuk kenyamanan. Penegakan sebenarnya selalu di backend.

### 9.12 Konfigurasi yang harus disiapkan

- Supabase: Site URL dan daftar Redirect URLs (domain produksi dan localhost), aktifkan konfirmasi email, kata sandi minimal 8 karakter, provider Google dan Facebook, serta SMTP sendiri.
- Google Cloud: OAuth client dengan redirect URI milik Supabase.
- Facebook Developers: aplikasi dengan izin email, dan mode live sebelum demo publik.
- Environment variable backend dan frontend terpisah, masing-masing dengan berkas .env.example.

### 9.13 Keputusan yang perlu dikonfirmasi

2. Mitra boleh melihat nama dan no. HP penyewa pada booking di venue sendiri (usulan: ya).
3. Autentikasi dua langkah untuk admin: bonus atau dilewati.
4. Penyimpanan batas permintaan: Upstash Redis (usulan) atau tabel di database.

## 10. Integrasi Third Party

### 10.1 Peta integrasi

| Integrasi | Dipakai untuk | Di frontend | Di backend | Konfigurasi dan rahasia |
| --- | --- | --- | --- | --- |
| Midtrans | Pembayaran booking, refund | Snap.js membuka popup pembayaran | Membuat transaksi, menerima webhook, mengecek status, memproses refund | Client key di frontend. Server key hanya di backend. Notification URL di dashboard Midtrans |
| Supabase Auth, Google, Facebook | Login dan daftar | supabase-js | Verifikasi token | OAuth client Google dan aplikasi Facebook di dashboard Supabase |
| Email | Verifikasi, reset kata sandi, konfirmasi booking, pembatalan, refund | Tidak ada | Mengirim email transaksional | SMTP untuk Supabase Auth dan API key layanan email di backend |
| Google Maps | Peta venue, pilih lokasi, venue terdekat | Maps JavaScript API | Menyimpan koordinat, menghitung jarak di SQL | API key dibatasi HTTP referrer dan daftar API |
| Google Calendar | Simpan jadwal ke kalender | Membuka tautan | Membuat tautan template | Tanpa kunci |
| YouTube | Video profil venue | Iframe embed | Memvalidasi URL | Tanpa kunci |
| Pusher | Status slot dan pesanan secara real-time | pusher-js | Mengirim event, mengotorisasi channel privat | App key di frontend. Secret hanya di backend |
| Firebase (FCM) | Web push notification | Service worker dan token | Mengirim lewat Firebase Admin SDK | Konfigurasi web dan kunci VAPID di frontend. Service account hanya di backend |
| Google Gemini Flash | Chatbot AI | Tidak ada, hanya memanggil API backend | Memanggil Google Gemini Flash | API key hanya di backend |
| Supabase (database, storage) | Data dan berkas | Unggah ke Storage lewat URL bertanda tangan | Semua akses data | Service role hanya di backend |

### 10.2 Prinsip umum

1. Semua rahasia hanya ada di backend. Frontend hanya memegang kunci publik yang memang dirancang untuk browser.
2. Satu modul per layanan di backend/src/lib (midtrans, pusher, firebase, email, gemini). Route handler dan service tidak memanggil layanan luar secara langsung.
3. Setiap panggilan keluar memakai batas waktu (timeout), dan kegagalannya diubah menjadi kode error yang seragam (misalnya 502 PROVIDER\_ERROR) lengkap dengan requestId di log.
4. Kegagalan layanan non-kritis (email, push notification, Pusher) tidak boleh menggagalkan transaksi. Panggilannya dibungkus try/catch dan hanya dicatat di log.
5. Mode sandbox dan produksi memakai kunci yang terpisah, dipilih lewat environment variable.
6. Nama model AI dan pilihan provider tidak ditulis di kode, melainkan di environment variable dan system\_settings, karena nama model sering berubah.
7. Pengurusan akun yang butuh persetujuan atau penagihan (mode live Facebook, billing Google Maps) dilakukan di minggu pertama.

### 10.3 Midtrans

- **Membuat transaksi.** order\_id unik per percobaan bayar (kode booking ditambah nomor percobaan) dan disimpan di payments.midtrans\_order\_id. gross\_amount sama dengan total\_price. Email di customer\_details hanya diisi jika email asli. Objek expiry pada permintaan Snap diisi sisa waktu sampai expires\_at booking, sehingga halaman Snap dan metode bayar kedaluwarsa bersamaan dengan booking (custom\_expiry hanya untuk Core API, bukan Snap).
- **Frontend.** snap.js membuka popup dengan snapToken dan client key. Sandbox dan produksi memakai alamat skrip serta kunci yang berbeda.
- **Webhook.** URL notifikasi diatur di dashboard Midtrans. Saat pengembangan di komputer lokal, backend perlu diekspos lewat tunnel (misalnya ngrok atau cloudflared). Backend menghitung signature (SHA512 dari order\_id, status\_code, gross\_amount, dan server key), mencocokkannya dengan signature\_key kiriman Midtrans, lalu mengecek ulang status ke API Midtrans. Pemrosesan idempotent lewat webhook\_events. Webhook yang valid selalu dibalas 200, termasuk jika sudah pernah diproses.
- **Kedaluwarsa halaman Snap tidak mengirim webhook** (menurut dokumentasi Midtrans). Karena itu status kedaluwarsa booking tidak boleh menunggu webhook, melainkan dijalankan oleh pg\_cron seperti yang sudah dirancang.
- **Sinkronisasi saat dibuka.** Jika GET /bookings/{id} dipanggil untuk booking menunggu\_bayar yang pembayarannya masih pending dan pengecekan terakhir lebih dari 15 detik lalu, backend mengecek status ke Midtrans. Ini menutup kasus webhook yang terlambat atau tidak sampai.
- **Refund.** Memakai endpoint refund Midtrans dengan refund\_key unik (disimpan di refunds.midtrans\_refund\_key) agar tidak terkirim ganda. Sejauh yang saya baca, refund lewat API tersedia untuk kartu kredit, GoPay, ShopeePay, DANA, OVO, QRIS, Kredivo, dan Akulaku, sedangkan transfer bank (VA) tidak, sehingga admin menandainya selesai secara manual dengan referensi transfer.
- **Pengujian wajib di sandbox:** pembayaran berhasil, gagal, kedaluwarsa, webhook ganda, webhook terlambat setelah booking kedaluwarsa, dan refund.

### 10.4 Google Maps

- **Pemakaian:** peta dengan penanda di detail venue, pemilihan lokasi oleh Mitra (penanda bisa digeser, Places Autocomplete opsional), dan venue terdekat.
- **Venue terdekat** memakai geolokasi browser (dengan izin pengguna) dan jarak dihitung di SQL dari kolom latitude dan longitude. Jika izin ditolak, daftar tetap bisa difilter berdasarkan kota.
- **Biaya.** Maps JavaScript API memerlukan akun penagihan di Google Cloud walau pemakaian masih dalam kuota gratis (sejauh yang saya baca, sekitar 10.000 pemuatan peta per bulan). Kunci dibatasi dengan HTTP referrer dan daftar API, dan batas kuota harian dipasang.
- **Hemat kuota.** Peta dimuat malas (lazy), hanya saat bagian peta terlihat.
- **Pilihan tanpa billing (dipakai).** Peta ditampilkan lewat iframe embed Google Maps (alamat embed tanpa kunci, tidak didokumentasikan resmi sehingga bisa berubah) dan tombol Buka di Google Maps berupa tautan Maps URLs ke koordinat venue. Mitra mengisi latitude dan longitude dengan pratinjau peta. Komponen peta dipisahkan (VenueMap) agar bisa diganti ke Maps JavaScript API nanti.

### 10.5 Google Calendar

GET /bookings/{id}/calendar mengembalikan tautan template Google Calendar (action TEMPLATE) berisi judul (nama venue dan lapangan), waktu mulai dan selesai, lokasi, dan kode booking. Tidak memakai OAuth. Waktu dikirim lengkap dengan zona waktu agar tidak bergeser. Berkas ICS bisa ditambahkan nanti untuk Apple Calendar dan Outlook.

### 10.6 YouTube

Mitra menempelkan tautan video. Backend memvalidasi bahwa host-nya youtube.com atau youtu.be, lalu menyimpan URL yang sudah dinormalisasi di venues.youtube\_url. Frontend mengambil ID video dan menampilkan iframe dari youtube-nocookie.com. Tidak memerlukan API key. Kebijakan CSP mengizinkan frame dari domain tersebut.

### 10.7 Pusher

| Channel | Jenis | Event | Pemicu |
| --- | --- | --- | --- |
| field-{fieldId} | Publik | slot.updated (tanggal, jam, status) | create\_booking, pembatalan, reschedule, pemblokiran slot, confirm\_payment |
| private-user-{userId} | Privat | booking.updated, notification.new | Konfirmasi pembayaran, pembatalan, refund |
| private-mitra-{mitraId} | Privat | booking.created, booking.updated, notification.new | Pesanan masuk, pembayaran, pembatalan, status pencairan |

- Paket gratis Pusher (sandbox) dibatasi sekitar 200 ribu pesan per hari dan 100 koneksi bersamaan. Karena itu frontend membuka koneksi dan berlangganan channel field hanya saat halaman jadwal atau checkout dibuka, dan berhenti berlangganan saat pindah halaman. Landing page tidak membuka koneksi.
- Event dikirim backend setelah transaksi database berhasil, dan kegagalan pengiriman tidak membatalkan transaksi.
- Perubahan yang dilakukan pg\_cron (kedaluwarsa) tidak disiarkan. Frontend memakai expiresAt untuk hitung mundur dan mengambil ulang jadwal secara berkala (polling 30 sampai 60 detik) selama halaman terbuka, sekaligus menjadi cadangan jika Pusher bermasalah.
- Channel privat diotorisasi lewat POST /pusher/auth dan hanya mengizinkan channel milik pemanggil.

### 10.8 Firebase (web push)

1. Frontend mendaftarkan service worker firebase-messaging-sw.js. Izin notifikasi diminta setelah aksi pengguna (misalnya tombol Aktifkan notifikasi), bukan saat halaman dimuat.
2. Token FCM (dengan kunci VAPID) dikirim ke POST /me/push-subscriptions dan disimpan di push\_subscriptions.
3. Backend mengirim lewat Firebase Admin SDK. Service account disimpan sebagai environment variable. Token yang ditolak sebagai tidak terdaftar dihapus dari tabel.
4. Push dikirim untuk: pesanan masuk dan pembatalan (Mitra), pembayaran dikonfirmasi, pembatalan, dan refund diproses (Penyewa), serta status pencairan (Mitra). Isi push hanya ringkasan tanpa data pribadi.
5. Catatan: web push di iOS hanya bekerja jika situs dipasang ke layar utama sebagai PWA, jadi prioritas pengujian ada di Android dan desktop. Notifikasi di dalam aplikasi (Pusher) tetap menjadi jalur utama.

### 10.9 Email

- **Dua jalur.** Email autentikasi (verifikasi, reset kata sandi) dikirim Supabase Auth lewat SMTP sendiri. Email transaksional (konfirmasi booking, pembatalan, refund, status verifikasi Mitra, status pencairan) dikirim backend lewat Brevo (SMTP atau API).
- **Domain pengirim.** Akun Brevo baru perlu disetujui sebelum bisa mengirim, dan alamat pengirim diverifikasi di dalamnya. Sejauh yang saya ketahui, tanpa domain sendiri email tetap bisa dikirim tetapi lebih mudah masuk spam, jadi uji ke beberapa penyedia email. Jika nanti punya domain, atur SPF dan DKIM. Paket gratis menambahkan footer Brevo pada email.
- **Isi.** Template sederhana berbahasa Indonesia dengan kode booking, jadwal, dan tautan ke halaman pesanan. Tidak memuat data sensitif.
- **Kegagalan.** Pengiriman dibungkus try/catch dan dicatat di log. Email ke alamat pengganti (.invalid) dilewati.

### 10.10 Chatbot AI (Google Gemini Flash)

&#91;embedded content: alur chatbot AI · provider utama, cadangan, dan jawaban bawaan\]

Aturannya:

- Sistem menggunakan Google Gemini Flash untuk menghasilkan rekomendasi dan bantuan cerdas berbasis data katalog venue dan promo nyata dari database.
- Jawaban didasarkan pada data nyata: backend mengambil venue dan jadwal yang relevan dari database (hanya baca) dan menyertakannya dalam prompt, sehingga model tidak mengarang lapangan atau harga.
- Prompt sistem berbahasa Indonesia dan membatasi topik pada booking lapangan. Chatbot tidak dapat membuat, mengubah, atau membatalkan pesanan.
- Riwayat yang dikirim ke model dibatasi pada beberapa pesan terakhir. Data pribadi (email, no. HP) tidak dikirim. Menurut halaman harga Google, permintaan pada tier gratis Gemini dapat dipakai untuk meningkatkan produk Google, jadi hal ini penting.
- Input pengguna dianggap tidak tepercaya (risiko prompt injection), sehingga model tidak diberi alat yang bisa mengubah data.
- Batas permintaan 20 per menit per pengguna, panjang pesan dibatasi, dan jawaban tidak di-streaming pada versi pertama.
- Model yang digunakan adalah gemini-flash-latest yang cepat dan responsif dengan integrasi langsung ke data database.

### 10.11 Penanganan kegagalan layanan luar

| Layanan | Jika gagal | Penanganan |
| --- | --- | --- |
| Midtrans (membuat transaksi) | Pembayaran tidak bisa dimulai | Respons 502 PROVIDER\_ERROR. Booking tetap menunggu\_bayar sampai kedaluwarsa dan pengguna bisa mencoba lagi |
| Midtrans (webhook tidak sampai atau terlambat) | Status tidak berubah | Sinkronisasi saat booking dibuka, dan aturan pembayaran terlambat (bagian 8.9) |
| Midtrans (refund) | Refund tertunda | Refund tetap berstatus disetujui dan admin mengulang atau menandainya manual |
| Pusher | Layar tidak terbarui langsung | Transaksi tetap berhasil. Polling berkala menjadi cadangan |
| Firebase | Push tidak terkirim | Dicatat di log. Notifikasi di dalam aplikasi tetap ada |
| Email | Email tidak terkirim | Dicatat di log. Pesanan tidak terpengaruh |
| Google Gemini | Chatbot tidak menjawab | Balasan bawaan ramah dan rekomendasi venue langsung |
| Google Maps | Peta tidak termuat | Menampilkan alamat dan tautan Buka di Google Maps |

### 10.12 Keputusan

1. Google Maps: tanpa akun penagihan. Peta ditampilkan lewat iframe embed dan tombol Buka di Google Maps, Mitra mengisi koordinat dengan pratinjau peta, dan komponen peta dibuat terpisah agar bisa diganti ke Maps JavaScript API jika akun penagihan tersedia nanti.
2. Email: Brevo (SMTP relay, paket gratis 300 email per hari) untuk email autentikasi Supabase dan email transaksional dari backend, dengan satu akun SMTP. Tidak membutuhkan domain sendiri.
3. Sinkronisasi status pembayaran saat booking dibuka: ya.
4. Chatbot: Google Gemini Flash sebagai asisten resmi dengan rekomendasi venue real-time.
5. Web push: Android dan desktop diprioritaskan, iOS sebagai bonus.

