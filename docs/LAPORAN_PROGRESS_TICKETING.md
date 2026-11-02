# LAPORAN PROGRESS PENGERJAAN PROYEK TICKETING LAPANGAN (ARENIVO)

**Mata Pelajaran:** Proyek Pemrograman Perangkat Bergerak & Web  
**Pengembang:** Alfifauzan  
**Tanggal Laporan:** 2 November 2026  
**Repository GitHub:** [https://github.com/Alfifauzan14/Arenivo.git](https://github.com/Alfifauzan14/Arenivo.git)  
**Tautan Google Spreadsheet (Task List, Perancangan, dan Timeline):**  
[https://docs.google.com/spreadsheets/d/1Sz1lZ6RHFI7kGu2sI_SUO6kATCDTOFdyAa43fdqqJYk/edit](https://docs.google.com/spreadsheets/d/1Sz1lZ6RHFI7kGu2sI_SUO6kATCDTOFdyAa43fdqqJYk/edit)  
**Tautan Google Docs (Laporan Dokumentasi Lengkap & Screenshot Berjudul):**  
[https://docs.google.com/document/d/1QD0b1M18hYbMUAzZzJ1SIGmP_lUcrRCmFnfQfQkcO7U/edit](https://docs.google.com/document/d/1QD0b1M18hYbMUAzZzJ1SIGmP_lUcrRCmFnfQfQkcO7U/edit)

---

## I. Ringkasan & Perancangan Sistem

Platform **Arenivo** adalah sistem *Ticketing & Arena Management* terintegrasi berbasis Web Responsif dan Progressive Web App (PWA) untuk lapangan futsal, mini soccer, dan sepak bola. Platform ini menghubungkan tiga entitas pengguna secara real-time:

### 1. Peran Pengguna (*Multi-Role Access Control*)
1. **Penyewa (Public / Customer):**
   - Menjelajahi katalog arena dengan filter kota, rentang harga sewa, rating bintang, dan jenis lantai (vinyl/rumput).
   - Memilih slot jadwal bermain secara live dengan pencegahan jadwal ganda (*anti double-booking* via Pusher WebSocket).
   - Checkout instan terintegrasi Midtrans Snap API (QRIS, Virtual Account Multi-Bank) dengan countdown batas bayar 15 menit.
   - Penerbitan E-Tiket ber-QR Code terenkripsi, unduh invoice PDF resmi, dan sinkronisasi ke Google Calendar.
2. **Mitra Pengelola Lapangan:**
   - Dashboard operasional okupansi slot harian dan grafik tren omset mingguan.
   - Gate Scanner Kamera di pintu masuk gerbang (validasi tiket real-time via PostgreSQL Stored Procedure `validate_ticket`).
   - Manajemen profil venue, galeri foto fasilitas lapangan via Supabase Storage, dan aturan refund.
   - Matriks kalender jadwal: blokir slot jam pemeliharaan/turnamen dan pencatatan sewa walk-in tunai.
   - Rekapitulasi buku besar keuangan kas, pemotongan komisi platform 10%, dan pengajuan penarikan dana (*payout*).
3. **Super Admin Platform:**
   - Verifikasi berkas legalitas dan pendaftaran mitra arena baru.
   - Pengawasan seluruh transaksi tiket secara nasional.
   - Penanganan persetujuan permohonan pengembalian dana (*refund*) sesuai aturan pembatalan.
   - Audit log keamanan sistem dan pelacakan audit gate scanner.

---

## II. Struktur Lembar Kerja Spreadsheet (8 Tab Acuan Guru)

1. **`ALUR NARASI`**: 34 baris alur operasional mencakup pemesanan penyewa, validasi check-in gerbang mitra, manajemen venue, dan tata kelola platform.
2. **`Diagram`**: Daftar diagram perancangan (ERD 9 Entitas, Usecase Diagram, Activity Diagram Booking & Gate Scanner, Sequence Diagram Payment Callback, dan Arsitektur Web/PWA).
3. **`Third Party`**: Spesifikasi integrasi Midtrans Snap API, Pusher WebSocket, Supabase PostgreSQL/Auth/Storage/RPC, Google Calendar API, dan Google Gemini AI.
4. **`FITUR`**: 10 modul fungsional inti platform dengan format tabel rapi.
5. **`ENTITAS`**: Hirarki kapabilitas dan hak akses untuk Super Admin, Mitra, dan Penyewa.
6. **`Breakdown Back-End`**: 15 tugas arsitektur backend Next.js API Routes, Database RPC, Midtrans Webhook, dan Pusher Channels.
7. **`UI Mobile`**: 47 daftar komponen & antarmuka responsif mobile PWA standar Sporty Crimson Red (`#DC2626`).
8. **`Breakdown Front-End`**: 15 breakdown tugas antarmuka pengguna berbasis React 18, TypeScript, dan Tailwind CSS.

---

## III. Daftar 11 Tangkapan Layar (Screenshot) Antarmuka

Seluruh 11 tangkapan layar antarmuka telah didokumentasikan di Google Docs:
* **Gambar 1:** Halaman Utama (*Landing Page*) & Hero Pencarian Lapangan
* **Gambar 2:** Katalog Lapangan & Filter Cabang Olahraga / Kota (*Explore Page*)
* **Gambar 3:** Detail Profil Venue, Galeri Fasilitas, & Pemilihan Lapangan
* **Gambar 4:** E-Tiket Ber-QR Code Resmi untuk Akses Masuk Gerbang
* **Gambar 5:** Riwayat Pemesanan & Status Transaksi Penyewa
* **Gambar 6:** Halaman Autentikasi Terpadu & Registrasi Pengguna
* **Gambar 7:** Dashboard Operasional & Ringkasan Okupansi Lapangan
* **Gambar 8:** Gate Scanner Kamera Validasi Check-in Tiket QR
* **Gambar 9:** Manajemen Profil Venue & Fasilitas Olahraga Mitra
* **Gambar 10:** Kalender Jadwal, Blokir Slot Perawatan, & Input Booking Walk-in
* **Gambar 11:** Laporan Keuangan, Mutasi Buku Besar, & Pengajuan Payout
