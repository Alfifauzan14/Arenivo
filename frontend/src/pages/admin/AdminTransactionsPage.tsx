import * as React from "react";
import {
  Search,
  Filter,
  Eye,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Download,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  BookingStatusBadge,
  Badge,
  Button,
  Select,
  Modal,
  TablePagination,
} from "@/components/ui";
import { MOCK_BOOKINGS, MOCK_PAYMENTS } from "@/lib/mock-data";
import { formatRupiah, formatDateIndo, type Booking } from "@futsal/shared";

export function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const filteredBookings = MOCK_BOOKINGS.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      (b.venue?.name && b.venue.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" || b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPaymentForBooking = (bookingId: string) => {
    return MOCK_PAYMENTS.find((p) => p.bookingId === bookingId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Seluruh Transaksi & Pembayaran Midtrans
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekapitulasi pesanan nasional, verifikasi pembayaran payment gateway, dan bagi hasil komisi platform 10%
        </p>
      </div>

      {/* Unified Filter Toolbar & Main Table Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode booking, nama penyewa, nomor HP, atau venue..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Status (${MOCK_BOOKINGS.length})` },
                  {
                    value: "menunggu_bayar",
                    label: `Menunggu (${MOCK_BOOKINGS.filter((b) => b.status === "menunggu_bayar").length})`,
                  },
                  {
                    value: "dikonfirmasi",
                    label: `Dikonfirmasi (${MOCK_BOOKINGS.filter((b) => b.status === "dikonfirmasi").length})`,
                  },
                  {
                    value: "digunakan",
                    label: `Digunakan (${MOCK_BOOKINGS.filter((b) => b.status === "digunakan").length})`,
                  },
                  {
                    value: "selesai",
                    label: `Selesai (${MOCK_BOOKINGS.filter((b) => b.status === "selesai").length})`,
                  },
                  {
                    value: "kedaluwarsa",
                    label: `Kedaluwarsa (${MOCK_BOOKINGS.filter((b) => b.status === "kedaluwarsa").length})`,
                  },
                  {
                    value: "dibatalkan",
                    label: `Dibatalkan (${MOCK_BOOKINGS.filter((b) => b.status === "dibatalkan").length})`,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Kode & Waktu</TableHead>
                <TableHead className="text-xs">Penyewa & Kontak</TableHead>
                <TableHead className="text-xs">Venue & Lapangan</TableHead>
                <TableHead className="text-xs">Metode Bayar</TableHead>
                <TableHead className="text-xs text-right">Total Transaksi</TableHead>
                <TableHead className="text-xs text-right">Komisi 10%</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((b) => {
                  const payment = getPaymentForBooking(b.id);

                  return (
                    <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-red-600 block">
                          {b.bookingCode}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.createdAt ? formatDateIndo(b.createdAt.split("T")[0]) : "-"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-bold text-xs text-slate-900 block truncate max-w-[150px]">
                          {b.customerName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {b.customerPhone}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-800 font-semibold block truncate max-w-[180px]">
                          {b.venue?.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {b.field?.name}
                        </span>
                      </TableCell>

                      <TableCell>
                        {payment ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono uppercase font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {payment.paymentType || "Midtrans"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {b.source === "manual" ? "Walk-in Tunai" : "Belum Bayar"}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-xs text-slate-900 text-right tabular-nums">
                        {formatRupiah(b.totalPrice)}
                      </TableCell>

                      <TableCell className="font-mono font-semibold text-xs text-red-600 text-right tabular-nums">
                        {formatRupiah(b.platformCommission)}
                      </TableCell>

                      <TableCell>
                        <BookingStatusBadge status={b.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Rincian
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredBookings.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Rincian Transaksi: ${selectedBooking.bookingCode}`}
        >
          {(() => {
            const payment = getPaymentForBooking(selectedBooking.id);

            return (
              <div className="space-y-4 text-xs">
                {/* Status overview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Status Pesanan</span>
                    <div className="mt-1">
                      <BookingStatusBadge status={selectedBooking.status} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Sumber Pesanan</span>
                    <span className="font-mono uppercase font-semibold text-slate-800">
                      {selectedBooking.source === "manual" ? "Manual Mitra" : "Online Web"}
                    </span>
                  </div>
                </div>

                {/* Booking details */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block">Nama Penyewa</span>
                    <p className="font-semibold text-slate-800">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor HP</span>
                    <p className="font-mono text-slate-800">{selectedBooking.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Venue</span>
                    <p className="font-semibold text-slate-800">{selectedBooking.venue?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lapangan</span>
                    <p className="font-semibold text-slate-800">{selectedBooking.field?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Waktu Main</span>
                    <p className="font-mono text-slate-800">
                      {selectedBooking.playStart.split("T")[1].substring(0, 5)} -{" "}
                      {selectedBooking.playEnd.split("T")[1].substring(0, 5)} WIB
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Durasi Main</span>
                    <p className="font-semibold text-slate-800">{selectedBooking.totalHours} Jam</p>
                  </div>
                </div>

                {/* Midtrans Info */}
                {payment && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      Status Gateway Midtrans Snap
                    </span>
                    <p className="text-slate-600">
                      Order ID: <strong className="font-mono">{payment.midtransOrderId}</strong>
                    </p>
                    {payment.midtransTransactionId && (
                      <p className="text-slate-600">
                        Transaction ID:{" "}
                        <strong className="font-mono">{payment.midtransTransactionId}</strong>
                      </p>
                    )}
                    <p className="text-slate-600">
                      Metode:{" "}
                      <strong className="font-mono uppercase">{payment.paymentType}</strong>
                    </p>
                    <p className="text-slate-600">
                      Status Pembayaran:{" "}
                      <strong className="uppercase text-emerald-600">{payment.status}</strong>
                    </p>
                  </div>
                )}

                {/* Financial Breakdown */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Sewa Lapangan ({selectedBooking.totalHours} jam):</span>
                    <span>{formatRupiah(selectedBooking.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan Platform:</span>
                    <span>{formatRupiah(selectedBooking.serviceFee)}</span>
                  </div>
                  {selectedBooking.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Diskon Kode Promo:</span>
                      <span>-{formatRupiah(selectedBooking.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-sm">
                    <span>Total Tagihan Penyewa:</span>
                    <span className="text-red-600">{formatRupiah(selectedBooking.totalPrice)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 text-[11px] space-y-0.5">
                    <div className="flex justify-between text-red-700 font-semibold">
                      <span>Komisi Platform (10%):</span>
                      <span>{formatRupiah(selectedBooking.platformCommission)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Hak Pendapatan Bersih Mitra:</span>
                      <span>{formatRupiah(selectedBooking.mitraAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(null)}
                    className="text-xs"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
