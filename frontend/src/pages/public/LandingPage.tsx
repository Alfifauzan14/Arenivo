import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Button, Card, Select, Input } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { VenueCard } from "@/features/venue/components/VenueCard";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=80",
    alt: "Lapangan Futsal Indoor dengan Lampu Sorot",
    title: "Sewa Lapangan Futsal\n& Mini Soccer Cepat",
    subtitle: "Platform all-in-one untuk sewa lapangan futsal dan mini soccer. Ketersediaan slot real-time, bebas double booking, konfirmasi bayar otomatis via QRIS.",
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1600&q=80",
    alt: "Pemain Futsal Beraksi di Lapangan Indoor",
    title: "Main Futsal\nBebas Ribet",
    subtitle: "Pesan lapangan futsal favorit tim Anda dalam hitungan menit. E-Tiket instan, pembayaran QRIS, dan jaminan slot terkunci.",
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1612225220822-30ab95978d91?auto=format&fit=crop&w=1600&q=80",
    alt: "Lapangan Mini Soccer Rumput Sintetis",
    title: "Mini Soccer\nBerkualitas",
    subtitle: "Jelajahi venue mini soccer terbaik di berbagai kota. Fasilitas shower, tribun penonton, ruang ganti, dan parkir luas.",
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f5b4c4f5b2?auto=format&fit=crop&w=1600&q=80",
    alt: "Tim Futsal Bermain di Lapangan Indoor",
    title: "Kupon Diskon Spesial\nHemat Setiap Pekan",
    subtitle: "Nikmati voucher potongan harga eksklusif saat checkout agar patungan sewa lapangan favorit tim makin hemat.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  // Hero Carousel Auto-play State
  const [activeHeroIdx, setActiveHeroIdx] = React.useState(0);
  const [isHeroPaused, setIsHeroPaused] = React.useState(false);

  React.useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused]);

  // Search Widget State & Defaults for Reset
  // Live Backend Data States with graceful Mock fallbacks
  const [venues, setVenues] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [banners, setBanners] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/venues", { limit: 8 }).then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setVenues(res.data);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/master/cities").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCities(res.data);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/banners").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setBanners(res.data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Search Widget State & Defaults for Reset
  const defaultCity = cities[0]?.id || "jakarta-selatan";
  const defaultDate = new Date().toISOString().split("T")[0];

  const [selectedCity, setSelectedCity] = React.useState(defaultCity);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [playDate, setPlayDate] = React.useState(defaultDate);

  const isFiltered =
    selectedCity !== defaultCity ||
    searchQuery.trim() !== "" ||
    playDate !== defaultDate;

  const handleResetFilters = () => {
    setSelectedCity(defaultCity);
    setSearchQuery("");
    setPlayDate(defaultDate);
  };

  // Promo Banner Carousel Index & Auto-play (Otomatis berganti slide di Android/mobile & desktop)
  const [activeBannerIdx, setActiveBannerIdx] = React.useState(0);
  const [isBannerPaused, setIsBannerPaused] = React.useState(false);

  React.useEffect(() => {
    if (isBannerPaused) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerPaused]);

  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  // FAQ fetched from API (admin-editable via system_settings)
  const [faqList, setFaqList] = React.useState<{ question: string; answers: string[] }[]>([]);

  React.useEffect(() => {
    let active = true;
    apiClient
      .get<{ faq?: { question: string; answers: string[] }[] }>("/settings")
      .then((res) => {
        if (!active) return;
        const faq = res.data?.faq;
        if (Array.isArray(faq) && faq.length > 0) {
          setFaqList(faq);
        }
      })
      .catch(() => {
        // If API fails, FAQ stays empty — admin can set it
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (playDate) params.set("date", playDate);

    navigate(`/venues?${params.toString()}`);
  };

  // Venue populer
  const popularVenues = React.useMemo(() => {
    return venues.slice(0, 6);
  }, [venues]);

  return (
    <div className="pb-8 sm:pb-12">
      {/* 1. HERO BANNER — Real Sports Venue Photography Carousel (Berganti Otomatis Bersih) */}
      <section
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        className="relative min-h-[500px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[640px] flex items-center overflow-hidden pb-20 sm:pb-24 md:pb-24 text-white select-none"
      >
        {/* Background Slides with Smooth Fade & Ken-Burns Zoom (Berganti Otomatis) */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === activeHeroIdx ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            )}
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "w-full h-full object-cover object-center transition-transform duration-7000 ease-out",
                idx === activeHeroIdx ? "scale-105" : "scale-100"
              )}
            />
          </div>
        ))}

        {/* Gradient Overlays: Gelap di kiri untuk keterbacaan teks putih, transparan di kanan sesuai gambar referensi */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10" />

        {/* Hero Content (Left-aligned persis referensi Image) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full relative z-20 py-8 sm:py-12">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            {/* Headline Super Sport Community App */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-md whitespace-pre-line">
              {HERO_SLIDES[activeHeroIdx].title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-slate-100/95 leading-relaxed max-w-xl drop-shadow-xs font-medium">
              {HERO_SLIDES[activeHeroIdx].subtitle}
            </p>

            {/* Tombol Aksi Sesuai Aplikasi BookingLapangan */}
            <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-4">
              <Link
                to="/venues"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-red-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-4 h-4" />
                <span>Cari Lapangan Sekarang</span>
              </Link>

              <Link
                to="/venues?filter=promo"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-bold text-xs sm:text-sm shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Klaim Promo Spesial</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH WIDGET — Straddling 50% on Hero Image, 50% on Page Background */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-28 sm:-mt-20 md:-mt-14 relative z-30">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-6 space-y-5">
          {/* Form Input Pencarian */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pilih Kota</label>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-medium"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tanggal Main</label>
              <Input
                type="date"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lapangan / Venue</label>
              <Input
                placeholder="Contoh: Spartan, Pasteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1 h-10 font-bold text-sm gap-2 shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Cari Lapangan</span>
              </Button>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset pencarian ke default"
                aria-label="Reset pencarian ke default"
                className={cn(
                  "h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center transition-all shadow-xs group focus:outline-none focus:ring-2 focus:ring-red-500/20",
                  isFiltered
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                )}
              >
                <RotateCcw
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:-rotate-45",
                    isFiltered ? "text-red-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Sections (Spaced cleanly below the floating search widget) */}
      <div className="space-y-10 sm:space-y-12 mt-8 sm:mt-10">
        {/* 3. PROMO BANNER CAROUSEL (Otomatis berganti di Android & rapi tanpa panah menutupi teks) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
          className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs"
        >
          <div className="relative min-h-[195px] sm:min-h-[220px] md:aspect-[24/8] md:max-h-72 w-full overflow-hidden">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center",
                  idx === activeBannerIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 sm:via-slate-900/40 to-transparent flex items-center p-4 sm:p-8 md:p-10">
                  <div className="max-w-xs sm:max-w-md text-white space-y-2 sm:space-y-3 z-10">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 sm:py-1 rounded-md uppercase tracking-wider inline-block">
                      Promo Spesial
                    </span>
                    <h3 className="text-base sm:text-xl md:text-2xl font-black leading-snug line-clamp-2">
                      {banner.title}
                    </h3>
                    <div className="pt-0.5">
                      <Link to="/venues">
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold text-xs py-2 px-3.5 rounded-lg shadow-xs"
                        >
                          Klaim Promo Sekarang →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Arrows - Hanya tampil di Desktop/Tablet (Di Android/Mobile otomatis berganti tanpa panah yang menutupi teks) */}
          <button
            type="button"
            onClick={() =>
              setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)
            }
            aria-label="Slide promo sebelumnya"
            className="hidden md:flex absolute left-3.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-slate-800 hover:bg-white hover:scale-105 transition-all z-20 shadow-xs border border-slate-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
            aria-label="Slide promo berikutnya"
            className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-slate-800 hover:bg-white hover:scale-105 transition-all z-20 shadow-xs border border-slate-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator - Ditempatkan rapi di kanan bawah berbingkai agar tidak menimpa tombol aksi */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveBannerIdx(i)}
                aria-label={`Pindah ke banner promo ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  i === activeBannerIdx ? "w-5 bg-red-600" : "w-1.5 bg-white/70 hover:bg-white"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SEKSI VENUE POPULER DENGAN FILTER CEPAT KOTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Venue Lapangan Populer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilihan lapangan dengan rating tertinggi, fasilitas lengkap, dan lokasi strategis
            </p>
          </div>

          <Link
            to="/venues"
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Lihat Semua Venue ({venues.length}) →
          </Link>
        </div>

        {/* Grid Venue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularVenues.map((venue, idx) => (
            <VenueCard key={venue.id} venue={venue} distanceKm={2.3 + idx * 1.4} />
          ))}
        </div>
      </section>

      {/* 6. INFORMASI KEUNGGULAN PLATFORM (2 BARIS ZIG-ZAG SESUAI GAMBAR REFERENSI 1) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 pt-4">
        {/* Baris 1: Gambar 3D Kiri, Teks Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <picture>
              <source srcSet="/images/hero-booking-3d.webp" type="image/webp" />
              <img
                src="/images/hero-booking-3d.png"
                alt="Arenivo - Satu Aplikasi, Banyak Arena"
                loading="lazy"
                decoding="async"
                className="w-full max-w-[340px] sm:max-w-[380px] aspect-square object-contain select-none"
              />
            </picture>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pesan Lapangan dan Rencanain Sparring Jadi Gampang
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  Mudahnya Cek Jadwal dan Booking Lapangan.
                </h3>
                <p>
                  Pesan lapangan futsal maupun mini soccer sekaligus pilih jam bermain dengan mudah
                  dan cepat. Tidak perlu risau jadwal bentrok, hanya dengan satu sentuhan jari,
                  slot lapangan yang tim kamu butuhkan bisa langsung diamankan.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  Banyak Pilihan Venue Terbaik.
                </h3>
                <p>
                  Ada banyak pilihan arena olahraga berstandar resmi di berbagai kota. Tersedia
                  lapangan lantai vinyl, interlock, hingga rumput sintetis FIFA lengkap dengan
                  fasilitas ruang ganti, shower, tribun penonton, dan kantin.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  Banyak Pilihan Cara Pembayaran.
                </h3>
                <p>
                  Saat transaksi di Arenivo, kamu bisa memilih cara pembayaran sesuai
                  keinginan via Midtrans. Tersedia pilihan QRIS (GoPay, OVO, Dana, ShopeePay),
                  Virtual Account (BCA, Mandiri, BNI, BRI), hingga transfer bank instan. Prosesnya
                  mudah dan simpel!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Baris 2: Teks Kiri, Gambar Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Banjir Promo dan Benefit, Main Bareng Jadi Hemat!
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  Banyak Promo Spesial Venue.
                </h3>
                <p>
                  Banyak promo diskon untuk sewa lapangan favorit tim kamu. Gunakan kode voucher
                  potongan harga terbaik saat checkout agar patungan biaya sewa lapangan semakin
                  hemat setiap minggunya.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  Fleksibel Reschedule & Jaminan Refund.
                </h3>
                <p>
                  Dapatkan kenyamanan ekstra berupa fasilitas ubah jadwal (reschedule) serta
                  jaminan pengembalian dana (refund) yang transparan sesuai kebijakan waktu
                  pembatalan masing-masing venue.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-0.5">
                  24/7 Asisten & Layanan Bantuan.
                </h3>
                <p>
                  Melalui layanan bantuan dan asisten pintar 24/7, kami siap membantu mengecek
                  ketersediaan slot kosong, rekomendasikan lapangan terdekat, hingga membantu
                  kendala pemesanan tiketmu kapan saja.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <picture>
              <source srcSet="/images/hero-promo-3d.webp" type="image/webp" />
              <img
                src="/images/hero-promo-3d.png"
                alt="Promo Sewa Lapangan"
                loading="lazy"
                decoding="async"
                className="w-full max-w-[340px] sm:max-w-[380px] aspect-square object-contain select-none"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* 7. SEKSI FAQ ACCORDION (TANPA CARD, LEBAR SEJAJAR KONTEN UTAMA) */}
      {faqList.length > 0 && (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-6 sm:mb-8">
          FAQ
        </h2>

        <div className="divide-y divide-slate-200 border-b border-slate-200">
          {faqList.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <span
                    className={cn(
                      "font-bold text-sm sm:text-base transition-colors",
                      isOpen
                        ? "text-red-800"
                        : "text-slate-900 group-hover:text-red-700"
                    )}
                  >
                    {item.question}
                  </span>
                  <span className="shrink-0 text-slate-700">
                    {isOpen ? (
                      <X className="w-4 h-4 text-red-800" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-900" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.answers.length > 1 ? (
                      <ol className="list-decimal list-inside space-y-1.5">
                        {item.answers.map((ans, aIdx) => (
                          <li key={aIdx}>{ans}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>{item.answers[0]}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* 8. JAMINAN & NILAI LAYANAN / TRUST BADGES (DI BAWAH FAQ SESUAI GAMBAR REFERENSI USER) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Garansi Bebas Double Booking</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Slot dikunci secara real-time via Pusher saat checkout. Tidak ada lagi sengketa jadwal di lapangan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Konfirmasi & Tiket Otomatis</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Pembayaran QRIS dan Virtual Account terverifikasi seketika via Midtrans, langsung menerbitkan E-Tiket QR.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Check-in Mudah & Cepat</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Tunjukkan barcode QR Code dari ponsel Anda ke petugas lapangan tanpa perlu print kertas atau chat bukti bayar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
