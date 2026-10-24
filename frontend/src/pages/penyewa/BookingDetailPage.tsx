import * as React from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  Input,
  useToast,
} from "@/components/ui";
import { MOCK_BOOKINGS, MOCK_VENUES, MOCK_TICKETS } from "@/lib/mock-data";
import {
  formatRupiah,
  formatDateIndo,
  BookingStatus,
  type Booking,
} from "@futsal/shared";
import { TicketCard } from "@/features/ticket/components/TicketCard";
import { cn } from "@/lib/utils";

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isPaymentSuccess = searchParams.get("status") === "success";

  // 1. Resolve Booking dari ID atau default
  const [booking, setBooking] = React.useState<Booking>(() => {
    return MOCK_BOOKINGS.find((b) => b.id === id) || MOCK_BOOKINGS[0];
  });

  const ticket = MOCK_TICKETS.find((t) => t.bookingId === booking.id) || MOCK_TICKETS[0];

  // 2. Modals State
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState<boolean>(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState<boolean>(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = React.useState<boolean>(false);

  // Form Reschedule State
  const [newDate, setNewDate] = React.useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  );
  const [newStartHour, setNewStartHour] = React.useState<number>(19);

  // Review Form State
  const [rating, setRating] = React.useState<number>(5);
  const [comment, setComment] = React.useState<string>("");
  const [hasReviewed, setHasReviewed] = React.useState<boolean>(false);

  // 3. Business Rule Checks
  const now = new Date();
  const playStartTime = new Date(booking.playStart);
  const hoursUntilPlay = (playStartTime.getTime() - now.getTime()) / (1000 * 3600);

  // Reschedule eligible: status dikonfirmasi, rescheduleCount === 0, >24 jam
  const canReschedule =
    booking.status === BookingStatus.DIKONFIRMASI &&
    (booking.rescheduleCount || 0) === 0 &&
    hoursUntilPlay > 24;

  // Refund eligibility estimate
  const refundPercent = hoursUntilPlay > 24 ? 100 : hoursUntilPlay >= 6 ? 50 : 0;
  const estimatedRefundAmount = Math.round((booking.subtotal * refundPercent) / 100);

  // Can cancel: status dikonfirmasi atau menunggu_bayar
  const canCancel =
    booking.status === BookingStatus.DIKONFIRMASI ||
    booking.status === BookingStatus.MENUNGGU_BAYAR;

  // Can review: status selesai & belum diulas
  const canReview = booking.status === BookingStatus.SELESAI && !hasReviewed;

  // 4. Action Handlers
  const handlePrintPdf = () => {
    window.print();
  };

  const handleSaveToGoogleCalendar = () => {
    const title = encodeURIComponent(`Futsal di ${booking.venue?.name || "Venue Lapangan"}`);
    const details = encodeURIComponent(
      `Pemesanan Lapangan ${booking.field?.name}.\nKode Booking: ${booking.bookingCode}\nNomor Tiket: ${ticket.ticketCode}`
    );
    const location = encodeURIComponent(booking.venue?.address || "");

    // Format ISO string to YYYYMMDDTHHMMSSZ for Google Calendar
    const startIso = new Date(booking.playStart).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(booking.playEnd).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("success", "Tautan tiket berhasil disalin ke papan klip!", "Berhasil Bagikan");
    } else {
      addToast("info", window.location.href, "Tautan Tiket");
    }
  };

  const handleConfirmReschedule = () => {
    const endHour = newStartHour + booking.totalHours;
    const padStart = String(newStartHour).padStart(2, "0");
    const padEnd = String(endHour).padStart(2, "0");

    setBooking((prev) => ({
      ...prev,
      playStart: `${newDate}T${padStart}:00:00+07:00`,
      playEnd: `${newDate}T${padEnd}:00:00+07:00`,
      rescheduleCount: (prev.rescheduleCount || 0) + 1,
    }));

    setIsRescheduleOpen(false);
    addToast(
      "success",
      `Jadwal berhasil diubah ke ${formatDateIndo(newDate)} jam ${padStart}.00 - ${padEnd}.00 WIB.`,
      "Reschedule Berhasil"
    );
  };

  const handleConfirmCancel = () => {
    setBooking((prev) => ({
      ...prev,
      status: BookingStatus.DIBATALKAN,
      cancelReason: `Dibatalkan oleh penyewa (${refundPercent}% refund diajukan)`,
    }));

    setIsCancelOpen(false);
    addToast(
      "info",
      `Pesanan dibatalkan. Pengajuan refund sebesar ${formatRupiah(
        estimatedRefundAmount
      )} sedang diproses.`,
      "Pesanan Dibatalkan"
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast("warning", "Tuliskan sedikit ulasan atau komentar pengalaman Anda.", "Ulasan Kosong");
      return;
    }

    setHasReviewed(true);
    setIsReviewOpen(false);
    addToast("success", "Terima kasih! Ulasan dan rating Anda telah berhasil dikirim.", "Ulasan Terkirim");
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 pb-keyboard-safe pb-safe">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Banner Pembayaran Berhasil (Saat baru selesai bayar di Midtrans) */}
        {isPaymentSuccess && (
          <div className="max-w-xl mx-auto p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-3.5 text-xs text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2 no-print">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-emerald-950">Pembayaran Berhasil Dikonfirmasi!</h4>
              <p className="text-emerald-800">
                E-Tiket resmi Anda telah aktif. Cukup tunjukkan kode QR di bawah ke petugas saat tiba di lapangan.
              </p>
            </div>
          </div>
        )}

        {/* Top Sub-Navigation */}
        <div className="max-w-xl mx-auto flex items-center justify-between no-print text-xs">
          <Link
            to="/pesanan"
            className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pesanan
          </Link>
        </div>

        {/* 1. Ticket Card Display (Simple & Ramping) */}
        <div>
          <TicketCard booking={booking} ticket={ticket} />
        </div>

        {/* 2. Action Buttons Group (Simple Baris Sejajar) */}
        <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrintPdf}
            className="justify-center gap-1.5 text-xs rounded-lg border-slate-200 bg-white hover:border-red-600 text-slate-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span>Unduh PDF</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveToGoogleCalendar}
            className="justify-center gap-1.5 text-xs rounded-lg border-slate-200 bg-white hover:border-red-600 text-slate-700 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Cal</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsInvoiceOpen(true)}
            className="justify-center gap-1.5 text-xs rounded-lg border-slate-200 bg-white hover:border-red-600 text-slate-700 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Invoice</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="justify-center gap-1.5 text-xs rounded-lg border-slate-200 bg-white hover:border-red-600 text-slate-700 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bagikan</span>
          </Button>
        </div>

        {/* 3. Conditional Management Actions (Reschedule, Cancel, Review) */}
        <div className="max-w-xl mx-auto space-y-3 pt-1 no-print">
          {/* Tombol Reschedule */}
          {canReschedule ? (
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Ingin Mengubah Jadwal?</span>
                <span className="text-[11px] text-slate-500">
                  Tersedia 1x kesempatan reschedule gratis (&gt;24 jam).
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRescheduleOpen(true)}
                className="gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-50 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule
              </Button>
            </div>
          ) : (
            booking.status === BookingStatus.DIKONFIRMASI && (
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Reschedule tidak tersedia (hanya berlaku &gt;24 jam sebelum main dan maks. 1 kali).
                </span>
              </div>
            )
          )}

          {/* Tombol Tulis Ulasan jika selesai */}
          {canReview && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsReviewOpen(true)}
              className="w-full gap-2 font-bold shadow-xs"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Beri Rating & Ulasan Pengalaman</span>
            </Button>
          )}

          {/* Tombol Batalkan Pesanan */}
          {canCancel && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:underline font-semibold cursor-pointer"
              >
                Batalkan Pesanan Ini
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: Invoice / Bukti Pembayaran */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Bukti Pembayaran / Invoice Resmi"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Invoice:</span>
              <span className="font-mono font-bold text-slate-900">
                INV-{booking.bookingCode}-2026
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Pembayaran:</span>
              <span className="font-mono text-slate-800">
                {formatDateIndo(booking.createdAt?.split("T")[0] || "2026-10-15")} 08:35 WIB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Bayar:</span>
              <span className="font-semibold text-slate-800">Midtrans QRIS (GoPay/BCA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Pembayaran:</span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                LUNAS (Settlement)
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-600">Sewa Lapangan ({booking.totalHours} Jam):</span>
              <span className="font-mono">{formatRupiah(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Biaya Layanan Platform:</span>
              <span className="font-mono">{formatRupiah(booking.serviceFee)}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Diskon Promo:</span>
                <span className="font-mono">-{formatRupiah(booking.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Dibayar:</span>
              <span className="font-mono text-red-600">{formatRupiah(booking.totalPrice)}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen invoice ini sah diterbitkan otomatis oleh sistem Arenivo.</span>
          </div>
        </div>
      </Modal>

      {/* 5. MODAL: Reschedule Jadwal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Ubah Jadwal Main (Reschedule)"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
            <span className="font-bold block">Ketentuan Reschedule:</span>
            <p className="text-[11px] leading-relaxed">
              Reschedule hanya berlaku 1 kali pada lapangan yang sama dengan durasi dan tarif yang setara.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Pilih Tanggal Baru:</label>
            <input
              type="date"
              value={newDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 shadow-xs font-mono text-xs focus:ring-1 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Pilih Jam Mulai Baru:</label>
            <select
              value={newStartHour}
              onChange={(e) => setNewStartHour(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-lg border border-slate-200 shadow-xs font-mono text-xs focus:ring-1 focus:ring-red-600 focus:border-red-600"
            >
              <option value={10}>10.00 – {10 + booking.totalHours}.00 WIB</option>
              <option value={14}>14.00 – {14 + booking.totalHours}.00 WIB</option>
              <option value={16}>16.00 – {16 + booking.totalHours}.00 WIB</option>
              <option value={19}>19.00 – {19 + booking.totalHours}.00 WIB (Slot Rekomendasi)</option>
              <option value={21}>21.00 – {21 + booking.totalHours}.00 WIB</option>
            </select>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsRescheduleOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmReschedule}
              className="flex-1 text-xs font-bold shadow-xs"
            >
              Simpan Jadwal Baru
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. MODAL: Batalkan Pesanan & Pratinjau Refund */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Konfirmasi Pembatalan & Estimasi Refund"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Apakah Anda yakin ingin membatalkan pesanan ini?</span>
            </div>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Slot lapangan akan langsung dibuka untuk penyewa lain.
            </p>
          </div>

          {/* Rincian Refund */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="font-bold text-slate-800 block text-xs">
              Pratinjau Pengembalian Dana (Refund)
            </span>

            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Sebelum Main:</span>
              <span className="font-mono font-bold text-slate-800">
                {Math.max(0, Math.round(hoursUntilPlay))} Jam Lagi
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Persentase Refund Aturan:</span>
              <span
                className={cn(
                  "font-bold font-mono",
                  refundPercent === 100
                    ? "text-emerald-600"
                    : refundPercent === 50
                    ? "text-amber-600"
                    : "text-red-600"
                )}
              >
                {refundPercent}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Biaya Layanan Platform:</span>
              <span className="font-mono text-slate-500">Tidak dapat dikembalikan</span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Dana Dikembalikan:</span>
              <span className="font-mono text-emerald-600">
                {formatRupiah(estimatedRefundAmount)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCancelOpen(false)}
              className="flex-1 text-xs"
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
              className="flex-1 text-xs font-bold shadow-xs"
            >
              Konfirmasi Batalkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. MODAL: Tulis Ulasan & Rating */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Ulasan & Penilaian Bermain"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div className="space-y-2 text-center">
            <span className="text-slate-600 block">Bagaimana kualitas lapangan & pelayanan venue?</span>
            {/* 1-5 Star Picker */}
            <div className="flex items-center justify-center gap-1.5 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                >
                  <Star
                    className={cn(
                      "w-7 h-7 transition-colors",
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-amber-600 font-bold">
              {rating === 5
                ? "Sangat Puas (Bintang 5)"
                : rating === 4
                ? "Puas (Bintang 4)"
                : rating === 3
                ? "Cukup (Bintang 3)"
                : "Kurang Puas"}
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">Tulis Ulasan Anda:</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan kondisi lantai, pencahayaan, kebersihan ruang ganti, dll..."
              className="w-full p-2.5 rounded-lg border border-slate-200 shadow-xs text-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsReviewOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1 text-xs font-bold shadow-xs"
            >
              Kirim Ulasan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BookingDetailPage;
