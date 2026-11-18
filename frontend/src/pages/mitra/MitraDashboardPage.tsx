import * as React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  DollarSign,
  Plus,
  QrCode,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Search,
  X,
  Eye,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  BookingStatusBadge,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@/components/ui";
import { LoadingSkeleton } from "@/components/common/LoadingStates";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatDateIndo, BookingStatus } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraDashboardPage() {
  const [balance, setBalance] = React.useState<any>(null);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [venues, setVenues] = React.useState<any[]>([]);
  const [todayOccupancy, setTodayOccupancy] = React.useState<any[]>([]);
  const [todayBookingsCount, setTodayBookingsCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  // UI state hooks - MUST be before any early return
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("semua");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 4;

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient.get<any>("/mitra/dashboard").then((res) => {
      if (isMounted && res.data) {
        if (res.data.balance) setBalance(res.data.balance);
        if (typeof res.data.todayBookingsCount === "number") {
          setTodayBookingsCount(res.data.todayBookingsCount);
        }
        if (Array.isArray(res.data.recentBookings) && res.data.recentBookings.length > 0) {
          setBookings(res.data.recentBookings);
        }
        if (Array.isArray(res.data.todayOccupancy)) {
          setTodayOccupancy(res.data.todayOccupancy);
        }
      }
    }).catch(() => {});

    apiClient.get<any>("/mitra/balance").then((res) => {
      if (isMounted && res.data) {
        setBalance((prev: any) => prev && prev.saldoTotal > 0 ? prev : res.data);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/mitra/venues").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setVenues(res.data);
      }
    }).catch(() => {}).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // All hooks BEFORE early return
  // Fallback jika balance belum ter-load
  const currentBalance = balance || { saldoTotal: 0, saldoTertahan: 0, saldoBisaDicairkan: 0 };

  // Compute occupancy stats from real API data
  const allSlots = React.useMemo(() => {
    return todayOccupancy.flatMap((field: any) => 
      (field.slots || []).map((slot: any) => ({
        ...slot,
        fieldName: field.fieldName,
        venueName: field.venueName,
      }))
    );
  }, [todayOccupancy]);

  const totalSlotsToday = allSlots.length;
  const occupiedSlotsToday = allSlots.filter((s: any) => s.status === "terisi" || s.status === "dikunci").length;
  const occupancyPercentage = totalSlotsToday > 0 ? Math.round((occupiedSlotsToday / totalSlotsToday) * 100) : 0;

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "semua" && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.bookingCode.toLowerCase().includes(q) ||
          (b.field?.name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const paginatedBookings = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Ringkasan performa harian dan okupansi {venues[0]?.name || "Venue Olahraga"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <Link to="/mitra/jadwal" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs">
              <Plus className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Walk-in</span>
            </Button>
          </Link>
          <Link to="/mitra/scanner" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full justify-center gap-1.5 text-xs">
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Gate Scanner</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              Pesanan Hari Ini
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {todayBookingsCount ??
                bookings.filter(
                  (b) =>
                    b.status === BookingStatus.DIKONFIRMASI ||
                    b.status === BookingStatus.SELESAI
                ).length}
            </span>
            <span className="text-[11px] font-medium text-emerald-700">
              Hari Ini
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Dikonfirmasi & selesai hari ini</p>
        </Card>

        <Card className="p-3.5 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              Okupansi Hari Ini
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {occupancyPercentage}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              ({occupiedSlotsToday}/{totalSlotsToday})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-red-600 h-1.5 rounded-full transition-all"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              Total Saldo
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <span className="text-base sm:text-2xl font-bold font-mono text-slate-900 tabular-nums block truncate">
              {formatRupiah(currentBalance.saldoTotal)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Pendapatan bersih mitra</p>
        </Card>

        <Card className="p-3.5 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              Siap Dicairkan
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <span className="text-base sm:text-2xl font-bold font-mono text-red-600 tabular-nums block truncate">
              {formatRupiah(currentBalance.saldoBisaDicairkan)}
            </span>
          </div>
          <div className="mt-1">
            <Link
              to="/mitra/keuangan"
              className="text-[11px] text-red-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Tarik Saldo →
            </Link>
          </div>
        </Card>
      </div>

      {/* 2. Okupansi Jam Bermain Hari Ini */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm sm:text-base">
              Status Jam Operasional (07:00 – 23:00 WIB)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Pantau ketersediaan jam bermain hari ini (real-time)
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Terisi/Dikunci
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Diblokir
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300" /> Kosong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" /> Lewat
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-4">
          {todayOccupancy.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada data okupansi (belum ada lapangan aktif)
            </div>
          ) : (
            <div className="space-y-3">
              {todayOccupancy.map((field: any) => (
                <div key={field.fieldId} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800">{field.fieldName}</span>
                    <span className="text-[11px] text-slate-500">{field.venueName}</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-1.5">
                    {(field.slots || []).map((slot: any) => {
                      const isOccupied = slot.status === "terisi" || slot.status === "dikunci";
                      const isBlocked = slot.status === "diblokir";
                      const isPast = slot.status === "lewat";
                      return (
                        <div
                          key={slot.hour}
                          className={`p-1.5 rounded border text-center transition-colors ${
                            isOccupied
                              ? "bg-red-50 border-red-200 text-red-700"
                              : isBlocked
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : isPast
                              ? "bg-slate-50 border-slate-200 text-slate-400"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="block font-mono text-[10px] font-bold tabular-nums">
                            {slot.timeLabel}
                          </span>
                          <span className="block text-[9px] font-semibold mt-0.5">
                            {isOccupied ? "Terisi" : isBlocked ? "Blokir" : isPast ? "Lewat" : "Kosong"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Pesanan Masuk Terkini (Unified Modern Table + Wide Search & Select) */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 space-y-3 rounded-t-xl">
          <div className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Pesanan Masuk Terkini</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Reservasi terbaru pada venue Anda
              </CardDescription>
            </div>
            <Link
              to="/mitra/pesanan"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5 shrink-0"
            >
              <span>Kelola Semua</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Wide Search & Status Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama penyewa, kode booking, atau lapangan..."
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

            <div className="w-full sm:w-48 shrink-0">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "semua", label: `Semua Status (${bookings.length})` },
                  { value: BookingStatus.DIKONFIRMASI, label: "Aktif" },
                  { value: BookingStatus.MENUNGGU_BAYAR, label: "Menunggu" },
                  { value: BookingStatus.SELESAI, label: "Selesai" },
                  { value: BookingStatus.DIBATALKAN, label: "Batal" },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 */}
          <div className="md:hidden divide-y divide-slate-200">
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((b, idx) => {
                const rowNo = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <div
                    key={b.id}
                    className={cn(
                      "px-4 py-3.5 space-y-2 text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"
                    )}
                  >
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

                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Penyewa</span>
                        <span className="font-semibold text-slate-900">
                          {b.customerName}
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-start gap-2">
                        <span className="text-slate-500">Lapangan</span>
                        <span className="font-medium text-slate-800">
                          {b.field?.name || b.fields?.name || b.fieldName || "-"}
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

                    <div className="pt-2 border-t border-slate-100">
                      <Link to="/mitra/pesanan" className="block w-full">
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs justify-center">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Detail Pesanan
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                Tidak ada pesanan yang cocok dengan pencarian.
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
                    return (
                      <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                          {rowNo}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {b.bookingCode}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {b.customerName}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium whitespace-nowrap">
                          {b.field?.name || b.fields?.name || b.fieldName || "-"}
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
                        <TableCell className="text-right whitespace-nowrap">
                          <Link to="/mitra/pesanan">
                            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada pesanan yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MitraDashboardPage;
