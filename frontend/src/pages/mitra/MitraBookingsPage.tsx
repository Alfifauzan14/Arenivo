import * as React from "react";
import {
  Phone,
  Search,
  AlertTriangle,
  X,
  Eye,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  BookingStatusBadge,
  Modal,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
  useToast,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import {
  formatRupiah,
  formatDateIndo,
  BookingStatus,
  type Booking,
} from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraBookingsPage() {
  const { addToast } = useToast();
  const [bookings, setBookings] = React.useState<Booking[]>([]);

  const loadBookings = React.useCallback(() => {
    let isMounted = true;
    apiClient.get<any[]>("/mitra/bookings").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data)) {
        setBookings(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    loadBookings();
  }, [loadBookings]);
  const [activeTab, setActiveTab] = React.useState<string>("semua");
  const [dateFilter, setDateFilter] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 5;

  // Cancel Booking Modal State
  const [selectedBookingToCancel, setSelectedBookingToCancel] =
    React.useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = React.useState<string>("");

  // Detail Modal State
  const [selectedBookingDetail, setSelectedBookingDetail] =
    React.useState<Booking | null>(null);

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab !== "semua" && b.status !== activeTab) return false;
      if (dateFilter && !b.playStart.startsWith(dateFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.bookingCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q)
        );
      }
      return true;
    });
  }, [bookings, activeTab, dateFilter, searchQuery]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, dateFilter, searchQuery]);

  const paginatedBookings = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  const handleOpenCancelModal = (booking: Booking) => {
    setSelectedBookingToCancel(booking);
    setCancelReason("Perbaikan darurat pada lampu sorot lapangan utama.");
  };

  const handleConfirmCancelByMitra = () => {
    if (!selectedBookingToCancel) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingToCancel.id
          ? {
              ...b,
              status: BookingStatus.DIBATALKAN,
              cancelReason: `Dibatalkan oleh Mitra: ${cancelReason} (Refund 100% penuh + biaya platform)`,
            }
          : b
      )
    );

    addToast(
      "success",
      `Pesanan ${selectedBookingToCancel.bookingCode} dibatalkan. Refund 100% (${formatRupiah(
        selectedBookingToCancel.totalPrice
      )}) diproses otomatis ke penyewa.`,
      "Pembatalan Berhasil"
    );

    setSelectedBookingToCancel(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pesanan Masuk
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Pantau seluruh reservasi online maupun walk-in, hubungi penyewa, atau kelola pembatalan.
        </p>
      </div>

      {/* Unified Filter & Bookings Card */}
      <Card className="bg-white border-slate-200">
        {/* Filter Header: Wide Search + Custom Category Select + Date */}
        <div className="p-3.5 sm:p-4 bg-white rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Wide Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode booking, nama penyewa, atau nomor WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown & Date Picker */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
              <div className="w-full sm:w-48">
                <Select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  options={[
                    { value: "semua", label: `Semua Status (${bookings.length})` },
                    {
                      value: BookingStatus.DIKONFIRMASI,
                      label: `Aktif (${bookings.filter((b) => b.status === BookingStatus.DIKONFIRMASI).length})`,
                    },
                    {
                      value: BookingStatus.MENUNGGU_BAYAR,
                      label: `Menunggu (${bookings.filter((b) => b.status === BookingStatus.MENUNGGU_BAYAR).length})`,
                    },
                    {
                      value: BookingStatus.SELESAI,
                      label: `Selesai (${bookings.filter((b) => b.status === BookingStatus.SELESAI).length})`,
                    },
                    {
                      value: BookingStatus.DIBATALKAN,
                      label: `Batal (${bookings.filter((b) => b.status === BookingStatus.DIBATALKAN).length})`,
                    },
                  ]}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-10 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 w-full sm:w-auto cursor-pointer shadow-xs"
                />
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter("")}
                    className="text-xs font-semibold text-red-600 hover:underline shrink-0 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 (Tidak Berbentuk Tabel Sempit) */}
          <div className="md:hidden divide-y divide-slate-200 border-t border-slate-200">
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((b, idx) => {
                const rowNo = (currentPage - 1) * pageSize + idx + 1;
                const isConfirmed = b.status === BookingStatus.DIKONFIRMASI;
                const cleanPhone = b.customerPhone.replace(/[^0-9]/g, "");
                const waLink = `https://wa.me/62${
                  cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone
                }`;

                return (
                  <div
                    key={b.id}
                    className={cn(
                      "px-4 py-3.5 space-y-2 text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"
                    )}
                  >
                    {/* Header Item: Nomor + Kode Booking & Status */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-red-50 text-red-700 border border-red-100 font-mono text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0">
                          {rowNo}
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {b.bookingCode}
                        </span>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    {/* Daftar Baris Kebawah: Grid 2 Kolom Rata Kiri */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Penyewa</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span className="truncate">{b.customerName}</span>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold shrink-0"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>WA</span>
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-[84px_1fr] items-start gap-2">
                        <span className="text-slate-500">Lapangan</span>
                        <span className="font-medium text-slate-800">
                          {b.field?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Jadwal</span>
                        <span className="font-medium text-slate-700 tabular-nums">
                          {formatDateIndo(b.playStart.split("T")[0], false)} • {b.totalHours} Jam
                        </span>
                      </div>

                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Total</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatRupiah(b.mitraAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Detail & Batal */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBookingDetail(b)}
                        className="flex-1 h-7 text-xs justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail
                      </Button>
                      {isConfirmed && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenCancelModal(b)}
                          className="flex-1 h-7 text-xs justify-center"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 px-4 text-center text-slate-500 text-xs">
                Tidak ada pesanan yang sesuai dengan filter pencarian.
              </div>
            )}
          </div>

          {/* 2. Tampilan Web / Desktop: Tabel Modern Header Merah Soft */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Kode</TableHead>
                  <TableHead className="text-xs">Penyewa</TableHead>
                  <TableHead className="text-xs">Lapangan</TableHead>
                  <TableHead className="text-xs">Jadwal</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((b, idx) => {
                    const rowNo = (currentPage - 1) * pageSize + idx + 1;
                    const isConfirmed = b.status === BookingStatus.DIKONFIRMASI;
                    const cleanPhone = b.customerPhone.replace(/[^0-9]/g, "");
                    const waLink = `https://wa.me/62${
                      cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone
                    }`;

                    return (
                      <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                          {rowNo}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {b.bookingCode}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">
                              {b.customerName}
                            </span>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold hover:bg-emerald-100 shrink-0 leading-none"
                              title="Hubungi WhatsApp"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>WA</span>
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium whitespace-nowrap">
                          {b.field?.name}
                        </TableCell>
                        <TableCell className="font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {formatDateIndo(b.playStart.split("T")[0], false)} • {b.totalHours} Jam
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatRupiah(b.mitraAmount)}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <BookingStatusBadge status={b.status} />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBookingDetail(b)}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Detail
                          </Button>
                          {isConfirmed && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleOpenCancelModal(b)}
                              className="h-7 px-2.5 text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Batal
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                      Tidak ada pesanan yang sesuai dengan filter pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* MODAL: Batalkan Pesanan oleh Mitra */}
      <Modal
        isOpen={!!selectedBookingToCancel}
        onClose={() => setSelectedBookingToCancel(null)}
        title="Batalkan Pesanan oleh Mitra"
      >
        {selectedBookingToCancel && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Kebijakan Pembatalan oleh Mitra</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Pembatalan oleh pihak venue wajib mengembalikan{" "}
                <strong>dana 100% penuh kepada penyewa</strong> (termasuk biaya layanan platform Rp5.000).
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Booking</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {selectedBookingToCancel.bookingCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Penyewa</span>
                <span className="font-semibold text-slate-900">
                  {selectedBookingToCancel.customerName}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-100">
                <span className="text-slate-600 font-medium">Total Refund ke Penyewa</span>
                <span className="font-mono font-bold text-red-600 tabular-nums">
                  {formatRupiah(selectedBookingToCancel.totalPrice)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">
                Alasan Pembatalan (Dikirim ke Penyewa)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Pemadaman listrik darurat atau perbaikan fasilitas lapangan..."
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSelectedBookingToCancel(null)}
                className="flex-1 text-xs"
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleConfirmCancelByMitra}
                className="flex-1 text-xs"
              >
                Batalkan & Refund 100%
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* MODAL: Detail Pesanan Lengkap */}
      <Modal
        isOpen={!!selectedBookingDetail}
        onClose={() => setSelectedBookingDetail(null)}
        title="Rincian Pesanan Masuk"
      >
        {selectedBookingDetail && (
          <div className="space-y-4 text-xs">
            {/* Header Status & Code */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                  Kode Booking
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-red-600">
                  {selectedBookingDetail.bookingCode}
                </span>
              </div>
              <BookingStatusBadge status={selectedBookingDetail.status} />
            </div>

            {/* Penyewa & Lapangan */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nama Penyewa</span>
                <span className="font-semibold text-slate-900">{selectedBookingDetail.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nomor WhatsApp</span>
                <a
                  href={`https://wa.me/62${selectedBookingDetail.customerPhone.replace(/[^0-9]/g, "").replace(/^0/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {selectedBookingDetail.customerPhone}
                </a>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500">Venue & Lapangan</span>
                <span className="font-medium text-slate-900 text-right">
                  {selectedBookingDetail.venue?.name} • {selectedBookingDetail.field?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jadwal Main</span>
                <span className="font-medium text-slate-800">
                  {formatDateIndo(selectedBookingDetail.playStart.split("T")[0], false)} ({selectedBookingDetail.totalHours} Jam)
                </span>
              </div>
            </div>

            {/* Rincian Finansial */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Transaksi Penyewa</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(selectedBookingDetail.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Biaya Platform (10%)</span>
                <span className="font-mono text-red-600">
                  -{formatRupiah(selectedBookingDetail.platformCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800">Pendapatan Bersih Mitra (90%)</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatRupiah(selectedBookingDetail.mitraAmount)}
                </span>
              </div>
            </div>

            {selectedBookingDetail.cancelReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                <span className="font-bold block mb-0.5">Alasan Pembatalan:</span>
                <p className="text-[11px] leading-relaxed">{selectedBookingDetail.cancelReason}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSelectedBookingDetail(null)}
                className="w-full text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MitraBookingsPage;
