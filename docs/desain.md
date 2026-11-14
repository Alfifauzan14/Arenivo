# Desain Sistem & Panduan UI/UX (desain.md)
**Brand:** Arenivo
**Tagline:** Satu Aplikasi, Banyak Arena. Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.
**Repository GitHub:** https://github.com/Alfifauzan14/Arenivo.git
**Identitas Logo:** Monogram "A" 3D Faceted Crimson Red (#DC2626) menyatu dengan gawang & jaring sepak bola hitam (tersedia varian WebP terkompresi ringan 40 KB, PNG transparan, dan versi inverted untuk dark theme).
**Stack Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS
**Referensi Visual & UX:** tiket.com (Clean OTA Ticketing, High Trust, Scannable)
**Tema Warna Utama:** Sporty Crimson Red (Light Mode First, Anti-AI Slop)

---

## 1. Filosofi Desain & Aturan Anti-AI Slop

Untuk memastikan aplikasi terlihat seperti produk komersial nyata sekelas **tiket.com** dan bebas dari kesan "buatan AI generik" (*AI Slop*), patuhi aturan ketat berikut:

1. **Dilarang Menggunakan Klise Visual AI:**
   - **Tanpa Gradien Ungu/Indigo/Cyberpunk:** Jangan pernah menggunakan `from-indigo-500 via-purple-500 to-pink-500` atau latar belakang gelap bernuansa neon.
   - **Tanpa Glassmorphism Berlebihan:** Hindari `backdrop-blur` di atas latar belakang abstrak yang membuat harga atau jam slot sulit dibaca. Gunakan permukaan putih solid (`bg-white`) dengan garis batas tegas (`border-slate-200`).
   - **Tanpa Bento Grid Kosong:** Setiap kartu dan kotak harus memiliki fungsi nyata (menampilkan foto venue, harga rupiah, status slot, atau metrik laporan).
   - **Tanpa Copywriting Robotik:** Gunakan bahasa Indonesia yang lugas, ringkas, dan natural seperti di tiket.com (contoh: *"Pilih Jam Main"*, *"Menunggu Pembayaran"*, *"Slot dikunci 15 menit"*).
2. **Kejelasan Informasi Transaksional (OTA First):**
   - Latar belakang utama selalu terang (`#F8FAFC` dan `#FFFFFF`) agar kontras status slot jadwal (Tersedia, Dikunci, Terisi, Diblokir) langsung terlihat dalam sekali pandang.
   - Angka rupiah, kode booking, dan penghitung waktu mundur (*countdown* 15 menit) wajib menggunakan `tabular-nums` atau font *monospace* agar tidak bergeser saat berubah.

---

## 2. Palet Warna & Token Tailwind CSS

Karena warna identitas utama adalah **Merah**, pemisahan antara **Merah Brand (Aksi Utama)** dan **Merah Error (Bahaya/Gagal)** diatur secara disiplin melalui *shade*, latar belakang pendamping, dan ikon.

### 2.1 Warna Brand & Permukaan
| Peran Token | Hex | Kelas Tailwind | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Background Utama** | `#F8FAFC` | `bg-slate-50` | Latar halaman aplikasi (Penyewa, Mitra, Admin) |
| **Surface / Card** | `#FFFFFF` | `bg-white` | Kartu venue, kotak jadwal, tabel, modal |
| **Brand Hero / Header** | `#991B1B` | `bg-red-800` | Latar *hero banner* landing page & aksen header tiket |
| **Primary Red (CTA)** | `#DC2626` | `bg-red-600 text-white` | Tombol utama ("Pesan Sekarang", "Bayar"), slot dipilih, tab aktif |
| **Primary Red Hover** | `#B91C1C` | `hover:bg-red-700` | State *hover* pada tombol utama |
| **Primary Soft / Tint** | `#FEF2F2` | `bg-red-50 text-red-700` | *Badge* kategori, latar item menu aktif di sidebar, sorotan harga |
| **Primary Border** | `#FECACA` | `border-red-200` | Garis tepi komponen yang sedang dipilih/aktif |
| **Teks Utama** | `#0F172A` | `text-slate-900` | Judul halaman, nama venue, nominal harga |
| **Teks Sekunder** | `#475569` | `text-slate-600` | Alamat venue, fasilitas, label form |
| **Teks Muted** | `#94A3B8` | `text-slate-400` | Jam yang sudah lewat, teks *placeholder* |
| **Border Default** | `#E2E8F0` | `border-slate-200` | Pembatas kartu, baris tabel, dan input form |

### 2.2 Warna Status Slot Jadwal (Matriks Per Jam)
| Status Slot (`API`) | Visualisasi Tailwind | Keterangan Interaksi |
| :--- | :--- | :--- |
| `tersedia` | `bg-white border-slate-300 text-slate-900 hover:border-red-600 hover:bg-red-50/40` | Bisa diklik untuk dipilih (1 jam atau beberapa jam berurutan) |
| **Dipilih (Lokal UI)** | `bg-red-600 border-red-600 text-white font-semibold shadow-sm` | Slot yang sedang dipilih penyewa sebelum klik Checkout |
| `dikunci` | `bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed` | Sedang dikunci 15 menit oleh pemesan lain (real-time Pusher) |
| `terisi` | `bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed` | Sudah dibooking dan lunas |
| `diblokir` / `lewat` | `bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed` | Diblokir manual oleh Mitra atau waktu sudah lewat |

### 2.3 Warna Badge Status Sistem (Admin, Mitra, & Penyewa)
Semua status di seluruh aplikasi (Penyewa, Mitra, Admin) wajib menggunakan pemetaan warna semantik seragam:

| Kelompok Status | Warna | Token Tailwind | Status Terkait |
| :--- | :--- | :--- | :--- |
| **Aktif / Valid / Berhasil** | **Hijau** | `bg-emerald-50 text-emerald-700 border-emerald-200` (`variant="success"`) | `AKTIF` (Akun, Venue, Promo), `DIKONFIRMASI` (Booking), `SAH` (Tiket Scanner), `DISETUJUI` (Verifikasi Mitra), `DITRANSFER` / `SELESAI` (Payout & Refund), `TAYANG` (Banner), `TERISI` (Slot). |
| **Batal / Blokir / Ditolak / Gagal** | **Merah** | `bg-rose-50 text-rose-700 border-rose-200` (`variant="danger"`) | `DIBATALKAN` / `BATAL` (Booking), `DIBLOKIR` (Akun Penyewa & Mitra, Slot), `DITOLAK` (Verifikasi & Klaim Refund), `KEDALUWARSA` / `EXPIRED`, `TERPAKAI` / `SALAH_VENUE` / `TAK_ADA` (Scanner), `DISEMBUNYIKAN` (Ulasan). |
| **Menunggu / Proses / Dikunci** | **Kuning** | `bg-amber-50 text-amber-800 border-amber-200` (`variant="warning"`) | `MENUNGGU_BAYAR` / `MENUNGGU`, `DIPROSES` / `DIAJUKAN` (Refund & Payout), `DIKUNCI` (Slot checkout 15 menit), `BELUM_DIBAYAR` / `SALAH_WAKTU` (Scanner). |
| **Sedang Berjalan / Main** | **Biru** | `bg-blue-50 text-blue-700 border-blue-200` (`variant="info"`) | `DIGUNAKAN` / `MAIN` (Penyewa sedang bertanding di lapangan). |
| **Netral / Nonaktif / Selesai** | **Abu-abu (Slate)** | `bg-slate-100 text-slate-700 border-slate-200` (`variant="default"`) | `SELESAI` (Booking rampung), `NONAKTIF` (Voucher promo & banner dinonaktifkan), `LEWAT` (Slot jam lewat). |
| **Kosong / Tersedia** | **Putih Border** | `bg-white text-slate-700 border-slate-300` (`variant="neutral"`) | `TERSEDIA` / `KOSONG` (Slot jadwal bebas dipesan). |

---

## 3. Tipografi & Skala Ukuran

- **Font Utama Tunggal Aplikasi:** `Plus Jakarta Sans` (digunakan serentak di seluruh halaman **Penyewa, Mitra, dan Super Admin** tanpa campuran font eksternal lain, untuk memastikan konsistensi visual modern dan rapi).
- **Format Angka & Nilai Tabular:** Menggunakan `Plus Jakarta Sans` dipadukan dengan utility `.tabular-nums` atau `font-mono` (yang dipetakan ke Plus Jakarta Sans) agar angka harga, kode booking, dan jam tetap berbaris rapi tanpa lompatan karakter.

| Elemen | Kelas Tailwind | Penggunaan |
| :--- | :--- | :--- |
| **Hero Title** | `text-2xl md:text-4xl font-bold tracking-tight` | Judul utama di *hero banner* landing page |
| **Page Title (H1)** | `text-xl md:text-2xl font-bold text-slate-900` | Nama venue di halaman detail, judul halaman dashboard |
| **Section Title (H2)** | `text-lg font-semibold text-slate-900` | Judul bagian ("Pilih Lapangan & Jadwal", "Ulasan Penyewa") |
| **Card Title (H3)** | `text-base font-semibold text-slate-900` | Nama venue pada kartu katalog |
| **Harga Utama** | `text-lg font-bold text-red-600 tabular-nums` | Harga sewa per jam atau total tagihan |
| **Body Text** | `text-sm text-slate-600 leading-relaxed` | Deskripsi venue, aturan pembatalan, ulasan |
| **Caption / Badge** | `text-xs font-medium` | Label status, fasilitas, catatan kaki |

---

## 4. Tata Letak, Grid & Responsivitas (3 Role)

Seluruh antarmuka wajib responsif untuk layar HP (`<640px`), tablet (`640px–1024px`), dan laptop (`>1024px`):

1. **Antarmuka Penyewa (Publik):**
   - Kontainer utama: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
   - **Navigasi Atas:** Sticky (`sticky top-0 z-40 bg-white border-b border-slate-200 h-16`).
   - **Mobile Bottom Bar (Halaman Detail Venue & Checkout):** Pada layar HP, kartu ringkasan harga dan tombol merah `"Lanjut ke Pembayaran"` menempel di bagian bawah layar (`fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg`).
2. **Antarmuka Mitra (`/mitra`) & Super Admin (`/admin`):**
   - **Desktop:** Sidebar kiri tetap (`w-64 bg-white border-r border-slate-200`) dengan indikator menu aktif berlatar `bg-red-50 text-red-600 font-semibold border-r-4 border-red-600`. Area konten utama di sebelah kanan (`flex-1 bg-slate-50 p-6`).
   - **Mobile (Penting untuk Mitra di Lapangan):** Sidebar berubah menjadi *drawer* dan dilengkapi *bottom navigation bar* cepat untuk 4 menu paling krusial Mitra: **Dashboard**, **Jadwal**, **Pesanan**, dan **Gate Scanner**.

---

## 5. Spesifikasi Komponen Kunci (`components/ui/` & `features/`)

### 5.1 Floating Search Bar (Gaya tiket.com)
- Ditempatkan melayang di bawah *hero banner* (`-mt-10 relative z-20 bg-white rounded-xl shadow-md border border-slate-200 p-4 md:p-6`).
- Memiliki *pill tabs* di bagian atas untuk memilih jenis olahraga (`Semua`, `Futsal`, `Mini Soccer`, `Sepak Bola`), diikuti baris input **Kota**, **Kata Kunci Venue**, **Tanggal Main**, dan tombol merah penuh **`Cari Lapangan`**.

### 5.2 Venue Card (Katalog Pencarian)
- Kontainer: `bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-red-200 transition-all flex flex-col`.
- **Bagian Atas:** Foto cover (`aspect-[16/10] object-cover`), tombol ikon hati (Favorit) di kanan atas, dan *badge* jenis lapangan di kiri bawah foto.
- **Bagian Tengah:** Nama venue (`line-clamp-1`), kota & jarak km (jika geolokasi aktif), rating bintang kuning beserta jumlah ulasan, dan maksimal 3 *chip* fasilitas.
- **Bagian Bawah (Dipisah garis putus-putus `border-t border-dashed border-slate-200 pt-3`):** Teks kecil `"Mulai dari"` dan harga tegas `Rp 150.000 / jam` berwarna `text-red-600 font-bold`.

### 5.3 Slot Picker Grid (Pemilihan Jam Berurutan)
- Menampilkan tab pemilihan lapangan di atas, diikuti *strip* tanggal horizontal (7 hari terdekat + pemilih kalender maksimal 30 hari ke depan).
- **Aturan Klik Berurutan:** Penyewa dapat memilih 1 slot atau beberapa slot berurutan pada lapangan dan tanggal yang sama. Jika penyewa memilih slot yang tidak berurutan, tampilkan *toast* peringatan atau otomatis mereset pilihan ke jam baru.
- **Indikator Real-time:** Saat event Pusher `slot.updated` diterima pada channel `field-{fieldId}`, slot yang baru dikunci orang lain langsung berubah ke gaya `dikunci` dengan transisi halus tanpa memuat ulang seluruh halaman.

### 5.4 Countdown Banner 15 Menit & Checkout
- Pada halaman `/checkout/:bookingId`, tampilkan *banner* mencolok di bagian paling atas:
  `bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between`.
- Menampilkan waktu mundur menuju `expiresAt` (`14:59`). Jika waktu habis sebelum dibayar, tombol bayar dinonaktifkan dan status otomatis berubah menjadi `kedaluwarsa`.

### 5.5 E-Tiket Digital (Desain Tiket Fisik Modern)
- Mengadopsi bentuk tiket dengan lekukan setengah lingkaran (*perforated notch*) di sisi kiri dan kanan antara bagian informasi venue dan bagian QR Code.
- Header tiket berwarna `bg-red-700 text-white px-6 py-4` memuat nama venue, nama lapangan, dan status `DIKONFIRMASI`.
- Bagian tengah memuat tanggal main, jam mulai–selesai, nama penyewa, dan `bookingCode` dengan font monospace.
- Bagian bawah memuat gambar QR Code berukuran besar dan kontras tinggi di atas latar putih bersih agar mudah dipindai kamera Mitra, dilengkapi tombol **Unduh PDF**, **Simpan ke Google Calendar**, dan **Bagikan**.

### 5.6 Gate Scanner Mitra (`/mitra/scanner`)
- Dirancang dengan tombol dan indikator berukuran besar untuk penggunaan satu tangan di lapangan.
- Wajib memiliki *dropdown* pemilihan **Venue Aktif** di bagian atas (karena tiket hanya sah untuk venue yang sedang dipilih Mitra).
- Ketika QR terpindai atau kode diketik manual, tampilkan kartu hasil berukuran besar dengan warna semantik yang sangat kontras:
  - **HIJAU (`bg-emerald-600 text-white`):** `SAH — Check-in Berhasil` (menampilkan nama penyewa, lapangan, dan jam main).
  - **MERAH TUA (`bg-rose-700 text-white`):** Menampilkan alasan penolakan secara spesifik (`SUDAH DIPAKAI`, `BELUM DIBAYAR`, `SALAH WAKTU (Buka 30 menit sebelum main)`, `SALAH VENUE`, atau `DIBATALKAN / TIDAK DITEMUKAN`).

### 5.7 Widget Chatbot AI (Google Gemini Flash)
- Tombol melayang di kanan bawah (`fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg p-3 sm:px-4 sm:py-3 shadow-sm hover:shadow-md border border-red-700/20 flex items-center gap-2 font-semibold text-xs sm:text-sm`).
- Membuka panel chat ringkas (`w-full sm:w-96 max-h-[85vh] bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col`) dengan *quick replies* berformat `rounded-lg border border-red-200/70 bg-red-50 text-red-700 text-[11px] font-medium` seperti *"Rekomendasi lapangan futsal malam ini"* atau *"Cara reschedule booking"*.

---

## 6. Standar Konsistensi Design System (Aturan Baku Radius, Shadow, Spacing & Interaksi)

Untuk menjaga keseragaman visual di seluruh halaman (Penyewa, Mitra, dan Admin) agar konsisten, rapi, modern, dan bebas dari kesan tidak seragam:

### 6.1 Skala Border Radius Baku
| Kategori Komponen | Nilai Radius | Kelas Tailwind | Komponen |
| :--- | :--- | :--- | :--- |
| **Tombol & Input** | `8px` | `rounded-lg` | Tombol aksi (`Button`), input form (`Input`), dropdown (`Select`), textarea, search bar, filter tabs, dan floating action button (termasuk tombol Asisten AI). |
| **Kartu & Panel** | `12px` | `rounded-xl` | Kartu venue (`VenueCard`), kartu KPI statistik, panel konten, matriks slot jam, kartu ulasan, dan wrapper tabel. |
| **Modal & Container Dialog** | `16px` | `rounded-2xl` | Modal dialog (`Modal`), popover kalender, chat window AI, dan kartu utama autentikasi login/register. |
| **Badge & Chip Status** | `4px – 6px` | `rounded` / `rounded-md` | Badge status pesanan (`BookingStatusBadge`), badge tiket (`TicketScanResultBadge`), tag promo, dan indikator kategori. |
| **Elemen Lingkaran Murni** | `9999px` | `rounded-full` | **HANYA** untuk foto avatar profil pengguna dan lampu titik status (`w-2 h-2`). **Dilarang keras menggunakan `rounded-full` pada tombol teks, kapsul aksi, atau link navigasi.** |

### 6.2 Skala Shadow (Bayangan Halus & Alami)
- **`shadow-xs` / `shadow-sm`:** Digunakan untuk seluruh tombol, input field, kartu informasi, dan dropdown untuk memberikan kesan kedalaman tipis dan rapi.
- **`shadow-md`:** Digunakan maksimal pada popover tanggal, dropdown notifikasi, dan floating chat widget saat aktif.
- **Aturan Ketat:** **Dilarang keras menggunakan `shadow-lg`, `shadow-xl`, atau `shadow-2xl`** yang tebal, gelap, atau berlebihan (*anti-AI slop*) yang membuat kontras visual kotor dan tidak profesional.

### 6.3 Standar Tombol & Interaksi
- **Tombol Utama (Primary CTA):** Selalu menggunakan warna solid merah primer: `bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs active:scale-[0.99] transition-all`.
- **Dilarang Menggunakan Gradien Oranye/Neon:** Tombol aksi tidak boleh menggunakan gradien oranye/merah muda (`from-orange-500 to-rose-700`).
- **Tombol Sekunder / Outline:** `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg shadow-xs`.

### 6.4 Standar Navigasi & Responsivitas Mobile
- **Portal Mitra di Lapangan (`/mitra`):**
  - Dilengkapi *Mobile Bottom Navigation Bar* tetap di bagian bawah layar untuk 4 menu operasional utama: **Dashboard**, **Jadwal**, **Pesanan**, dan **Gate Scanner**.
  - Area konten utama memiliki padding bawah responsif `pb-20 md:pb-8` agar seluruh data tabel dan formulir tidak tertutup bilah navigasi.
- **Portal Penyewa / Publik (`/`):**
  - Drawer navigasi mobile mengadopsi gaya *text-only clean typography* (ala AYO) tanpa kotak ikon ramai.
  - Tautan **Beranda** selalu berada di urutan paling atas, diikuti tautan transaksional, garis pemisah, dan tombol bertumpuk **Masuk** (putih border) & **Daftar** (merah tua `#990011`).

### 6.5 Standar Tombol Aksi & Tabel Baku (Admin & Mitra)
Untuk memastikan antarmuka tabel dan tombol aksi seragam 100% antara Portal Mitra dan Super Admin:

1. **Ukuran & Hierarki Tombol Aksi Tabel:**
   - **Tinggi Kompak:** Selalu gunakan `size="sm"` dengan tinggi tegas `h-7`, padding horizontal `px-2.5` (atau `px-2` jika icon-only), dan teks `text-xs`.
   - **Tombol Detail / Rincian:** `<Button variant="outline" size="sm" className="h-7 px-2.5 text-xs"><Eye className="w-3.5 h-3.5 mr-1" />Detail</Button>`
   - **Tombol Edit:** `<Button variant="outline" size="sm" className="h-7 px-2.5 text-xs"><Edit2 className="w-3.5 h-3.5 mr-1" />Edit</Button>`
   - **Tombol Batal / Tolak:** `<Button variant="danger" size="sm" className="h-7 px-2.5 text-xs"><X className="w-3.5 h-3.5 mr-1" />Batal</Button>`
   - **Tombol Hapus:** `<Button variant="danger" size="sm" className="h-7 px-2 text-xs" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></Button>`
   - **Tombol Setujui / Validasi:** `<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs"><Check className="w-3.5 h-3.5 mr-1" />Setujui</Button>`

2. **Format Sel Kolom Aksi:**
   - Header kolom: `<TableHead className="text-xs text-right">Aksi</TableHead>`
   - Kontainer sel: `<TableCell className="text-right whitespace-nowrap space-x-1">`

3. **Adaptasi Kartu Mobile (Layar HP):**
   - Dilarang menggunakan tag `<button>` mentah tanpa styling baku.
   - Gunakan komponen `<Button size="sm">` dengan `h-7 text-xs` yang rapi di bagian bawah kartu:
     `<div className="pt-2 flex items-center gap-2 border-t border-slate-100">`

### 6.6 Standar Toolbar Filter & Navigasi Kategori (Admin & Mitra)
1. **Penyatuan Filter & Kategori (Bebas Floating Tabs):**
   - Untuk halaman data banyak kategori (seperti *Master Data* dan *Manajemen Konten*), **hindari tabs pill mengambang yang terpisah**.
   - Gunakan satu bilah terpadu (*Unified Filter Toolbar*) di bagian atas kontainer kartu data:
     - **Sisi Kiri:** Input pencarian teks `h-10` dengan ikon `Search` dan tombol clear `X`.
     - **Sisi Kanan:** Dropdown `<Select>` kategori `w-full sm:w-64` yang memuat nama kategori beserta jumlah itemnya, misal: `Daftar Kota (6)`, `Jenis Lapangan (4)`, `Fasilitas Venue (7)`.
2. **Badge Sidebar Ringkas (Clean Counter):**
   - Indikator antrean atau notifikasi pada sidebar admin/mitra hanya berupa angka tabular bersih (`text-xs font-bold tabular-nums ml-auto shrink-0`), tanpa kotak card atau border tambahan yang membuat sidebar penuh.
3. **Penyajian Data Angka & Kolom Tabel:**
   - Kolom yang memuat mata uang rupiah (GMV, Payout, Harga), kota, rating, atau jumlah pesanan wajib menggunakan `whitespace-nowrap tabular-nums font-bold` agar tidak terpotong atau berpindah baris secara canggung di layar tablet atau desktop.


