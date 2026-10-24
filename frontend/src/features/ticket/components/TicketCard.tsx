import * as React from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { BookingStatusBadge, useToast } from "@/components/ui";
import {
  formatDateIndo,
  formatRupiah,
  type Booking,
  type Ticket,
} from "@futsal/shared";
import { cn } from "@/lib/utils";

export interface TicketCardProps {
  booking: Booking;
  ticket?: Ticket;
  className?: string;
}

/**
 * TicketCard
 * Desain E-Tiket Resmi minimalis, bersih, dan simple tanpa kotak-kotak berlebih.
 */
export function TicketCard({ booking, ticket, className }: TicketCardProps) {
  const { addToast } = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const ticketCode = ticket?.ticketCode || `TKT-${booking.bookingCode}-9A2`;
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
    ticketCode
  )}`;

  const handleCopy = (code: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(label);
      addToast("success", `${label} "${code}" berhasil disalin.`, "Disalin");
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div
      id="printable-ticket"
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden max-w-xl mx-auto",
        className
      )}
    >
      {/* 1. Header Tiket: Merah Simple & Bersih */}
      <div className="bg-red-800 text-white px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <span className="text-[10px] text-red-200 font-bold uppercase tracking-wider block">
            E-Tiket Masuk Resmi
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
            {booking.venue?.name || "Spartan Futsal Arena"}
          </h2>
          <p className="text-xs text-red-100 truncate">
            {booking.field?.name || "Lapangan Utama"}
          </p>
        </div>
        <div className="shrink-0">
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* 2. Isi Tiket: Daftar Baris Rapi di Kiri + QR Code di Kanan (Tanpa Kotak-Kotak) */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-white">
        {/* Rincian Data (Baris 1 per 1 Rata Kiri) */}
        <div className="sm:col-span-7 space-y-2.5 text-xs">
          <div className="grid grid-cols-[95px_1fr] items-center gap-2">
            <span className="text-slate-500">Tanggal</span>
            <span className="font-semibold text-slate-900">
              {formatDateIndo(booking.playStart.split("T")[0], false)}
            </span>
          </div>

          <div className="grid grid-cols-[95px_1fr] items-center gap-2">
            <span className="text-slate-500">Jam Main</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {new Date(booking.playStart).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {new Date(booking.playEnd).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB ({booking.totalHours} Jam)
            </span>
          </div>

          <div className="grid grid-cols-[95px_1fr] items-center gap-2">
            <span className="text-slate-500">Penyewa</span>
            <span className="font-semibold text-slate-900 truncate">
              {booking.customerName || "Rizky Ramadhan"}
            </span>
          </div>

          <div className="grid grid-cols-[95px_1fr] items-center gap-2">
            <span className="text-slate-500">Total Biaya</span>
            <span className="font-mono font-bold text-red-600 tabular-nums">
              {formatRupiah(booking.totalPrice)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="grid grid-cols-[95px_1fr] items-center gap-2">
              <span className="text-slate-500">Kode Booking</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">
                  {booking.bookingCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(booking.bookingCode, "Kode Booking")}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Salin Kode Booking"
                >
                  {copiedCode === "Kode Booking" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[95px_1fr] items-center gap-2">
              <span className="text-slate-500">No. E-Tiket</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">
                  {ticketCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(ticketCode, "Nomor Tiket")}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Salin Nomor Tiket"
                >
                  {copiedCode === "Nomor Tiket" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: QR Code Simple */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center sm:border-l border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 sm:pl-4 text-center space-y-1.5">
          <img
            src={qrDataUrl}
            alt={`QR Code ${ticketCode}`}
            className="w-32 h-32 object-contain rounded-lg border border-slate-200 p-1.5 bg-white"
            loading="lazy"
          />
          <span className="text-[11px] font-bold text-slate-900 block">
            Scan QR di Gate Masuk
          </span>
        </div>
      </div>

      {/* 3. Footer Singkat */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Tiket Resmi Terverifikasi Bebas Double Booking</span>
      </div>
    </div>
  );
}

export default TicketCard;
