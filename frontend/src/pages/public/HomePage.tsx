import * as React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Button,
  Badge,
  BookingStatusBadge,
  SlotStatusBadge,
  TicketScanResultBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Select,
  Modal,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  useToast,
} from "@/components/ui";
import {
  BookingStatus,
  SlotStatus,
  TicketScanResult,
  formatRupiah,
} from "@futsal/shared";
import { MOCK_VENUES, MOCK_CITIES } from "@/lib/mock-data";

export function HomePage() {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("futsal");
  const [selectedSport, setSelectedSport] = React.useState("semua");

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO BANNER — Sporty Crimson Red (#991B1B) per desain.md */}
      <section className="relative bg-gradient-to-b from-red-800 to-red-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric pattern (No AI slop gradients/blobs) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-100">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garansi 100% Bebas Double Booking dengan Sistem Real-Time Pusher</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Booking Lapangan Futsal & Sepak Bola Jadi Lebih Cepat & Pasti
          </h1>

          <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed">
            Cek ketersediaan jam secara real-time, bayar instan via Midtrans (QRIS, VA, E-Wallet),
            dan check-in mudah di lapangan dengan E-Tiket QR Code.
          </p>
        </div>
      </section>

      {/* 2. FLOATING SEARCH WIDGET — Tiket.com style (-mt-12) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6 space-y-5">
          {/* Pill Tabs Jenis Olahraga */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "semua", label: "Semua Olahraga" },
              { id: "futsal", label: "Futsal" },
              { id: "mini_soccer", label: "Mini Soccer 7 vs 7" },
              { id: "sepak_bola", label: "Sepak Bola Lapangan Besar" },
            ].map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSport === sport.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>

          {/* Form Input Pencarian */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kota / Lokasi</label>
              <Select defaultValue={MOCK_CITIES[0].id}>
                {MOCK_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-bold text-slate-700">Tanggal Main</label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-bold text-slate-700">Nama Venue</label>
              <Input placeholder="Cari nama lapangan..." />
            </div>

            <div className="flex items-end">
              <Link to="/venues" className="w-full">
                <Button variant="primary" size="md" className="w-full h-10 font-semibold gap-2">
                  <Search className="w-4 h-4" />
                  Cari Lapangan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TAHAP 1 SHOWCASE & HEALTH STATUS BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-red-200 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Tahap 1 — Fondasi Siap
                </Badge>
              </div>
              <CardTitle className="text-xl">Setup Monorepo & Design System Sporty Crimson Red</CardTitle>
              <CardDescription>
                Arsitektur monorepo npm workspaces (@futsal/shared, @futsal/backend, @futsal/frontend) telah aktif.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addToast("success", "Sistem bekerja normal. Silakan eksplorasi komponen UI di bawah.", "Status Sistem");
                }}
              >
                Uji Notifikasi Toast
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                Uji Modal Dialog
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 4. KATALOG VENUE POPULER (Gaya tiket.com) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Venue Pilihan & Populer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lapangan berkualitas tinggi dengan fasilitas lengkap dan rating terbaik dari penyewa
            </p>
          </div>
          <Link
            to="/venues"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Lihat Semua Venue →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_VENUES.map((venue) => (
            <Card
              key={venue.id}
              className="overflow-hidden hover:shadow-md hover:border-red-200 transition-all flex flex-col group bg-white border border-slate-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={venue.photos?.[0]?.url}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{venue.ratingAvg}</span>
                    <span className="text-slate-400 font-normal">({venue.reviewCount})</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase">
                    {venue.city?.name}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {venue.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {venue.facilities?.slice(0, 3).map((f: any) => (
                    <span
                      key={f.id}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Mulai dari</span>
                    <span className="text-base font-bold text-red-600 tabular-nums">
                      {formatRupiah(venue.startingPrice || 150000)}{" "}
                      <span className="text-xs text-slate-500 font-normal">/ jam</span>
                    </span>
                  </div>

                  <Link to={`/venues/${venue.slug}`}>
                    <Button variant="primary" size="sm">
                      Pilih Jam
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE DESIGN SYSTEM SHOWCASE (Anti-AI Slop Verification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Design System & Komponen UI (desain.md)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Palet Sporty Crimson Red, Anti-AI Slop (tanpa gradien ungu/neon, tanpa glassmorphism buram)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Pesanan & Gate Scanner Badges</CardTitle>
              <CardDescription>
                Warna semantik jelas dengan ikon status tegas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Booking Status:</p>
                <div className="flex flex-wrap gap-2">
                  <BookingStatusBadge status={BookingStatus.MENUNGGU_BAYAR} />
                  <BookingStatusBadge status={BookingStatus.DIKONFIRMASI} />
                  <BookingStatusBadge status={BookingStatus.DIGUNAKAN} />
                  <BookingStatusBadge status={BookingStatus.SELESAI} />
                  <BookingStatusBadge status={BookingStatus.KEDALUWARSA} />
                  <BookingStatusBadge status={BookingStatus.DIBATALKAN} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Slot Status:</p>
                <div className="flex flex-wrap gap-2">
                  <SlotStatusBadge status={SlotStatus.TERSEDIA} />
                  <SlotStatusBadge status={SlotStatus.DIKUNCI} />
                  <SlotStatusBadge status={SlotStatus.TERISI} />
                  <SlotStatusBadge status={SlotStatus.DIBLOKIR} />
                  <SlotStatusBadge status={SlotStatus.LEWAT} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Gate Scanner Hasil:</p>
                <div className="flex flex-wrap gap-2">
                  <TicketScanResultBadge result={TicketScanResult.SAH} />
                  <TicketScanResultBadge result={TicketScanResult.SUDAH_DIPAKAI} />
                  <TicketScanResultBadge result={TicketScanResult.BELUM_DIBAYAR} />
                  <TicketScanResultBadge result={TicketScanResult.SALAH_WAKTU} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Button Variants Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tombol & Aksi Utama (Button)</CardTitle>
              <CardDescription>
                Primary Red (#DC2626), Outline, Secondary, Danger, dan Loading State
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Pesan Sekarang</Button>
                <Button variant="outline">Lihat Detail</Button>
                <Button variant="secondary">Batal</Button>
                <Button variant="danger">Hapus Slot</Button>
                <Button variant="primary" isLoading>
                  Memproses
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Kecil (sm)
                </Button>
                <Button variant="primary" size="md">
                  Sedang (md)
                </Button>
                <Button variant="primary" size="lg">
                  Besar (lg)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Inputs & Table Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Form Input & Select Kontrol</CardTitle>
              <CardDescription>Garis tepi 1px solid #E2E8F0 dengan focus ring merah</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="Nama Pemesan"
                placeholder="Contoh: Budi Santoso"
                defaultValue="Rizky Ramadhan"
              />
              <Input
                label="Nomor WhatsApp"
                placeholder="08xxxxxxxxxx"
                defaultValue="081234567890"
                helperText="E-tiket dan notifikasi jadwal akan dikirimkan ke nomor ini"
              />
              <Select label="Pilih Kota">
                {MOCK_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tabel Data Ringkas</CardTitle>
              <CardDescription>Tabel transaksi dengan tabular-nums font monospace</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Booking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Bayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-semibold text-xs">FB-8K2M4Q</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={BookingStatus.DIKONFIRMASI} />
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-red-600">
                      Rp 400.000
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-semibold text-xs">FB-7N9X2P</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={BookingStatus.MENUNGGU_BAYAR} />
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-amber-600">
                      Rp 215.000
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Dialog Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Konfirmasi Pesanan Lapangan"
        description="Pastikan tanggal dan jam slot yang dipilih sudah sesuai"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                addToast("success", "Pesanan berhasil dikonfirmasi!", "Berhasil");
              }}
            >
              Lanjutkan ke Pembayaran
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
            <span className="font-bold">Perhatian:</span> Slot jadwal akan dikunci selama 15 menit
            setelah checkout dibuat.
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Venue:</span>
              <span className="font-bold text-slate-800">Spartan Futsal Cilandak</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jadwal:</span>
              <span className="text-slate-800">Kamis, 15 Okt 2026 (19.00 - 21.00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Tagihan:</span>
              <span className="font-bold text-red-600">Rp 400.000</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
