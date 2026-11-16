import {
  BookingStatus,
  SlotStatus,
  UserRole,
  AccountStatus,
  MitraVerificationStatus,
  TicketScanResult,
  TicketStatus,
  RefundStatus,
  PaymentStatus,
  PayoutStatus,
  VenueStatus,
  AiProvider,
  type City,
  type Facility,
  type FieldType,
  type Venue,
  type Field,
  type SlotItem,
  type Booking,
  type Ticket,
  type TicketScan,
  type MitraBalance,
  type Payout,
  type Promo,
  type Banner,
  type Review,
  type Profile,
  type MitraProfile,
  type Refund,
  type Payment,
  type SystemConfig,
} from "@futsal/shared";

// -----------------------------------------------------------------------------
// 1. Master Data: Kota
// -----------------------------------------------------------------------------
export const MOCK_CITIES: City[] = [
  { id: "c1111111-1111-1111-1111-111111111111", name: "Jakarta Selatan", province: "DKI Jakarta" },
  { id: "c2222222-2222-2222-2222-222222222222", name: "Bandung", province: "Jawa Barat" },
  { id: "c3333333-3333-3333-3333-333333333333", name: "Surabaya", province: "Jawa Timur" },
  { id: "c4444444-4444-4444-4444-444444444444", name: "Yogyakarta", province: "DI Yogyakarta" },
  { id: "c5555555-5555-5555-5555-555555555555", name: "Medan", province: "Sumatera Utara" },
];

// -----------------------------------------------------------------------------
// 2. Master Data: Fasilitas
// -----------------------------------------------------------------------------
export const MOCK_FACILITIES: Facility[] = [
  { id: "f1111111-1111-1111-1111-111111111111", name: "Rumput Sintetis FIFA", icon: "sparkles" },
  { id: "f2222222-2222-2222-2222-222222222222", name: "Lampu Sorot LED HD", icon: "sun" },
  { id: "f3333333-3333-3333-3333-333333333333", name: "Ruang Ganti & Shower Panas", icon: "shower-head" },
  { id: "f4444444-4444-4444-4444-444444444444", name: "Parkir Luas & Gratis", icon: "car" },
  { id: "f5555555-5555-5555-5555-555555555555", name: "Musholla Ber-AC", icon: "moon" },
  { id: "f6666666-6666-6666-6666-666666666666", name: "Kantin & Sports Cafe", icon: "coffee" },
  { id: "f7777777-7777-7777-7777-777777777777", name: "Toilet Bersih", icon: "check" },
  { id: "f8888888-8888-8888-8888-888888888888", name: "Tribun Penonton", icon: "users" },
];

// -----------------------------------------------------------------------------
// 3. Master Data: Jenis Lapangan
// -----------------------------------------------------------------------------
export const MOCK_FIELD_TYPES: FieldType[] = [
  { id: "t1111111-1111-1111-1111-111111111111", code: "futsal_vinyl", name: "Futsal Vinyl Gerflor" },
  { id: "t2222222-2222-2222-2222-222222222222", code: "futsal_interlock", name: "Futsal Interlock Polypropylene" },
  { id: "t3333333-3333-3333-3333-333333333333", code: "futsal_sintetis", name: "Futsal Rumput Sintetis" },
  { id: "t4444444-4444-4444-4444-444444444444", code: "mini_soccer", name: "Mini Soccer 7 vs 7" },
];

// -----------------------------------------------------------------------------
// 4. Data Venue & Lapangan (Real DB: 1 Venue Champion Futsal Arena Cilandak)
// -----------------------------------------------------------------------------
export const MOCK_VENUES: Venue[] = [
  {
    id: "17ab8073-3d37-4c3d-b635-be37aabd35b2",
    mitraId: "d7b4043a-85fb-4543-a51e-ff263091391d",
    cityId: MOCK_CITIES[0].id,
    name: "Champion Futsal Arena Cilandak",
    slug: "champion-futsal-arena-cilandak",
    description:
      "Arena futsal modern berstandar internasional dengan lantai vinyl Taraflex dan rumput sintetis lembut. Dilengkapi pencahayaan LED sorot anti-silau.",
    address: "Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan",
    latitude: -6.2912,
    longitude: 106.8015,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules:
      "Wajib menggunakan sepatu sol karet (futsal) datar. Dilarang merokok di dalam arena. Harap datang 15 menit sebelum jam bermain.",
    status: "aktif",
    ratingAvg: 4.8,
    reviewCount: 24,
    startingPrice: 150000,
    city: MOCK_CITIES[0],
    photos: [
      {
        id: "p1",
        venueId: "17ab8073-3d37-4c3d-b635-be37aabd35b2",
        url: "https://images.unsplash.com/photo-1579952363873-27f5b4c4f5b2?auto=format&fit=crop&w=600&q=80",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "p2",
        venueId: "17ab8073-3d37-4c3d-b635-be37aabd35b2",
        url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80",
        isCover: false,
        sortOrder: 1,
      },
    ],
    facilities: [MOCK_FACILITIES[0], MOCK_FACILITIES[1], MOCK_FACILITIES[2], MOCK_FACILITIES[3], MOCK_FACILITIES[4], MOCK_FACILITIES[5]],
    refundRules: [
      { id: "rr1", minHoursBefore: 24, refundPercent: 100 },
      { id: "rr2", minHoursBefore: 6, refundPercent: 50 },
      { id: "rr3", minHoursBefore: 0, refundPercent: 0 },
    ],
  },
];

// -----------------------------------------------------------------------------
// 5. Data Lapangan (Real DB: 2 lapangan di Champion)
// -----------------------------------------------------------------------------
export const MOCK_FIELDS: Field[] = [
  {
    id: "370b8fb7-e526-4b38-989f-7e7012592d86",
    venueId: MOCK_VENUES[0].id,
    fieldTypeId: MOCK_FIELD_TYPES[0].id,
    name: "Lapangan Vinyl Taraflex A",
    sizeDescription: "26 x 16 meter (Standar Futsal)",
    surface: "Vinyl Taraflex 7mm",
    basePrice: 150000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[0],
  },
  {
    id: "25446a6c-73e6-4d80-bdf3-ccf1642dd6cd",
    venueId: MOCK_VENUES[0].id,
    fieldTypeId: MOCK_FIELD_TYPES[2].id,
    name: "Lapangan Rumput Sintetis B",
    sizeDescription: "25 x 15 meter",
    surface: "Rumput Sintetis Monofilament 50mm",
    basePrice: 175000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[2],
  },
];

// -----------------------------------------------------------------------------
// 6. Data Ulasan Penyewa Realistis
// -----------------------------------------------------------------------------
export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    bookingId: "fb0245bc-5f1b-4df3-9627-b657559978e8",
    userId: "9cc72c18-7d1d-48ad-b15b-b14301458e86",
    venueId: MOCK_VENUES[0].id,
    rating: 5,
    comment:
      "Lantai vinyl-nya empuk banget dan nggak licin sama sekali. Penerangan LED merata tanpa bayangan menyilaukan. Pasti bakal booking rutin!",
    reply: "Terima kasih banyak! Ditunggu kehadiran timnya di pekan berikutnya ya.",
    repliedAt: "2026-11-13 16:30:00+07:00",
    userName: "alfi fauzan",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    createdAt: "2026-11-13 16:15:00+07:00",
    isVisible: true,
  },
];

// -----------------------------------------------------------------------------
// 7. Data Notifikasi In-App
// -----------------------------------------------------------------------------
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export const MOCK_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "notif-1",
    title: "Tiket Booking Berhasil Terbit!",
    message: "Booking FB-E51AB7 di Champion Futsal Cilandak telah dikonfirmasi. Tunjukkan QR saat tiba.",
    type: "booking",
    isRead: false,
    createdAt: "10 menit yang lalu",
    linkUrl: "/tiket/fb0245bc-5f1b-4df3-9627-b657559978e8",
  },
  {
    id: "notif-2",
    title: "Promo Baru: Diskon Rp25.000",
    message: "Gunakan kode promo FUTSALASIK untuk hemat sewa lapangan minggu ini.",
    type: "promo",
    isRead: false,
    createdAt: "2 jam yang lalu",
    linkUrl: "/venues",
  },
  {
    id: "notif-3",
    title: "Pengingat Jadwal Bermain",
    message: "Jadwal main Anda di Champion Futsal Lapangan Vinyl Taraflex A akan dimulai dalam 3 jam.",
    type: "booking",
    isRead: true,
    createdAt: "Kemarin",
    linkUrl: "/pesanan",
  },
];

// -----------------------------------------------------------------------------
// 8. Data Slot Jadwal Per Jam (Matriks Ketersediaan)
// -----------------------------------------------------------------------------
export function generateMockSlots(fieldId: string, dateStr: string): SlotItem[] {
  const isVinyl = fieldId === "370b8fb7-e526-4b38-989f-7e7012592d86";
  const basePrice = isVinyl ? 150000 : 175000;

  // Cek apakah tanggal adalah hari ini, masa lalu, atau masa depan
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours();
  const isToday = dateStr === todayStr;
  const isPast = dateStr < todayStr;

  // Hash deterministik dari tanggal agar setiap tanggal memiliki ketersediaan unik
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 1000;
  }

  const hours: SlotItem[] = [];
  for (let h = 7; h <= 23; h++) {
    let status: SlotStatus = SlotStatus.TERSEDIA;
    let lockExpiresAt: string | undefined = undefined;
    let reason: string | undefined = undefined;

    if (isPast) {
      status = SlotStatus.LEWAT;
    } else if (isToday && h <= currentHour) {
      status = SlotStatus.LEWAT;
    } else {
      // Pola ketersediaan dinamis per tanggal
      const slotHash = (seed + h * 13) % 12;
      if (slotHash === 1 && h >= 18) {
        status = SlotStatus.TERISI;
      } else if (slotHash === 2 && h === 12) {
        status = SlotStatus.DIBLOKIR;
        reason = "Maintenance lapangan";
      } else if (slotHash === 3 && h === 20 && isToday) {
        status = SlotStatus.DIKUNCI;
        lockExpiresAt = new Date(Date.now() + 12 * 60000).toISOString();
      }
    }

    const padHour = String(h).padStart(2, "0");
    const padNext = String((h + 1) % 24).padStart(2, "0");
    const isMalam = h >= 18;
    const finalPrice = isMalam ? basePrice + 35000 : basePrice;

    hours.push({
      slotStart: `${dateStr}T${padHour}:00:00+07:00`,
      slotEnd: `${dateStr}T${padNext}:00:00+07:00`,
      timeLabel: `${padHour}.00 - ${padNext}.00`,
      hour: h,
      status,
      price: finalPrice,
      lockExpiresAt,
      reason,
    });
  }

  return hours;
}

// -----------------------------------------------------------------------------
// 9. Data Simulasi Booking (Pesanan) Lintas Status (Real DB)
// -----------------------------------------------------------------------------
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "fb0245bc-5f1b-4df3-9627-b657559978e8",
    bookingCode: "FB-E51AB7",
    userId: "9cc72c18-7d1d-48ad-b15b-b14301458e86",
    customerName: "alfi fauzan",
    customerPhone: "081234567890",
    fieldId: MOCK_FIELDS[0].id,
    venueId: MOCK_VENUES[0].id,
    playStart: "2026-11-13T22:00:00+07:00",
    playEnd: "2026-11-13T23:00:00+07:00",
    totalHours: 1,
    source: "online",
    status: BookingStatus.SELESAI,
    subtotal: 150000,
    serviceFee: 5000,
    discount: 0,
    totalPrice: 155000,
    commissionRate: 0.1,
    platformCommission: 15000,
    mitraAmount: 135000,
    notes: "Booking online via Arenivo Web",
    rescheduleCount: 0,
    createdAt: "2026-11-13T20:27:01+07:00",
    venue: MOCK_VENUES[0],
    field: MOCK_FIELDS[0],
  },
  {
    id: "04b2a969-f480-4935-8382-f4667a9b3b77",
    bookingCode: "FB-C2QGWK",
    userId: "9cc72c18-7d1d-48ad-b15b-b14301458e86",
    customerName: "alfi fauzan",
    customerPhone: "081234567890",
    fieldId: MOCK_FIELDS[0].id,
    venueId: MOCK_VENUES[0].id,
    playStart: "2026-11-15T07:00:00+07:00",
    playEnd: "2026-11-15T08:00:00+07:00",
    totalHours: 1,
    source: "online",
    status: BookingStatus.KEDALUWARSA,
    subtotal: 150000,
    serviceFee: 5000,
    discount: 0,
    totalPrice: 155000,
    commissionRate: 0.1,
    platformCommission: 15000,
    mitraAmount: 135000,
    expiresAt: "2026-11-14T06:14:06+07:00",
    rescheduleCount: 0,
    createdAt: "2026-11-14T05:59:06+07:00",
    venue: MOCK_VENUES[0],
    field: MOCK_FIELDS[0],
  },
];

// -----------------------------------------------------------------------------
// 10. Data Simulasi E-Tiket & Scanner
// -----------------------------------------------------------------------------
export const MOCK_TICKETS: Ticket[] = [
  {
    id: "tkt-1",
    bookingId: MOCK_BOOKINGS[0].id,
    ticketCode: "TKT-FB-E51AB7-9A2",
    status: TicketStatus.AKTIF,
    issuedAt: "2026-11-13T20:35:00+07:00",
    booking: MOCK_BOOKINGS[0],
  },
];

export const MOCK_SCANS: TicketScan[] = [
  {
    id: "scn-1",
    ticketId: "tkt-1",
    scannedCode: "TKT-FB-E51AB7-9A2",
    venueId: MOCK_VENUES[0].id,
    scannedBy: "mitra-admin-1",
    result: TicketScanResult.SAH,
    scannedAt: "2026-11-13T22:45:12+07:00",
  },
];

// -----------------------------------------------------------------------------
// 11. Data Keuangan & Payout Mitra (Real data from DB)
// -----------------------------------------------------------------------------
export const MOCK_MITRA_BALANCE: MitraBalance = {
  mitraId: "d7b4043a-85fb-4543-a51e-ff263091391d",
  saldoTotal: 135000,
  saldoTertahan: 0,
  saldoBisaDicairkan: 135000,
};

export const MOCK_PAYOUTS: Payout[] = [];

// -----------------------------------------------------------------------------
// 12. Promo & Banner
// -----------------------------------------------------------------------------
export const MOCK_BANNERS: Banner[] = [
  {
    id: "b1",
    title: "Diskon 25% Main Malam Futsal & Mini Soccer",
    imageUrl:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80",
    linkUrl: "/venues",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "b2",
    title: "Spesial Hari Olahraga: Cashback Rp50.000 QRIS",
    imageUrl:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80",
    linkUrl: "/venues",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "b3",
    title: "Garansi 100% Bebas Double Booking dengan Sistem Real-Time",
    imageUrl:
      "https://images.unsplash.com/photo-1612225220822-30ab95978d91?auto=format&fit=crop&w=600&q=80",
    linkUrl: "/venues",
    sortOrder: 2,
    isActive: true,
  },
];

export const MOCK_PROMOS: Promo[] = [
  {
    id: "pr-1",
    code: "FUTSALASIK",
    discountType: "fixed",
    discountValue: 25000,
    minSpend: 200000,
    quota: 100,
    usedCount: 38,
    startDate: "2026-11-01T00:00:00+07:00",
    endDate: "2026-11-30T23:59:59+07:00",
    isActive: true,
  },
  {
    id: "pr-2",
    code: "WEEKENDSERU",
    discountType: "percent",
    discountValue: 10,
    minSpend: 300000,
    maxDiscount: 50000,
    quota: 50,
    usedCount: 14,
    startDate: "2026-11-01T00:00:00+07:00",
    endDate: "2026-11-30T23:59:59+07:00",
    isActive: true,
  },
];

// -----------------------------------------------------------------------------
// 13. Pengguna Penyewa Platform
// -----------------------------------------------------------------------------
export const MOCK_USERS: (Profile & { bookingsCount: number })[] = [
  {
    id: "9cc72c18-7d1d-48ad-b15b-b14301458e86",
    fullName: "alfi fauzan",
    email: "alfifauzan897@gmail.com",
    phone: "081234567890",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    role: UserRole.PENYEWA,
    status: AccountStatus.AKTIF,
    createdAt: "2026-11-13T12:58:01+07:00",
    bookingsCount: 2,
  },
];

// -----------------------------------------------------------------------------
// 14. Data Profil & Dokumen Mitra (Verifikasi)
// -----------------------------------------------------------------------------
export const MOCK_MITRA_PROFILES: (MitraProfile & { email: string; phone: string; venuesCount: number })[] = [
  {
    id: "d7b4043a-85fb-4543-a51e-ff263091391d",
    userId: "f6038a8d-9c02-4bb3-b93a-45e2ac7ac22d",
    businessName: "Champion Arena Group",
    businessAddress: "Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan",
    documentUrl: "https://example.com/doc-ktp.pdf",
    verificationStatus: MitraVerificationStatus.DISETUJUI,
    bankName: "BCA",
    bankAccountNumber: "8830192837",
    bankAccountHolder: "Budi Santoso",
    verifiedBy: "366adc6f-5497-4bf1-b17e-7c2c705735b3",
    verifiedAt: "2026-11-14T03:54:50+07:00",
    createdAt: "2026-10-24T19:17:05+07:00",
    email: "mitra@arenivo.id",
    phone: "081546446576",
    venuesCount: 1,
  },
];

// -----------------------------------------------------------------------------
// 15. Data Pembayaran Midtrans Gateway
// -----------------------------------------------------------------------------
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    bookingId: "fb0245bc-5f1b-4df3-9627-b657559978e8",
    midtransOrderId: "MID-FB-E51AB7",
    midtransTransactionId: "mid-trx-987123612",
    paymentType: "qris",
    grossAmount: 155000,
    status: PaymentStatus.BERHASIL,
    paidAt: "2026-11-13T20:35:12+07:00",
    createdAt: "2026-11-13T20:30:00+07:00",
  },
];

// -----------------------------------------------------------------------------
// 16. Data Refund & Pengembalian Dana
// -----------------------------------------------------------------------------
export const MOCK_REFUNDS: (Refund & { bookingCode: string; customerName: string; venueName: string })[] = [];

// -----------------------------------------------------------------------------
// 17. Konfigurasi Sistem Platform (system_settings)
// -----------------------------------------------------------------------------
export const MOCK_SYSTEM_CONFIG: SystemConfig = {
  bookingExpirationMinutes: 15,
  maxBookingDaysAhead: 30,
  defaultPlatformCommissionPercent: 10,
  defaultServiceFeeRupiah: 5000,
  minPayoutAmountRupiah: 100000,
  scannerEarlyCheckinMinutes: 30,
  primaryAiProvider: AiProvider.GEMINI,
};

// -----------------------------------------------------------------------------
// 18. Audit Log Aktivitas Super Admin
// -----------------------------------------------------------------------------
export interface AuditLogItem {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    adminEmail: "admin@arenivo.id",
    action: "VERIFY_MITRA",
    targetType: "MitraProfile",
    targetId: "d7b4043a-85fb-4543-a51e-ff263091391d",
    details: "Menyetujui verifikasi mitra Champion Arena Group setelah pengecekan kelengkapan NIB dan KTP.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-11-14T03:54:50+07:00",
  },
];