import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  QrCode,
  Building2,
  Copy,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { formatRupiah, formatCountdown } from "@futsal/shared";
import { cn } from "@/lib/utils";

export interface MidtransSnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  venueName: string;
  fieldName: string;
  totalPrice: number;
  onSuccess: () => void;
  onPending: () => void;
  onExpired: () => void;
}

type PaymentChannel = "qris" | "va_bca" | "va_mandiri";

export function MidtransSnapModal({
  isOpen,
  onClose,
  bookingCode,
  venueName,
  fieldName,
  totalPrice,
  onSuccess,
  onPending,
  onExpired,
}: MidtransSnapModalProps) {
  const { addToast } = useToast();
  const [selectedChannel, setSelectedChannel] = React.useState<PaymentChannel>("qris");
  const [countdown, setCountdown] = React.useState(15 * 60); // 15 menit
  const [copied, setCopied] = React.useState(false);

  // Countdown Timer
  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Lock Body Scroll when Modal is Open
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const vaNumbers = {
    va_bca: "880128912389102",
    va_mandiri: "893010928301928",
  };

  const handleCopyVA = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("success", `Nomor VA "${text}" berhasil disalin ke papan klip.`, "Disalin");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    `MIDTRANS-PAY-${bookingCode}-${totalPrice}`
  )}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe pl-safe pr-safe bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* 1. Header Minimalis */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">Pembayaran Instan</span>
              <span className="text-[10px] text-slate-400 font-mono">Order: {bookingCode}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Total Tagihan & Countdown Ringkas */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Total Pembayaran</span>
            <span className="text-xl font-black font-mono text-red-600 tabular-nums">
              {formatRupiah(totalPrice)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Sisa Waktu
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1 justify-end tabular-nums bg-white border border-slate-200 px-2 py-0.5 rounded-md mt-0.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              {formatCountdown(countdown)}
            </span>
          </div>
        </div>

        {/* 3. Metode Pembayaran Segmented */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedChannel("qris")}
              className={cn(
                "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                selectedChannel === "qris"
                  ? "bg-white text-red-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel("va_bca")}
              className={cn(
                "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                selectedChannel === "va_bca"
                  ? "bg-white text-red-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>BCA VA</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel("va_mandiri")}
              className={cn(
                "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
                selectedChannel === "va_mandiri"
                  ? "bg-white text-red-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Mandiri</span>
            </button>
          </div>

          {/* Konten Channel 1: QRIS */}
          {selectedChannel === "qris" && (
            <div className="flex flex-col items-center text-center space-y-3 py-1">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-xs">
                <img
                  src={qrImageUrl}
                  alt={`QRIS ${bookingCode}`}
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Scan dengan GoPay, OVO, Dana, ShopeePay, atau m-Banking
                </span>
                <p className="text-[11px] text-slate-500">
                  Buka aplikasi e-wallet Anda, arahkan kamera ke kode QR di atas untuk membayar.
                </p>
              </div>
            </div>
          )}

          {/* Konten Channel 2: BCA Virtual Account */}
          {selectedChannel === "va_bca" && (
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Nomor BCA Virtual Account
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                    {vaNumbers.va_bca}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVA(vaNumbers.va_bca)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold text-xs"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Disalin" : "Salin"}</span>
                  </button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <li>Buka BCA mobile &gt; m-Transfer &gt; BCA Virtual Account.</li>
                <li>Masukkan nomor VA di atas.</li>
                <li>Periksa nominal dan selesaikan transaksi.</li>
              </ol>
            </div>
          )}

          {/* Konten Channel 3: Mandiri Bill */}
          {selectedChannel === "va_mandiri" && (
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Nomor Mandiri Bill Payment
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                    {vaNumbers.va_mandiri}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVA(vaNumbers.va_mandiri)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold text-xs"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Disalin" : "Salin"}</span>
                  </button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <li>Buka Livin' by Mandiri &gt; Bayar &gt; Virtual Account.</li>
                <li>Masukkan nomor Mandiri Bill di atas.</li>
                <li>Konfirmasi nominal dan masukkan PIN.</li>
              </ol>
            </div>
          )}

          {/* 4. Tombol Aksi Bersih & Sederhana */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onSuccess}
              className="w-full font-bold text-xs rounded-lg shadow-xs bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Saya Sudah Menyelesaikan Pembayaran</span>
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={onPending}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-medium"
              >
                Bayar Nanti (Simpan ke Pesanan)
              </button>

              <button
                type="button"
                onClick={onExpired}
                className="text-red-600 hover:text-red-700 text-[11px] font-medium"
              >
                Batalkan Transaksi
              </button>
            </div>
          </div>
        </div>

        {/* 5. Footer Keamanan */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Transaksi aman dienkripsi 256-bit SSL oleh Midtrans Gateway</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MidtransSnapModal;
