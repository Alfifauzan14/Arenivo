import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  QrCode,
  Search,
  Sparkles,
  Ticket,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  BookingStatusBadge,
  Button,
  Select,
} from "@/components/ui";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import {
  formatRupiah,
  formatDateIndo,
  BookingStatus,
  type Booking,
} from "@futsal/shared";
import { cn } from "@/lib/utils";

export function BookingListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<string>("semua");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [bookings, setBookings] = React.useState<Booking[]>(MOCK_BOOKINGS);

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<Booking[]>("/bookings").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setBookings(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Tabs status booking
  const tabsList = [
    { id: "semua", label: "Semua Status", badge: bookings.length },
    {
      id: BookingStatus.MENUNGGU_BAYAR,
      label: "Menunggu Bayar",
      badge: bookings.filter((b) => b.status === BookingStatus.MENUNGGU_BAYAR).length,
    },
    {
      id: BookingStatus.DIKONFIRMASI,
      label: "Aktif / Dikonfirmasi",
      badge: bookings.filter((b) => b.status === BookingStatus.DIKONFIRMASI).length,
    },
    {
      id: BookingStatus.DIGUNAKAN,
      label: "Sedang Digunakan",
    },
    {
      id: BookingStatus.SELESAI,
      label: "Selesai",
    },
    {
      id: BookingStatus.KEDALUWARSA,
      label: "Kedaluwarsa",
    },
    {
      id: BookingStatus.DIBATALKAN,
      label: "Dibatalkan",
    },
  ];

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab !== "semua" && b.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.bookingCode.toLowerCase().includes(q) ||
          (b.venue?.name || "").toLowerCase().includes(q) ||
          (b.field?.name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery, bookings]);

  return (
    <div className="min-h-screen">
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Riwayat Pesanan & Tiket Saya
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Kelola seluruh pemesanan lapangan olahraga dan akses e-tiket QR secara instan
            </p>
          </div>

          <Link to="/venues" className="shrink-0 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-4 h-4" />}
              className="font-bold text-xs rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white transition-all shadow-xs"
            >
              Cari Lapangan Lagi
            </Button>
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe space-y-6">

        {/* Wide Search & Unified Category Select Filter */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama venue, lapangan, atau kode booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              options={tabsList.map((tab) => ({
                value: tab.id,
                label: `${tab.label}${tab.badge !== undefined && tab.badge > 0 ? ` (${tab.badge})` : ""}`,
              }))}
            />
          </div>
        </div>

        {/* Booking Cards Grid (Kotak-Kotak Seperti Card Lapangan, Solid White) */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const isWaitingPayment = booking.status === BookingStatus.MENUNGGU_BAYAR;
              const isConfirmed = booking.status === BookingStatus.DIKONFIRMASI;
              const isCompleted = booking.status === BookingStatus.SELESAI;
              const isCanceled =
                booking.status === BookingStatus.DIBATALKAN ||
                booking.status === BookingStatus.KEDALUWARSA;

              return (
                <div
                  key={booking.id}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full shadow-xs"
                >
                  {/* 1. Foto Cover Bersih + Status & Kode Booking */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <Link
                      to={
                        isWaitingPayment
                          ? `/checkout/${booking.id}`
                          : isConfirmed || isCompleted
                          ? `/bookings/${booking.id}`
                          : `/venues/${booking.venue?.slug || ""}`
                      }
                      className="block w-full h-full"
                    >
                      <img
                        src={
                          booking.venue?.photos?.[0]?.url ||
                          "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={booking.venue?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Top Bar: Booking Code & Status Badge */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                        {booking.bookingCode}
                      </span>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </div>

                  {/* 2. Body Details (Simple & Rapi Seperti Card Venue) */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {/* Label Lapangan */}
                      <span className="text-xs font-semibold text-slate-400 block truncate">
                        {booking.field?.name || "Lapangan Utama"}
                      </span>

                      {/* Nama Venue */}
                      <Link
                        to={
                          isWaitingPayment
                            ? `/checkout/${booking.id}`
                            : isConfirmed || isCompleted
                            ? `/bookings/${booking.id}`
                            : `/venues/${booking.venue?.slug || ""}`
                        }
                        className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 hover:text-red-600 transition-colors block leading-snug"
                      >
                        {booking.venue?.name}
                      </Link>

                      {/* Jadwal Tanggal & Jam (Simple & Ringkas) */}
                      <p className="text-xs text-slate-600 font-medium tabular-nums pt-0.5 truncate">
                        {formatDateIndo(booking.playStart.split("T")[0], false)} •{" "}
                        {new Date(booking.playStart).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        –
                        {new Date(booking.playEnd).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({booking.totalHours} Jam)
                      </p>

                      {/* Notice for Waiting Payment */}
                      {isWaitingPayment && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">
                          Bayar dalam 15 menit agar slot tidak hangus
                        </p>
                      )}

                      {/* Cancel reason notice if canceled */}
                      {booking.status === BookingStatus.DIBATALKAN && booking.cancelReason && (
                        <p className="text-[11px] text-slate-500 pt-0.5 line-clamp-1">
                          {booking.cancelReason}
                        </p>
                      )}
                    </div>

                    {/* 3. Bottom Area: Total & Tombol Aksi */}
                    <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-500 whitespace-nowrap truncate">
                        <span>Total </span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                          {formatRupiah(booking.totalPrice)}
                        </span>
                      </div>

                      {/* Primary Action Button */}
                      {isWaitingPayment && (
                        <Link to={`/checkout/${booking.id}`} className="shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            className="font-bold text-xs gap-1 shadow-xs bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Bayar
                          </Button>
                        </Link>
                      )}

                      {isConfirmed && (
                        <Link to={`/bookings/${booking.id}`} className="shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            className="font-bold text-xs gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            E-Tiket QR
                          </Button>
                        </Link>
                      )}

                      {isCompleted && (
                        <Link to={`/bookings/${booking.id}`} className="shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold text-xs gap-1 text-slate-700 rounded-lg px-3 py-1.5 shadow-xs"
                          >
                            Detail
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                        </Link>
                      )}

                      {isCanceled && (
                        <Link to={`/venues/${booking.venue?.slug || ""}`} className="shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 shadow-xs"
                          >
                            Pesan Lagi
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Tidak ada pesanan di kategori ini
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda belum memiliki transaksi booking dengan status{" "}
                <span className="font-mono font-semibold">"{activeTab}"</span>.
              </p>
            </div>
            <Link to="/venues">
              <Button variant="primary" size="md" className="font-bold text-xs shadow-xs">
                Jelajahi Lapangan Olahraga
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingListPage;
