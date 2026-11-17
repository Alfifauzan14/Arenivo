declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
import * as React from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  MapPin,
  Tag,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
  Phone,
  User,
  Mail,
  FileText,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  useToast,
} from "@/components/ui";
import {
  MOCK_BOOKINGS,
  MOCK_VENUES,
  MOCK_FIELDS,
} from "@/lib/mock-data";
import {
  formatRupiah,
  formatDateIndo,
  formatCountdown,
  BookingStatus,
  type Booking,
  type Venue,
  type Field,
} from "@futsal/shared";
import { useSession } from "@/features/auth/context/SessionContext";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { MidtransSnapModal } from "@/features/payment/components/MidtransSnapModal";

export function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, isLoggedIn } = useSession();

  // 1. Resolve Data Booking / Venue
  const venueIdParam = searchParams.get("venueId");
  const venueSlugParam = searchParams.get("venueSlug");
  const fieldIdParam = searchParams.get("fieldId");
  const dateParam = searchParams.get("date");
  const startHourParam = searchParams.get("startHour");
  const hoursParam = searchParams.get("hours");
  const totalParam = searchParams.get("total");

  // Cari booking yang cocok di mock
  const existingBooking = React.useMemo(() => {
    return MOCK_BOOKINGS.find((b) => b.id === bookingId) || MOCK_BOOKINGS[1];
  }, [bookingId]);

  // Order Code yang ditampilkan di UI
  const displayBookingCode = React.useMemo(() => {
    if (bookingId && bookingId.startsWith("bk-")) {
      return "BK-" + bookingId.replace(/^bk-/, "").slice(0, 8).toUpperCase();
    }
    return existingBooking.bookingCode;
  }, [bookingId, existingBooking.bookingCode]);

  // Resolve Venue & Field (prioritaskan data asli dari query param)
  const [venue, setVenue] = React.useState<Venue>(
    MOCK_VENUES.find((item) => item.id === venueIdParam) || MOCK_VENUES[0]
  );
  const [field, setField] = React.useState<Field>(
    MOCK_FIELDS.find((item) => item.id === fieldIdParam) || MOCK_FIELDS[0]
  );

  // Ambil venue & field asli dari API supaya fieldId valid saat POST /bookings
  React.useEffect(() => {
    let active = true;
    async function fetchVenueField() {
      const slug = venueSlugParam;
      if (!slug || !fieldIdParam) return;
      try {
        const venueRes = await apiClient.get<Venue>(`/venues/${slug}`);
        if (!active || !venueRes.data) return;
        setVenue(venueRes.data);
        const matchedField = (venueRes.data as any)?.fields?.find(
          (f: Field) => f.id === fieldIdParam
        );
        if (matchedField) setField(matchedField);
      } catch {
        // Jika API gagal, tetap pakai mock sebagai fallback UI
      }
    }
    fetchVenueField();
    return () => {
      active = false;
    };
  }, [venueSlugParam, fieldIdParam]);

  const playDateStr = dateParam || existingBooking.playStart.split("T")[0];
  const startHour = startHourParam ? parseInt(startHourParam, 10) : 19;
  const hoursCount = hoursParam ? parseInt(hoursParam, 10) : existingBooking.totalHours || 2;
  const endHour = startHour + hoursCount;

  // 2. 15-Minute Countdown Timer (desain.md 5.4)
  const [timeLeft, setTimeLeft] = React.useState<number>(14 * 60 + 59);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Alert otomatis jika waktu habis
  React.useEffect(() => {
    if (isExpired) {
      addToast(
        "error",
        "Waktu pembayaran 15 menit telah habis. Slot jadwal dilepas ke publik.",
        "Sesi Kedaluwarsa"
      );
    }
  }, [isExpired, addToast]);

  // 3. Form Data Pemesan
  const [customerName, setCustomerName] = React.useState<string>(
    user?.fullName || existingBooking.customerName || ""
  );
  const [customerPhone, setCustomerPhone] = React.useState<string>(
    user?.phone || existingBooking.customerPhone || ""
  );
  const [customerEmail, setCustomerEmail] = React.useState<string>(
    user?.email || ""
  );

  // Sync saat data sesi user selesai dimuat
  React.useEffect(() => {
    if (user?.fullName) setCustomerName(user.fullName);
    if (user?.phone) setCustomerPhone(user.phone);
    if (user?.email) setCustomerEmail(user.email);
  }, [user]);
  const [notes, setNotes] = React.useState<string>(existingBooking.notes || "");

  // 4. Promo Code Validation
  const [promoInput, setPromoInput] = React.useState<string>("");
  const [appliedPromo, setAppliedPromo] = React.useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);

  // Subtotal & Calculations
  const calculatedSubtotal = totalParam
    ? parseInt(totalParam, 10) - 5000
    : existingBooking.subtotal || field.basePrice * hoursCount;
  const serviceFee = 5000;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotalPrice = Math.max(0, calculatedSubtotal + serviceFee - discountAmount);

  const [promoValidating, setPromoValidating] = React.useState(false);

  const handleApplyPromo = async () => {
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) {
      addToast("warning", "Masukkan kode promo terlebih dahulu.", "Kode Promo");
      return;
    }

    setPromoValidating(true);
    try {
      const res = await apiClient.post<any>("/promos/validate", {
        code: cleanCode,
        venueId: venue.id,
        subtotal: calculatedSubtotal,
      });
      const result = res.data;
      setAppliedPromo({
        code: result.code,
        discount: result.discount,
        description: result.discountType === "fixed"
          ? `Diskon ${formatRupiah(result.discountValue)}`
          : `Diskon ${result.discountValue}% (maks ${formatRupiah(result.discount)})`,
      });
      addToast("success", `Kode promo ${result.code} berhasil digunakan! Hemat ${formatRupiah(result.discount)}.`, "Promo Aktif");
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.message || `Kode promo "${cleanCode}" tidak valid atau syarat belum terpenuhi.`;
      addToast("error", msg, "Promo Tidak Valid");
      setAppliedPromo(null);
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    addToast("info", "Kode promo telah dihapus.", "Promo Dihapus");
  };

  // 5. Midtrans Snap Handler & Modal Simulator
  const [isMidtransOpen, setIsMidtransOpen] = React.useState<boolean>(false);
  const [isSnapLoading, setIsSnapLoading] = React.useState<boolean>(false);

  // Pasang / Muat Midtrans Snap script secara dinamis saat halaman dibuka
  React.useEffect(() => {
    const snapScriptUrl =
      import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";

    if (!clientKey) return;
    let scriptTag = document.querySelector(`script[src="${snapScriptUrl}"]`) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.src = snapScriptUrl;
      scriptTag.setAttribute("data-client-key", clientKey);
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }
  }, []);

  // Fungsi pembantu memastikan Snap SDK siap
  const waitForSnapReady = (): Promise<boolean> => {
    if (typeof window !== "undefined" && window.snap?.pay) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const snapScriptUrl =
        import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";

      let scriptTag = document.querySelector(`script[src="${snapScriptUrl}"]`) as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.src = snapScriptUrl;
        scriptTag.setAttribute("data-client-key", clientKey);
        scriptTag.async = true;
        document.body.appendChild(scriptTag);
      }

      const checkTimer = setInterval(() => {
        if (window.snap?.pay) {
          clearInterval(checkTimer);
          clearTimeout(timeoutTimer);
          resolve(true);
        }
      }, 100);

      const timeoutTimer = setTimeout(() => {
        clearInterval(checkTimer);
        resolve(Boolean(window.snap?.pay));
      }, 4000);
    });
  };

  const [activeCreatedBookingId, setActiveCreatedBookingId] = React.useState<string | null>(null);

  const handleOpenPayment = async () => {
    if (isExpired) {
      addToast("error", "Sesi pembayaran sudah habis. Silakan pilih slot jadwal kembali.", "Kedaluwarsa");
      navigate(`/venues/${venue.slug}`);
      return;
    }

    if (!isLoggedIn) {
      addToast("warning", "Silakan login terlebih dahulu untuk melakukan pemesanan lapangan.", "Perlu Login");
      navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsSnapLoading(true);

    try {
      // 1. Build slotStarts array
      const slotStarts: string[] = [];
      for (let i = 0; i < hoursCount; i++) {
        const h = startHour + i;
        const padH = String(h).padStart(2, "0");
        slotStarts.push(`${playDateStr}T${padH}:00:00+07:00`);
      }

      // Validasi nomor WhatsApp sebelum request
      const cleanPhone = (customerPhone || "").trim();
      if (!cleanPhone || cleanPhone.length < 9) {
        throw new Error("Nomor WhatsApp minimal 9 digit. Silakan lengkapi form pemesan.");
      }

      // 2. Create Real Booking in PostgreSQL Database
      const idempotencyKey = "chk-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const bookingPayload = {
        fieldId: field.id || "f1111111-1111-1111-1111-111111111111",
        slotStarts,
        customerName: customerName.trim() || user?.fullName || "Penyewa Lapangan",
        customerPhone: cleanPhone,
        promoCode: appliedPromo?.code,
        notes: notes.trim() || "Booking online via Arenivo Web",
      };

      const createRes = await apiClient.post<any>("/bookings", bookingPayload, {
        headers: { "idempotency-key": idempotencyKey },
      });

      const realBookingId = createRes.data?.id;
      if (!realBookingId) {
        const serverMsg = createRes.data?.error?.message || createRes.data?.message;
        throw new Error(
          serverMsg ||
          "Server tidak merespons dengan benar. Pastikan backend aktif dan coba lagi."
        );
      }
      setActiveCreatedBookingId(realBookingId);

      // 3. Request Live Snap Token for the created booking
      const snapReady = await waitForSnapReady();
      const payRes = await apiClient.post<any>(`/bookings/${realBookingId}/payments`);

      setIsSnapLoading(false);

      if (payRes.data?.snapToken) {
        if (snapReady && window.snap?.pay) {
          window.snap.pay(payRes.data.snapToken, {
            onSuccess: (_result: any) => {
              navigate(`/bookings/${realBookingId}?status=success`);
            },
            onPending: (_result: any) => {
              navigate(`/bookings/${realBookingId}`);
            },
            onError: (_result: any) => {
              addToast("error", "Pembayaran gagal diproses oleh gateway Midtrans.", "Transaksi Gagal");
            },
            onClose: () => {
              addToast("info", "Jendela pembayaran Midtrans ditutup. Anda dapat melanjutkan pembayaran di Riwayat Pesanan.", "Pembayaran Ditunda");
              navigate(`/bookings/${realBookingId}`);
            },
          });
          return;
        } else if (payRes.data.redirectUrl) {
          window.location.href = payRes.data.redirectUrl;
          return;
        }
      }

      // Fallback direct payment simulation if Midtrans snap is blocked or in offline sandbox
      navigate(`/bookings/${realBookingId}?status=success`);
    } catch (err: any) {
      console.error("[Midtrans/Booking Error]:", err);
      setIsSnapLoading(false);

      // Extract the most specific error message available
      const detailsMsg = Array.isArray(err?.error?.details)
        ? err.error.details.map((d: any) => `${d.field ? d.field + ': ' : ''}${d.issue || d.message}`).join(", ")
        : null;

      const errorMessage =
        detailsMsg ||
        err?.error?.message ||   // API error response format
        err?.message ||           // Standard Error object
        "Slot jam tersebut mungkin baru saja diambil oleh penyewa lain.";

      addToast(
        "error",
        errorMessage,
        "Gagal Memproses Booking"
      );
    }
  };

    const handlePaymentSuccess = () => {
    setIsMidtransOpen(false);
    addToast(
      "success",
      `Pembayaran sebesar ${formatRupiah(finalTotalPrice)} berhasil dikonfirmasi! E-Tiket Anda telah terbit.`,
      "Pembayaran Berhasil"
    );
    // Redirect ke halaman E-Tiket Detail
    navigate(`/bookings/${existingBooking.id}?status=success`);
  };

  const handlePaymentPending = () => {
    setIsMidtransOpen(false);
    addToast(
      "warning",
      "Instruksi pembayaran telah dikirim. Selesaikan transaksi sebelum waktu habis.",
      "Menunggu Pembayaran"
    );
    navigate(`/bookings`);
  };

  const handlePaymentExpired = () => {
    setIsMidtransOpen(false);
    setIsExpired(true);
    addToast(
      "error",
      "Pembayaran dibatalkan atau waktu habis. Slot telah dilepaskan.",
      "Transaksi Gagal"
    );
    navigate(`/venues/${venue.slug}`);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 pb-keyboard-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Tombol Kembali ke Venue & Booking ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/venues/${venue.slug}`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs hover:border-slate-300 self-start shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Kembali ke Detail Venue</span>
            <span className="sm:hidden">Kembali ke Venue</span>
          </button>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 overflow-hidden">
            <span className="shrink-0">Booking ID:</span>
            <strong className="text-slate-800 font-bold truncate max-w-[240px] sm:max-w-none" title={bookingId || "bk-22222222"}>
              {bookingId || "bk-22222222"}
            </strong>
          </div>
        </div>

        {/* 1. Countdown Banner 15 Menit (desain.md 5.4) */}
        <div
          className={cn(
            "p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border transition-all",
            isExpired
              ? "bg-red-100 border-red-300 text-red-900"
              : timeLeft < 180
              ? "bg-amber-50 border-amber-300 text-amber-900 animate-pulse"
              : "bg-red-50 border-red-200 text-red-900"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                isExpired ? "bg-red-200 text-red-700" : "bg-red-600 text-white shadow-xs"
              )}
            >
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs font-bold block">
                {isExpired
                  ? "Waktu Sesi Pembayaran Telah Habis"
                  : "Selesaikan Pembayaran Anda Segera"}
              </span>
              <p className="text-[11px] text-slate-600">
                {isExpired
                  ? "Slot jadwal bermain Anda telah dilepas kembali ke publik."
                  : "Slot jadwal terkunci sementara untuk Anda selama 15 menit."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 hidden sm:inline">Sisa Waktu:</span>
            <span
              className={cn(
                "font-mono font-black text-lg sm:text-xl tabular-nums px-3 py-1 rounded-lg bg-white border shadow-xs",
                isExpired
                  ? "text-slate-400 border-slate-300"
                  : timeLeft < 180
                  ? "text-amber-700 border-amber-300"
                  : "text-red-600 border-red-200"
              )}
            >
              {formatCountdown(timeLeft)}
            </span>
          </div>
        </div>

        {/* 2. Main Content Grid (Split 2-kolom responsif di Tablet & Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom Kiri: Detail Pesanan & Data Penyewa */}
          <div className="md:col-span-2 space-y-6">
            {/* Kartu Ringkasan Lapangan & Jadwal */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  Rincian Lapangan & Jadwal Bermain
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="flex gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={
                      venue.photos?.[0]?.url ||
                      "/images/hero-futsal-indoor.webp"
                    }
                    alt={venue.name}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="space-y-1">
                    <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md text-[10px] border border-red-200">
                      {venue.city?.name}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {venue.name}
                    </h3>
                    <p className="text-slate-600 font-medium">{field.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {venue.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs divide-y sm:divide-y-0 divide-slate-100">
                  <div className="flex items-center justify-between sm:block pt-0 pb-1.5 sm:py-0">
                    <span className="text-slate-400 text-[11px]">Tanggal Main:</span>
                    <span className="font-bold text-slate-900 text-xs sm:block sm:mt-0.5">
                      {formatDateIndo(playDateStr, true)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:block py-1.5 sm:py-0">
                    <span className="text-slate-400 text-[11px]">Jam Main:</span>
                    <span className="font-bold text-red-600 text-xs font-mono sm:block sm:mt-0.5">
                      {String(startHour).padStart(2, "0")}.00 – {String(endHour).padStart(2, "0")}.00 WIB
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:block pt-1.5 pb-0 sm:py-0">
                    <span className="text-slate-400 text-[11px]">Durasi:</span>
                    <span className="font-bold text-slate-800 text-xs font-mono sm:block sm:mt-0.5">
                      {hoursCount} Jam Main
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Data Pemesan */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" />
                  Data Penyewa (Penerima E-Tiket)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <Input
                  label="Nama Lengkap Pemesan"
                  placeholder="Masukkan nama lengkap Anda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nomor WhatsApp (Untuk Notifikasi Tiket)"
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Alamat Email (E-Tiket & Invoice PDF)"
                    type="email"
                    placeholder="nama@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Catatan Khusus untuk Pengelola Lapangan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong siapkan rompi hijau dan bola ukuran standar futsal..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Input Kode Promo */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-600" />
                    Kode Promo Diskon
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Masukkan kode promo untuk dapat diskon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {appliedPromo ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-mono font-bold text-xs text-emerald-900 block">
                          {appliedPromo.code}
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          {appliedPromo.description}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 text-xs uppercase font-mono p-2.5 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={promoValidating}
                      className="font-bold text-xs"
                    >
                      {promoValidating ? "Memeriksa..." : "Gunakan"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Rincian Harga & Tombol Bayar Sekarang */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Rincian Pembayaran</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Order ID: {displayBookingCode}
                </span>
              </div>

              {/* Rincian item */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Sewa Lapangan ({hoursCount} Jam x {formatRupiah(field.basePrice)}):
                  </span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {formatRupiah(calculatedSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    Biaya Layanan Platform
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Diskon Promo ({appliedPromo.code}):</span>
                    <span className="font-mono tabular-nums">
                      -{formatRupiah(appliedPromo.discount)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Total Tagihan</span>
                    <span className="text-[10px] text-slate-400 font-mono">Sudah termasuk PPN</span>
                  </div>
                  <span className="text-xl font-black font-mono text-red-600 tabular-nums">
                    {formatRupiah(finalTotalPrice)}
                  </span>
                </div>
              </div>

              {/* Tombol Merah Bayar Sekarang */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isExpired || isSnapLoading}
                onClick={handleOpenPayment}
                className="w-full font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSnapLoading ? "Menyiapkan Midtrans Snap..." : "Bayar Sekarang"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garansi Transaksi Aman</span>
                </div>
                <p className="leading-relaxed">
                  Didukung Midtrans payment gateway dengan standar keamanan PCI-DSS dan enkripsi data perbankan resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Midtrans Snap Modal Simulator */}
      <MidtransSnapModal
        isOpen={isMidtransOpen}
        onClose={() => setIsMidtransOpen(false)}
        bookingCode={displayBookingCode}
        venueName={venue.name}
        fieldName={field.name}
        totalPrice={finalTotalPrice}
        onSuccess={handlePaymentSuccess}
        onPending={handlePaymentPending}
        onExpired={handlePaymentExpired}
      />
    </div>
  );
}

export default CheckoutPage;
