import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Coffee,
  Heart,
  Image as ImageIcon,
  Layers,
  MapPin,
  Moon,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";
import { Modal, Select, useToast } from "@/components/ui";
import {
  MOCK_VENUES,
  MOCK_FIELDS,
  MOCK_REVIEWS,
  MOCK_FACILITIES,
  generateMockSlots,
} from "@/lib/mock-data";
import {
  formatRupiah,
  formatDateIndo,
  SlotStatus,
  type Venue,
  type Field,
  type SlotItem,
  type Review,
} from "@futsal/shared";
import { useSession } from "@/features/auth/context/SessionContext";
import { VenueMap } from "@/features/venue/components/VenueMap";
import { cn } from "@/lib/utils";

const MONTH_NAMES_FULL = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday = 0 ... Sunday = 6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  const cells: Array<{
    day: number | null;
    dateStr: string;
    isWeekend: boolean;
  }> = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, dateStr: "", isWeekend: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const dayOfWeek = dt.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cells.push({
      day: d,
      dateStr: `${yyyy}-${mm}-${dd}`,
      isWeekend,
    });
  }

  return {
    title: `${MONTH_NAMES_FULL[month]} ${year}`,
    cells,
  };
}

export function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isFavorite, toggleFavorite } = useSession();

  // 1. Temukan venue berdasarkan slug
  const venue: Venue = React.useMemo(() => {
    return MOCK_VENUES.find((v) => v.slug === slug) || MOCK_VENUES[0];
  }, [slug]);

  const favorited = isFavorite(venue.id);

  // 2. Foto Galeri
  const allPhotos = React.useMemo(() => {
    if (venue.photos && venue.photos.length > 0) {
      return venue.photos.map((p) => p.url);
    }
    return [
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [venue.photos]);

  const [activePhoto, setActivePhoto] = React.useState<string>(allPhotos[0]);
  const [galleryIndex, setGalleryIndex] = React.useState(0);
  const [galleryModalOpen, setGalleryModalOpen] = React.useState(false);
  const [mapModalOpen, setMapModalOpen] = React.useState(false);
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);
  const [showFullRules, setShowFullRules] = React.useState(false);
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  React.useEffect(() => {
    if (allPhotos.length > 0) {
      setActivePhoto(allPhotos[0]);
    }
  }, [allPhotos]);

  // 3. Lapangan yang tersedia untuk venue ini
  const venueFields: Field[] = React.useMemo(() => {
    const matching = MOCK_FIELDS.filter((f) => f.venueId === venue.id);
    if (matching.length > 0) return matching;

    return [
      {
        id: `fld-${venue.id}-1`,
        venueId: venue.id,
        fieldTypeId: "t1111111-1111-1111-1111-111111111111",
        name: "Lapangan A (Vinyl Pro)",
        sizeDescription: "26 x 16 meter (Standar Futsal Nasional)",
        surface: "Vinyl Gerflor 7.5mm Wood Texture",
        basePrice: venue.startingPrice ?? 175000,
        status: "aktif",
        fieldType: {
          id: "t1111111-1111-1111-1111-111111111111",
          code: "futsal_vinyl",
          name: "Futsal Vinyl Gerflor",
        },
      },
      {
        id: `fld-${venue.id}-2`,
        venueId: venue.id,
        fieldTypeId: "t2222222-2222-2222-2222-222222222222",
        name: "Lapangan B (Interlock Elite)",
        sizeDescription: "25 x 15 meter",
        surface: "Interlock Polypropylene Anti-Slip",
        basePrice: Math.max(100000, (venue.startingPrice ?? 175000) - 15000),
        status: "aktif",
        fieldType: {
          id: "t2222222-2222-2222-2222-222222222222",
          code: "futsal_interlock",
          name: "Futsal Interlock Polypropylene",
        },
      },
    ];
  }, [venue.id, venue.startingPrice]);

  // 4. Generate 30 Hari ke Depan & State Kalender Popover (Sesuai Gambar ke-2)
  const todayStr = React.useMemo(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const dateOptions = React.useMemo(() => {
    const dates: Array<{ dateStr: string; dayName: string; dateLabel: string }> = [];
    const today = new Date();
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      dates.push({
        dateStr,
        dayName: dayNames[d.getDay()],
        dateLabel: `${d.getDate()} ${MONTH_NAMES_FULL[d.getMonth()]}`,
      });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(dateOptions[0].dateStr);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = React.useState(0);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const twoMonthsCalendar = React.useMemo(() => {
    const base = new Date();
    const m1 = new Date(base.getFullYear(), base.getMonth() + calendarMonthOffset, 1);
    const m2 = new Date(base.getFullYear(), base.getMonth() + calendarMonthOffset + 1, 1);
    return [
      buildMonthGrid(m1.getFullYear(), m1.getMonth()),
      buildMonthGrid(m2.getFullYear(), m2.getMonth()),
    ];
  }, [calendarMonthOffset]);

  const baseK = Math.round((venue.startingPrice || 150000) / 1000);
  const weekendK = baseK + 50;

  const [timePeriodFilter, setTimePeriodFilter] = React.useState<string>("all");
  const [caborFilter, setCaborFilter] = React.useState<string>("all");

  // State lapangan yang terbuka jadwalnya & slot yang dipilih
  const [expandedFieldIds, setExpandedFieldIds] = React.useState<string[]>([
    venueFields[0]?.id || "",
  ]);
  const [selectedField, setSelectedField] = React.useState<Field>(venueFields[0]);
  const [selectedHours, setSelectedHours] = React.useState<number[]>([]);

  React.useEffect(() => {
    setSelectedField(venueFields[0]);
    setExpandedFieldIds([venueFields[0]?.id || ""]);
    setSelectedHours([]);
  }, [venueFields]);

  const toggleExpandField = (fieldId: string) => {
    setExpandedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  // Slots untuk lapangan yang sedang dipilih
  const activeFieldSlots = React.useMemo(() => {
    return generateMockSlots(selectedField.id, selectedDate);
  }, [selectedField.id, selectedDate]);

  const selectedSlots = React.useMemo(() => {
    return activeFieldSlots.filter((s) => selectedHours.includes(s.hour));
  }, [activeFieldSlots, selectedHours]);

  // Klik slot pada lapangan tertentu (Aturan jam berurutan tetap jalan)
  const handleSlotClick = (field: Field, slot: SlotItem) => {
    if (slot.status !== SlotStatus.TERSEDIA) {
      if (slot.status === SlotStatus.DIKUNCI) {
        addToast(
          "warning",
          "Slot ini sedang dikunci selama 15 menit oleh penyewa lain dalam alur checkout.",
          "Slot Dikunci"
        );
      } else if (slot.status === SlotStatus.TERISI) {
        addToast("info", "Slot jam ini sudah terisi (Booked).", "Booked");
      } else {
        addToast("error", `Slot tidak tersedia: ${slot.reason || "Tutup"}`, "Tidak Tersedia");
      }
      return;
    }

    const clickedHour = slot.hour;

    if (field.id !== selectedField.id) {
      setSelectedField(field);
      setSelectedHours([clickedHour]);
      return;
    }

    if (selectedHours.length === 0) {
      setSelectedHours([clickedHour]);
      return;
    }

    if (selectedHours.includes(clickedHour)) {
      const minHour = Math.min(...selectedHours);
      const maxHour = Math.max(...selectedHours);
      if (clickedHour === minHour || clickedHour === maxHour) {
        setSelectedHours(selectedHours.filter((h) => h !== clickedHour));
      } else {
        addToast(
          "warning",
          "Slot harus tetap berurutan. Pilihan diatur ulang ke jam yang baru diklik.",
          "Aturan Jam Berurutan"
        );
        setSelectedHours([clickedHour]);
      }
      return;
    }

    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);

    if (clickedHour === minHour - 1 || clickedHour === maxHour + 1) {
      setSelectedHours([...selectedHours, clickedHour].sort((a, b) => a - b));
    } else {
      addToast(
        "warning",
        `Jam bermain harus berurutan. Pilihan dipindahkan ke jam ${slot.timeLabel}.`,
        "Pilihan Jam Berurutan"
      );
      setSelectedHours([clickedHour]);
    }
  };

  // Perhitungan Keuangan
  const subtotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const serviceFee = selectedSlots.length > 0 ? 5000 : 0;
  const totalPrice = subtotal > 0 ? subtotal + serviceFee : 0;

  const timeRangeLabel = React.useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => a.hour - b.hour);
    const startHour = String(sorted[0].hour).padStart(2, "0");
    const endHour = String(sorted[sorted.length - 1].hour + 1).padStart(2, "0");
    return `${startHour}:00 - ${endHour}:00 (${selectedSlots.length} Jam)`;
  }, [selectedSlots]);

  // 5. Ulasan untuk venue ini
  const venueReviews: Review[] = React.useMemo(() => {
    const list = MOCK_REVIEWS.filter((r) => r.venueId === venue.id);
    if (list.length > 0) return list;
    return MOCK_REVIEWS;
  }, [venue.id]);

  // Helper YouTube Embed
  const youtubeEmbedUrl = React.useMemo(() => {
    const url = venue.youtubeUrl;
    if (!url) return "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : "dQw4w9WgXcQ";
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }, [venue.youtubeUrl]);

  // Helper aturan & tata tertib
  const parsedRules = React.useMemo(() => {
    if (venue.rules) {
      return venue.rules
        .split("\n")
        .map((r) => r.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter(Boolean);
    }
    return [
      "Gunakan sepatu olahraga khusus futsal/mini soccer non-marking saat bermain.",
      "Jaga kebersihan area lapangan dan ruang ganti.",
      "Lapangan buka mulai pukul 08.00 - 24.00 WIB.",
      "Dilarang membawa minuman keras, senjata tajam, dan merokok di area lapangan.",
      "Harap datang 15 menit sebelum jadwal mulai untuk scan QR e-tiket di pintu gate.",
    ];
  }, [venue.rules]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("success", "Tautan venue telah disalin ke papan klip!", "Berhasil Bagikan");
    } else {
      addToast("info", window.location.href, "Tautan Venue");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0) {
      scrollToSection("pilih-lapangan");
      addToast(
        "info",
        "Silakan pilih jam bermain pada daftar lapangan di bawah.",
        "Pilih Jam Main"
      );
      return;
    }

    const sorted = [...selectedSlots].sort((a, b) => a.hour - b.hour);
    const startHour = sorted[0].hour;
    const hoursCount = selectedSlots.length;

    navigate(
      `/checkout/bk-22222222-2222-2222-2222-222222222222?venueId=${venue.id}&fieldId=${selectedField.id}&date=${selectedDate}&startHour=${startHour}&hours=${hoursCount}&total=${totalPrice}`
    );
  };

  const sportCategory = venue.name.toLowerCase().includes("mini soccer")
    ? "Mini Soccer & Futsal"
    : "Futsal";

  const cityProvince = venue.city
    ? `${
        venue.city.name.startsWith("Kota") ? venue.city.name : `Kota ${venue.city.name}`
      }, ${venue.city.province}`
    : "Jakarta Selatan, DKI Jakarta";

  const getFacilityIcon = (iconName?: string) => {
    switch (iconName) {
      case "car":
        return <Car className="w-4 h-4 text-slate-600 shrink-0" />;
      case "sun":
        return <Sun className="w-4 h-4 text-slate-600 shrink-0" />;
      case "moon":
        return <Moon className="w-4 h-4 text-slate-600 shrink-0" />;
      case "coffee":
        return <Coffee className="w-4 h-4 text-slate-600 shrink-0" />;
      case "users":
        return <Users className="w-4 h-4 text-slate-600 shrink-0" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4 text-slate-600 shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  // Filter daftar lapangan berdasarkan Cabor
  const filteredFields = React.useMemo(() => {
    if (caborFilter === "all") return venueFields;
    return venueFields.filter((f) =>
      (f.fieldType?.name || f.name).toLowerCase().includes(caborFilter.toLowerCase())
    );
  }, [venueFields, caborFilter]);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-8">
        {/* 1. HERO PHOTO BANNER + TOMBOL AKSI */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
          <img
            src={activePhoto}
            alt={venue.name}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Top-right Action Buttons: Video, Share, Favorite */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Video Arena</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shadow-xs cursor-pointer transition-all"
              title="Bagikan Venue"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(venue.id)}
              className={cn(
                "w-9 h-9 rounded-lg border flex items-center justify-center shadow-xs cursor-pointer transition-all",
                favorited
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              )}
              title={favorited ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
            >
              <Heart className={cn("w-4 h-4", favorited && "fill-red-600 text-red-600")} />
            </button>
          </div>

          {/* Bottom-right: Lihat semua foto */}
          <button
            type="button"
            onClick={() => {
              setGalleryIndex(0);
              setGalleryModalOpen(true);
            }}
            className="absolute bottom-3 right-3 bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Lihat semua foto ({allPhotos.length})</span>
          </button>
        </div>

        {/* 2. BAGIAN ATAS: INFO VENUE (KIRI) + STICKY CARD HARGA & BOOKING (KANAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri (2/3): Nama, Rating, Deskripsi, Aturan, Lokasi Venue, Fasilitas */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Judul, Rating, Kota, & Badge Olahraga */}
            <div className="space-y-2 pb-5 border-b border-slate-100">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {venue.name}
              </h1>

              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-700">
                <span className="font-bold text-slate-900 tabular-nums">{venue.ratingAvg}</span>
                <span>•</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-medium text-slate-600">{cityProvince}</span>
              </div>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                  <Trophy className="w-3.5 h-3.5 text-slate-600" />
                  <span>{sportCategory}</span>
                </span>
              </div>
            </div>

            {/* Deskripsi & Aturan Venue */}
            <div className="space-y-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">Deskripsi</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {venue.description ||
                    "Arena olahraga modern berstandar resmi dengan pencahayaan buatan yang stabil, sirkulasi udara sejuk, dan lantai berkualitas tinggi yang mendukung pergerakan cepat serta aman."}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Aturan Venue</h3>
                <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {(showFullRules ? parsedRules : parsedRules.slice(0, 4)).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ol>

                {showFullRules && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block">
                      Kebijakan Pembatalan & Refund:
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      <li>
                        • Pembatalan &gt; 24 jam sebelum jadwal main: <strong>Refund 100%</strong>
                      </li>
                      <li>
                        • Pembatalan 6 s.d. 24 jam sebelum jadwal main: <strong>Refund 50%</strong>
                      </li>
                      <li>
                        • Pembatalan &lt; 6 jam sebelum jadwal main: <strong>0% (Hangus)</strong>
                      </li>
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowFullRules(!showFullRules)}
                  className="text-xs font-bold text-red-700 hover:text-red-800 pt-1 inline-block cursor-pointer"
                >
                  {showFullRules ? "Sembunyikan" : "Baca Selengkapnya"}
                </button>
              </div>

              {/* Box Lokasi Venue */}
              <div
                onClick={() => setMapModalOpen(true)}
                className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    Lokasi Venue
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-2">{venue.address}</p>
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs text-red-700">
                  <MapPin className="w-4 h-4 fill-red-700 text-white" />
                  <span className="text-[11px] font-bold mt-0.5 whitespace-nowrap">Buka Peta</span>
                </div>
              </div>
            </div>

            {/* Fasilitas */}
            <div className="space-y-3.5">
              <h2 className="font-bold text-base sm:text-lg text-slate-900">Fasilitas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                {(venue.facilities || MOCK_FACILITIES).map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700"
                  >
                    {getFacilityIcon(fac.icon)}
                    <span>{fac.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan (1/3): Card Harga & Ringkasan Booking */}
          <div className="hidden lg:block space-y-4 sticky top-24">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <span className="text-xs text-slate-400 block">Mulai dari</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                    {formatRupiah(
                      selectedSlots.length > 0 ? totalPrice : venue.startingPrice || 150000
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedSlots.length > 0 ? `(${selectedSlots.length} Sesi)` : "Per Sesi"}
                  </span>
                </div>
              </div>

              {selectedSlots.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Lapangan</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedField.name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Tanggal</span>
                    <span className="font-medium text-slate-800 tabular-nums">
                      {formatDateIndo(selectedDate, false)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Jam</span>
                    <span className="font-mono font-bold text-red-700 tabular-nums">
                      {timeRangeLabel}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                {selectedSlots.length > 0
                  ? `Lanjut ke Pembayaran (${selectedSlots.length} Jam)`
                  : "Cek Ketersediaan"}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                Booking lewat platform lebih banyak keuntungan!
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Garansi 100% bebas double booking real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Konfirmasi instan via QRIS & Virtual Account</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Lebih banyak promo & voucher diskon venue</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. SEKSI PILIH LAPANGAN & JADWAL */}
        <section id="pilih-lapangan" className="space-y-4">
          {/* Judul dengan Ikon Bulat Merah */}
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Pilih Lapangan</h2>
          </div>

          {/* Bar Tanggal Horizontal + Tombol Popover Kalender 2 Bulan (Sesuai Gambar ke-2) */}
          <div
            ref={calendarRef}
            className="relative bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Deretan Tanggal Horizontal + Tombol Ikon Kalender */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1 min-w-0">
                  {dateOptions.slice(0, 7).map((d) => {
                    const isSelected = d.dateStr === selectedDate;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setSelectedHours([]);
                        }}
                        className={cn(
                          "min-w-[68px] sm:min-w-[74px] py-2 px-2.5 rounded-lg text-center transition-all shrink-0 cursor-pointer shadow-xs",
                          isSelected
                            ? "bg-red-600 text-white font-bold"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[11px] block leading-tight",
                            isSelected ? "text-red-100 font-medium" : "text-slate-400"
                          )}
                        >
                          {d.dayName}
                        </span>
                        <span className="text-xs sm:text-sm font-bold block mt-0.5 whitespace-nowrap">
                          {d.dateLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Divider & Tombol Ikon Kalender (Sesuai Gambar ke-2) */}
                <div className="pl-2 border-l border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-xs",
                      calendarOpen
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-red-700"
                    )}
                    title="Buka Kalender Tanggal & Harga"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Waktu + Cabor */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-100">
                <div className="w-full sm:w-36">
                  <Select
                    value={timePeriodFilter}
                    onChange={(e) => setTimePeriodFilter(e.target.value)}
                    options={[
                      { value: "all", label: "Semua Waktu" },
                      { value: "pagi", label: "Pagi (08-12)" },
                      { value: "siang", label: "Siang (12-17)" },
                      { value: "malam", label: "Malam (17-24)" },
                    ]}
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Select
                    value={caborFilter}
                    onChange={(e) => setCaborFilter(e.target.value)}
                    options={[
                      { value: "all", label: "Semua Cabor" },
                      { value: "futsal", label: "Futsal" },
                      { value: "mini", label: "Mini Soccer" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* POPOVER KALENDER 2 BULAN DENGAN INDIKATOR HARGA (SESUAI GAMBAR KE-2) */}
            {calendarOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-30 w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset((p) => Math.max(0, p - 1))}
                    disabled={calendarMonthOffset === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 text-center font-bold text-sm text-slate-900">
                    <span>{twoMonthsCalendar[0].title}</span>
                    <span className="hidden sm:inline">{twoMonthsCalendar[1].title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset((p) => p + 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {twoMonthsCalendar.map((monthData, mIdx) => (
                    <div
                      key={monthData.title}
                      className={cn(mIdx === 1 && "hidden sm:block")}
                    >
                      {/* Header Hari */}
                      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400 mb-2">
                        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>

                      {/* Grid Tanggal + Harga Ribuan (150 / 230) */}
                      <div className="grid grid-cols-7 gap-y-1.5 text-center">
                        {monthData.cells.map((cell, cIdx) => {
                          if (!cell.day) {
                            return <div key={`empty-${cIdx}`} className="h-11" />;
                          }

                          const isPast = cell.dateStr < todayStr;
                          const isSelected = cell.dateStr === selectedDate;
                          const priceLabel = cell.isWeekend ? weekendK : baseK;

                          return (
                            <button
                              key={cell.dateStr}
                              type="button"
                              disabled={isPast}
                              onClick={() => {
                                setSelectedDate(cell.dateStr);
                                setSelectedHours([]);
                                setCalendarOpen(false);
                              }}
                              className={cn(
                                "h-11 w-10 mx-auto rounded-full flex flex-col items-center justify-center transition-all",
                                isPast && "text-slate-300 cursor-not-allowed",
                                !isPast &&
                                  isSelected &&
                                  "bg-red-600 text-white font-bold shadow-xs cursor-pointer",
                                !isPast &&
                                  !isSelected &&
                                  "hover:bg-slate-100 cursor-pointer"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-xs font-semibold leading-none",
                                  isPast
                                    ? "text-slate-300"
                                    : isSelected
                                    ? "text-white"
                                    : cell.isWeekend
                                    ? "text-red-600"
                                    : "text-slate-900"
                                )}
                              >
                                {String(cell.day).padStart(2, "0")}
                              </span>
                              {!isPast && (
                                <span
                                  className={cn(
                                    "text-[9px] font-bold leading-none mt-1 tabular-nums",
                                    isSelected
                                      ? "text-red-100"
                                      : cell.isWeekend
                                      ? "text-slate-400"
                                      : "text-emerald-600"
                                  )}
                                >
                                  {priceLabel}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daftar Lapangan (Court Cards + Expandable Slot Grid) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs divide-y divide-slate-200">
            {filteredFields.map((field, fIdx) => {
              const rawSlots = generateMockSlots(field.id, selectedDate);
              const displaySlots = rawSlots.filter((s) => {
                if (timePeriodFilter === "pagi") return s.hour >= 8 && s.hour < 12;
                if (timePeriodFilter === "siang") return s.hour >= 12 && s.hour < 17;
                if (timePeriodFilter === "malam") return s.hour >= 17 && s.hour <= 23;
                return true;
              });

              const availableCount = displaySlots.filter(
                (s) => s.status === SlotStatus.TERSEDIA
              ).length;
              const isExpanded = expandedFieldIds.includes(field.id);
              const fieldPhoto = allPhotos[fIdx % allPhotos.length];

              return (
                <div key={field.id} className="py-6 first:pt-1 last:pb-1 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
                    {/* Foto Lapangan */}
                    <div className="md:col-span-4 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={fieldPhoto}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryIndex(fIdx % allPhotos.length);
                          setGalleryModalOpen(true);
                        }}
                        className="absolute bottom-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg cursor-pointer shadow-xs"
                      >
                        Lihat semua foto
                      </button>
                    </div>

                    {/* Detail Lapangan & Tombol Toggle Jadwal */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1">
                          <span>{field.name}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {field.name} adalah lapangan berstandar nasional dengan pencahayaan LED
                          optimal dan permukaan {field.surface || "berkualitas tinggi"}, ideal untuk
                          latihan maupun pertandingan.
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{field.fieldType?.name || sportCategory}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Indoor • {field.sizeDescription || "26 x 16 meter"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{field.surface || "Vinyl / Rumput Sintetis"}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleExpandField(field.id)}
                          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          <span>{availableCount} Jadwal Tersedia</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Grid Slot Jam */}
                  {isExpanded && (
                    <div className="md:pl-[33.333%] pt-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {displaySlots.map((slot) => {
                          const isSelected =
                            selectedField.id === field.id && selectedHours.includes(slot.hour);
                          const isAvailable = slot.status === SlotStatus.TERSEDIA;
                          const isLocked = slot.status === SlotStatus.DIKUNCI;
                          const nextHour = String(slot.hour + 1).padStart(2, "0");
                          const startHour = String(slot.hour).padStart(2, "0");

                          return (
                            <button
                              key={slot.hour}
                              type="button"
                              onClick={() => handleSlotClick(field, slot)}
                              className={cn(
                                "p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 select-none",
                                isSelected &&
                                  "bg-red-600 border-red-600 text-white shadow-xs ring-2 ring-red-600/20 cursor-pointer",
                                !isSelected &&
                                  isAvailable &&
                                  "bg-white border-slate-200 text-slate-900 hover:border-red-600 hover:bg-red-50/30 cursor-pointer shadow-xs",
                                !isSelected &&
                                  isLocked &&
                                  "bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed",
                                !isSelected &&
                                  !isAvailable &&
                                  !isLocked &&
                                  "bg-slate-50/70 border-slate-100 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[10px]",
                                  isSelected
                                    ? "text-red-100"
                                    : isAvailable
                                    ? "text-slate-400"
                                    : "text-slate-300"
                                )}
                              >
                                60 Menit
                              </span>

                              <span
                                className={cn(
                                  "text-xs sm:text-sm font-bold tabular-nums",
                                  isSelected
                                    ? "text-white"
                                    : isAvailable
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                )}
                              >
                                {startHour}:00 - {nextHour}:00
                              </span>

                              <span
                                className={cn(
                                  "text-[11px] font-medium tabular-nums mt-0.5",
                                  isSelected
                                    ? "text-red-100 font-bold"
                                    : isAvailable
                                    ? "text-slate-600"
                                    : isLocked
                                    ? "text-amber-700"
                                    : "text-slate-400"
                                )}
                              >
                                {isSelected
                                  ? "Dipilih"
                                  : isAvailable
                                  ? formatRupiah(slot.price)
                                  : isLocked
                                  ? "Dikunci 15m"
                                  : "Booked"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. SEKSI ULASAN */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Ulasan</h2>
            </div>

            {venueReviews.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="hidden sm:inline-block text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                {showAllReviews ? "Tampilkan sedikit" : "Lihat semua ulasan"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {venue.ratingAvg}
              </span>
              <span className="text-sm text-slate-400 font-semibold">/5</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <span className="text-xs text-slate-400">
              {venue.reviewCount} rating • {venueReviews.length} ulasan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: "Kebersihan", score: Math.min(5, +(venue.ratingAvg - 0.05).toFixed(2)) },
              {
                label: "Kondisi Lapangan",
                score: Math.min(5, +(venue.ratingAvg - 0.1).toFixed(2)),
              },
              { label: "Komunikasi", score: Math.min(5, +(venue.ratingAvg - 0.15).toFixed(2)) },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{stat.label}</span>
                  <span className="font-bold text-slate-800 tabular-nums">{stat.score}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${(stat.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllReviews ? venueReviews : venueReviews.slice(0, 2)).map((rev, idx) => {
              const initials = (rev.userName || "Penyewa")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0",
                            idx % 2 === 0 ? "bg-emerald-700" : "bg-teal-700"
                          )}
                        >
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                            {rev.userName || "Penyewa Futsal"}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Diulas:{" "}
                            {formatDateIndo(rev.createdAt?.split("T")[0] || "2026-10-14", false)}
                          </span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400 block pt-1">
                    {venueFields[idx % venueFields.length]?.name || "Lapangan A"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="w-full py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors shadow-xs cursor-pointer sm:hidden"
          >
            {showAllReviews ? "Tampilkan sedikit" : "Lihat semua ulasan"}
          </button>
        </section>
      </div>

      {/* 5. MOBILE FIXED BOTTOM BAR (Layar Android / HP) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3.5 pb-safe z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block truncate">
              {selectedSlots.length > 0
                ? `${selectedSlots.length} Jam • ${selectedField.name}`
                : "Mulai dari"}
            </span>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
              {formatRupiah(
                selectedSlots.length > 0 ? totalPrice : venue.startingPrice || 150000
              )}
              {selectedSlots.length === 0 && (
                <span className="text-xs font-normal text-slate-400"> /sesi</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            {selectedSlots.length > 0 ? "Lanjut Bayar" : "Cek Ketersediaan"}
          </button>
        </div>
      </div>

      {/* MODAL 1: LIGHTBOX GALERI FOTO FULL + THUMBNAIL DI BAWAHNYA */}
      {galleryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in"
          onClick={() => setGalleryModalOpen(false)}
        >
          {/* Top Bar: Judul, Counter & Tombol Tutup */}
          <div
            className="max-w-5xl w-full mx-auto flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">{venue.name}</h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Foto {galleryIndex + 1} dari {allPhotos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGalleryModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Tutup galeri"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Gambar Utama Full + Tombol Panah Kiri/Kanan */}
          <div
            className="relative max-w-5xl w-full mx-auto flex-1 flex items-center justify-center my-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setGalleryIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)
                }
                className="absolute left-2 sm:left-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img
              src={allPhotos[galleryIndex]}
              alt={`${venue.name} ${galleryIndex + 1}`}
              className="max-h-[68vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={() => setGalleryIndex((prev) => (prev + 1) % allPhotos.length)}
                className="absolute right-2 sm:right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom: Deretan Thumbnail untuk Pindah Gambar */}
          <div
            className="max-w-3xl w-full mx-auto flex items-center justify-center gap-2.5 overflow-x-auto py-1 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {allPhotos.map((url, i) => {
              const isCurrent = i === galleryIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGalleryIndex(i)}
                  className={cn(
                    "w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer",
                    isCurrent
                      ? "border-red-500 scale-105 opacity-100 shadow-sm"
                      : "border-transparent opacity-50 hover:opacity-90"
                  )}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 2: LOKASI PETA VENUE */}
      <Modal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        title={`Lokasi ${venue.name}`}
      >
        <div className="space-y-3">
          <VenueMap
            venueName={venue.name}
            address={venue.address}
            latitude={venue.latitude}
            longitude={venue.longitude}
          />
        </div>
      </Modal>

      {/* MODAL 3: VIDEO TUR ARENA */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={`Video Suasana ${venue.name}`}
      >
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
          <iframe
            src={youtubeEmbedUrl}
            title={`Video Profil ${venue.name}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal>
    </div>
  );
}

export default VenueDetailPage;
