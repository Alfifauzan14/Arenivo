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
// 4. Data Venue & Lapangan (6 Venue Realistis)
// -----------------------------------------------------------------------------
export const MOCK_VENUES: Venue[] = [
  {
    id: "v1111111-1111-1111-1111-111111111111",
    mitraId: "m1111111-1111-1111-1111-111111111111",
    cityId: MOCK_CITIES[0].id,
    name: "Spartan Futsal Arena Cilandak",
    slug: "spartan-futsal-arena-cilandak",
    description:
      "Arena futsal modern berstandar internasional di Jakarta Selatan dengan lantai vinyl impor, ventilasi sejuk, pencahayaan bebas silau, dan fasilitas lengkap untuk turnamen maupun fun match mingguan.",
    address: "Jl. TB Simatupang No. 45, Cilandak Barat, Jakarta Selatan",
    latitude: -6.2915,
    longitude: 106.7984,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules:
      "1. Wajib mengenakan sepatu sol karet non-marking untuk lantai vinyl.\n2. Dilarang merokok dan membawa minuman keras ke area lapangan.\n3. Harap datang 15 menit sebelum jam mulai bermain.",
    status: "aktif",
    ratingAvg: 4.9,
    reviewCount: 148,
    startingPrice: 175000,
    city: MOCK_CITIES[0],
    photos: [
      {
        id: "p1",
        venueId: "v1111111-1111-1111-1111-111111111111",
        url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "p2",
        venueId: "v1111111-1111-1111-1111-111111111111",
        url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
        isCover: false,
        sortOrder: 1,
      },
      {
        id: "p3",
        venueId: "v1111111-1111-1111-1111-111111111111",
        url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        isCover: false,
        sortOrder: 2,
      },
    ],
    facilities: [MOCK_FACILITIES[0], MOCK_FACILITIES[1], MOCK_FACILITIES[2], MOCK_FACILITIES[3], MOCK_FACILITIES[4], MOCK_FACILITIES[5]],
    refundRules: [
      { id: "rr1", minHoursBefore: 24, refundPercent: 100 },
      { id: "rr2", minHoursBefore: 6, refundPercent: 50 },
      { id: "rr3", minHoursBefore: 0, refundPercent: 0 },
    ],
  },
  {
    id: "v2222222-2222-2222-2222-222222222222",
    mitraId: "m2222222-2222-2222-2222-222222222222",
    cityId: MOCK_CITIES[1].id,
    name: "Champion Mini Soccer & Futsal Pasteur",
    slug: "champion-mini-soccer-futsal-pasteur",
    description:
      "Kompleks olahraga favorit di Pasteur Bandung dengan 2 lapangan mini soccer outdoor rumput monofilament tebal dan 2 lapangan futsal interlock anti-cedera. Dekat pintu tol Pasteur.",
    address: "Jl. Dr. Djunjunan No. 128, Pasteur, Sukajadi, Kota Bandung",
    latitude: -6.8951,
    longitude: 107.5782,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Sepatu pul karet disarankan untuk mini soccer. Booking tidak dapat di-reschedule kurang dari 24 jam.",
    status: "aktif",
    ratingAvg: 4.8,
    reviewCount: 96,
    startingPrice: 200000,
    city: MOCK_CITIES[1],
    photos: [
      {
        id: "p4",
        venueId: "v2222222-2222-2222-2222-222222222222",
        url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "p5",
        venueId: "v2222222-2222-2222-2222-222222222222",
        url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
        isCover: false,
        sortOrder: 1,
      },
    ],
    facilities: [MOCK_FACILITIES[0], MOCK_FACILITIES[1], MOCK_FACILITIES[3], MOCK_FACILITIES[5], MOCK_FACILITIES[7]],
    refundRules: [
      { id: "rr4", minHoursBefore: 24, refundPercent: 100 },
      { id: "rr5", minHoursBefore: 6, refundPercent: 50 },
      { id: "rr6", minHoursBefore: 0, refundPercent: 0 },
    ],
  },
  {
    id: "v3333333-3333-3333-3333-333333333333",
    mitraId: "m3333333-3333-3333-3333-333333333333",
    cityId: MOCK_CITIES[2].id,
    name: "Garuda Sport Center Darmo",
    slug: "garuda-sport-center-darmo",
    description:
      "Pusat futsal dan mini soccer terlengkap di Surabaya Selatan dengan kafetaria nyaman, tribun kapasitas 200 orang, dan loker penyimpanan barang dengan sistem smart key.",
    address: "Jl. Raya Darmo Permai III No. 8, Dukuh Pakis, Surabaya",
    latitude: -7.2894,
    longitude: 112.6938,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Gunakan seragam olahraga dan jaga kebersihan area ganti baju.",
    status: "aktif",
    ratingAvg: 4.7,
    reviewCount: 72,
    startingPrice: 150000,
    city: MOCK_CITIES[2],
    photos: [
      {
        id: "p6",
        venueId: "v3333333-3333-3333-3333-333333333333",
        url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
    ],
    facilities: [MOCK_FACILITIES[1], MOCK_FACILITIES[2], MOCK_FACILITIES[3], MOCK_FACILITIES[6]],
    refundRules: [
      { id: "rr7", minHoursBefore: 24, refundPercent: 100 },
      { id: "rr8", minHoursBefore: 6, refundPercent: 50 },
      { id: "rr9", minHoursBefore: 0, refundPercent: 0 },
    ],
  },
  {
    id: "v4444444-4444-4444-4444-444444444444",
    mitraId: "m4444444-4444-4444-4444-444444444444",
    cityId: MOCK_CITIES[0].id,
    name: "Kuningan Sports Hub Futsal",
    slug: "kuningan-sports-hub-futsal",
    description:
      "Lapangan futsal rooftop di pusat bisnis Kuningan Jakarta. Dilengkapi fasilitas shower air panas premium dan viewing deck skyline kota Jakarta.",
    address: "Jl. Prof. DR. Satrio Kav. 18, Kuningan, Jakarta Selatan",
    latitude: -6.2238,
    longitude: 106.8276,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Wajib scan QR e-tiket sebelum memasuki arena rooftop.",
    status: "aktif",
    ratingAvg: 4.9,
    reviewCount: 210,
    startingPrice: 220000,
    city: MOCK_CITIES[0],
    photos: [
      {
        id: "p7",
        venueId: "v4444444-4444-4444-4444-444444444444",
        url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
    ],
    facilities: [MOCK_FACILITIES[0], MOCK_FACILITIES[1], MOCK_FACILITIES[2], MOCK_FACILITIES[5], MOCK_FACILITIES[7]],
  },
  {
    id: "v5555555-5555-5555-5555-555555555555",
    mitraId: "m5555555-5555-5555-5555-555555555555",
    cityId: MOCK_CITIES[3].id,
    name: "Mataram Stadium Mini Soccer",
    slug: "mataram-stadium-mini-soccer",
    description:
      "Lapangan mini soccer berstandar FIFA di Yogyakarta. Rumput sintetis impor dengan drainase terbaik, bebas banjir saat musim hujan.",
    address: "Jl. Kaliurang Km. 9, Ngaglik, Sleman, DI Yogyakarta",
    latitude: -7.7314,
    longitude: 110.3924,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Dilarang membuang permen karet atau puntung rokok di atas rumput sintetis.",
    status: "aktif",
    ratingAvg: 4.8,
    reviewCount: 115,
    startingPrice: 180000,
    city: MOCK_CITIES[3],
    photos: [
      {
        id: "p8",
        venueId: "v5555555-5555-5555-5555-555555555555",
        url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
    ],
    facilities: [MOCK_FACILITIES[0], MOCK_FACILITIES[1], MOCK_FACILITIES[3], MOCK_FACILITIES[4], MOCK_FACILITIES[6]],
  },
  {
    id: "v6666666-6666-6666-6666-666666666666",
    mitraId: "m6666666-6666-6666-6666-666666666666",
    cityId: MOCK_CITIES[4].id,
    name: "Medan Utama Futsal Center",
    slug: "medan-utama-futsal-center",
    description:
      "Arena futsal indoor terbesar di Kota Medan dengan 4 lapangan vinyl dan kafe kopi premium untuk bersantai bersama tim setelah bermain.",
    address: "Jl. Gatot Subroto No. 204, Sei Sikambing D, Medan",
    latitude: 3.5852,
    longitude: 98.6578,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rules: "Maksimal 12 orang per lapangan futsal demi kenyamanan bermain.",
    status: "aktif",
    ratingAvg: 4.6,
    reviewCount: 88,
    startingPrice: 140000,
    city: MOCK_CITIES[4],
    photos: [
      {
        id: "p9",
        venueId: "v6666666-6666-6666-6666-666666666666",
        url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 0,
      },
    ],
    facilities: [MOCK_FACILITIES[1], MOCK_FACILITIES[2], MOCK_FACILITIES[3], MOCK_FACILITIES[5]],
  },
];

export const MOCK_FIELDS: Field[] = [
  {
    id: "fld-1",
    venueId: MOCK_VENUES[0].id,
    fieldTypeId: MOCK_FIELD_TYPES[0].id,
    name: "Lapangan A (Vinyl Pro)",
    sizeDescription: "26 x 16 meter (Standar Futsal Nasional)",
    surface: "Vinyl Gerflor 7.5mm Wood Texture",
    basePrice: 175000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[0],
  },
  {
    id: "fld-2",
    venueId: MOCK_VENUES[0].id,
    fieldTypeId: MOCK_FIELD_TYPES[1].id,
    name: "Lapangan B (Interlock Elite)",
    sizeDescription: "25 x 15 meter",
    surface: "Interlock Polypropylene Anti-Slip",
    basePrice: 160000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[1],
  },
  {
    id: "fld-3",
    venueId: MOCK_VENUES[1].id,
    fieldTypeId: MOCK_FIELD_TYPES[3].id,
    name: "Mini Soccer Lapangan 1",
    sizeDescription: "50 x 30 meter (7 vs 7)",
    surface: "Rumput Sintetis Monofilament 50mm + Infill",
    basePrice: 350000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[3],
  },
  {
    id: "fld-4",
    venueId: MOCK_VENUES[1].id,
    fieldTypeId: MOCK_FIELD_TYPES[3].id,
    name: "Mini Soccer Lapangan 2",
    sizeDescription: "50 x 30 meter (7 vs 7)",
    surface: "Rumput Sintetis Monofilament 50mm",
    basePrice: 350000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[3],
  },
  {
    id: "fld-5",
    venueId: MOCK_VENUES[2].id,
    fieldTypeId: MOCK_FIELD_TYPES[1].id,
    name: "Lapangan Utama Darmo",
    sizeDescription: "26 x 16 meter",
    surface: "Interlock Polypropylene Anti-Slip",
    basePrice: 150000,
    status: "aktif",
    fieldType: MOCK_FIELD_TYPES[1],
  },
];

// -----------------------------------------------------------------------------
// 5. Data Ulasan Penyewa Realistis
// -----------------------------------------------------------------------------
export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    bookingId: "bk-33333333-3333-3333-3333-333333333333",
    userId: "usr-2",
    venueId: MOCK_VENUES[0].id,
    rating: 5,
    comment:
      "Lantai vinyl-nya empuk banget dan nggak licin sama sekali. Penerangan LED merata tanpa bayangan menyilaukan. Pasti bakal booking rutin tiap Kamis malam!",
    reply: "Terima kasih banyak Mas Bambang! Ditunggu kehadiran timnya di pekan berikutnya ya.",
    repliedAt: "2026-10-14T20:30:00+07:00",
    userName: "Bambang Pamungkas",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    createdAt: "2026-10-14T19:15:00+07:00",
    isVisible: true,
  },
  {
    id: "rev-2",
    bookingId: "bk-11111111-1111-1111-1111-111111111111",
    userId: "usr-1",
    venueId: MOCK_VENUES[0].id,
    rating: 5,
    comment:
      "Check-in pakai QR Code cuma 2 detik langsung masuk, tanpa ribet konfirmasi ke kasir. Lapangan bersih, shower air panasnya mantap!",
    userName: "Rizky Ramadhan",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    createdAt: "2026-10-12T22:00:00+07:00",
    isVisible: true,
  },
  {
    id: "rev-3",
    bookingId: "bk-44444444-4444-4444-4444-444444444444",
    userId: "usr-3",
    venueId: MOCK_VENUES[1].id,
    rating: 4,
    comment:
      "Rumput mini soccer tebal dan terawat. Area parkirnya luas muat banyak mobil dan motor komunitas. Rekomen untuk sparring 7 vs 7.",
    reply: "Terima kasih Mas atas ulasannya! Kami selalu menjaga ketebalan infill rumput secara berkala.",
    repliedAt: "2026-10-11T10:00:00+07:00",
    userName: "Fajar Nugraha",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    createdAt: "2026-10-10T21:40:00+07:00",
    isVisible: true,
  },
];

// -----------------------------------------------------------------------------
// 6. Data Notifikasi In-App
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
    message: "Booking FB-8K2M4Q di Spartan Futsal Cilandak telah dikonfirmasi. Tunjukkan QR saat tiba.",
    type: "booking",
    isRead: false,
    createdAt: "10 menit yang lalu",
    linkUrl: "/tiket/bk-11111111-1111-1111-1111-111111111111",
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
    message: "Jadwal main Anda di Spartan Futsal Lapangan A akan dimulai dalam 3 jam.",
    type: "booking",
    isRead: true,
    createdAt: "Kemarin",
    linkUrl: "/pesanan",
  },
];

// -----------------------------------------------------------------------------
// 7. Data Slot Jadwal Per Jam (Matriks Ketersediaan)
// -----------------------------------------------------------------------------
export function generateMockSlots(fieldId: string, dateStr: string): SlotItem[] {
  const isMini = fieldId === "fld-3" || fieldId === "fld-4";
  const basePrice = isMini ? 350000 : 175000;
  const hours = [
    { hour: 8, status: SlotStatus.LEWAT },
    { hour: 9, status: SlotStatus.LEWAT },
    { hour: 10, status: SlotStatus.TERSEDIA },
    { hour: 11, status: SlotStatus.TERSEDIA },
    { hour: 12, status: SlotStatus.DIBLOKIR, reason: "Maintenance lapangan siang" },
    { hour: 13, status: SlotStatus.TERSEDIA },
    { hour: 14, status: SlotStatus.TERSEDIA },
    { hour: 15, status: SlotStatus.TERSEDIA },
    { hour: 16, status: SlotStatus.TERISI },
    { hour: 17, status: SlotStatus.TERISI },
    { hour: 18, status: SlotStatus.DIKUNCI, lockExpiresAt: new Date(Date.now() + 10 * 60000).toISOString() },
    { hour: 19, status: SlotStatus.TERSEDIA },
    { hour: 20, status: SlotStatus.TERSEDIA },
    { hour: 21, status: SlotStatus.TERSEDIA },
    { hour: 22, status: SlotStatus.TERSEDIA },
    { hour: 23, status: SlotStatus.TERSEDIA },
  ];

  return hours.map((item) => {
    const padHour = String(item.hour).padStart(2, "0");
    const padNext = String(item.hour + 1).padStart(2, "0");
    const isMalam = item.hour >= 18;
    const finalPrice = isMalam ? basePrice + 35000 : basePrice;

    return {
      slotStart: `${dateStr}T${padHour}:00:00+07:00`,
      slotEnd: `${dateStr}T${padNext}:00:00+07:00`,
      timeLabel: `${padHour}.00 - ${padNext}.00`,
      hour: item.hour,
      status: item.status,
      price: finalPrice,
      lockExpiresAt: item.lockExpiresAt,
      reason: item.reason,
    };
  });
}

// -----------------------------------------------------------------------------
// 8. Data Simulasi Booking (Pesanan) Lintas Status
// -----------------------------------------------------------------------------
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-11111111-1111-1111-1111-111111111111",
    bookingCode: "FB-8K2M4Q",
    userId: "usr-1",
    customerName: "Rizky Ramadhan",
    customerPhone: "081234567890",
    fieldId: MOCK_FIELDS[0].id,
    venueId: MOCK_VENUES[0].id,
    playStart: "2026-10-15T19:00:00+07:00",
    playEnd: "2026-10-15T21:00:00+07:00",
    totalHours: 2,
    source: "online",
    status: BookingStatus.DIKONFIRMASI,
    subtotal: 420000,
    serviceFee: 5000,
    discount: 25000,
    totalPrice: 400000,
    commissionRate: 0.1,
    platformCommission: 42000,
    mitraAmount: 378000,
    notes: "Tolong siapkan rompi warna hijau dan bola baru",
    rescheduleCount: 0,
    createdAt: "2026-10-15T08:30:00+07:00",
    venue: MOCK_VENUES[0],
    field: MOCK_FIELDS[0],
  },
  {
    id: "bk-22222222-2222-2222-2222-222222222222",
    bookingCode: "FB-7N9X2P",
    userId: "usr-1",
    customerName: "Rizky Ramadhan",
    customerPhone: "081234567890",
    fieldId: MOCK_FIELDS[0].id,
    venueId: MOCK_VENUES[0].id,
    playStart: "2026-10-16T20:00:00+07:00",
    playEnd: "2026-10-16T21:00:00+07:00",
    totalHours: 1,
    source: "online",
    status: BookingStatus.MENUNGGU_BAYAR,
    subtotal: 210000,
    serviceFee: 5000,
    discount: 0,
    totalPrice: 215000,
    commissionRate: 0.1,
    platformCommission: 21000,
    mitraAmount: 189000,
    expiresAt: new Date(Date.now() + 14 * 60000).toISOString(),
    rescheduleCount: 0,
    createdAt: new Date().toISOString(),
    venue: MOCK_VENUES[0],
    field: MOCK_FIELDS[0],
  },
  {
    id: "bk-33333333-3333-3333-3333-333333333333",
    bookingCode: "FB-4L1B8C",
    userId: "usr-2",
    customerName: "Bambang Pamungkas",
    customerPhone: "081987654321",
    fieldId: MOCK_FIELDS[1].id,
    venueId: MOCK_VENUES[0].id,
    playStart: "2026-10-14T16:00:00+07:00",
    playEnd: "2026-10-14T18:00:00+07:00",
    totalHours: 2,
    source: "online",
    status: BookingStatus.SELESAI,
    subtotal: 320000,
    serviceFee: 5000,
    discount: 0,
    totalPrice: 325000,
    commissionRate: 0.1,
    platformCommission: 32000,
    mitraAmount: 288000,
    rescheduleCount: 0,
    createdAt: "2026-10-13T10:00:00+07:00",
    venue: MOCK_VENUES[0],
    field: MOCK_FIELDS[1],
  },
  {
    id: "bk-44444444-4444-4444-4444-444444444444",
    bookingCode: "FB-9W3K1Z",
    userId: "usr-3",
    customerName: "Futsal Squad UI",
    customerPhone: "085612345678",
    fieldId: MOCK_FIELDS[2].id,
    venueId: MOCK_VENUES[1].id,
    playStart: "2026-10-12T19:00:00+07:00",
    playEnd: "2026-10-12T21:00:00+07:00",
    totalHours: 2,
    source: "online",
    status: BookingStatus.DIBATALKAN,
    subtotal: 700000,
    serviceFee: 5000,
    discount: 0,
    totalPrice: 705000,
    commissionRate: 0.1,
    platformCommission: 70000,
    mitraAmount: 630000,
    cancelReason: "Hujan badai dan penyewa membatalkan H-2 (Refund 100%)",
    rescheduleCount: 0,
    createdAt: "2026-10-10T14:00:00+07:00",
    venue: MOCK_VENUES[1],
    field: MOCK_FIELDS[2],
  },
];

// -----------------------------------------------------------------------------
// 9. Data Simulasi E-Tiket & Scanner
// -----------------------------------------------------------------------------
export const MOCK_TICKETS: Ticket[] = [
  {
    id: "tkt-1",
    bookingId: MOCK_BOOKINGS[0].id,
    ticketCode: "TKT-FB-8K2M4Q-9A2",
    status: TicketStatus.AKTIF,
    issuedAt: "2026-10-15T08:35:00+07:00",
    booking: MOCK_BOOKINGS[0],
  },
  {
    id: "tkt-2",
    bookingId: MOCK_BOOKINGS[2].id,
    ticketCode: "TKT-FB-4L1B8C-5D1",
    status: TicketStatus.DIGUNAKAN,
    issuedAt: "2026-10-13T10:05:00+07:00",
    usedAt: "2026-10-14T15:45:00+07:00",
    booking: MOCK_BOOKINGS[2],
  },
];

export const MOCK_SCANS: TicketScan[] = [
  {
    id: "scn-1",
    ticketId: "tkt-2",
    scannedCode: "TKT-FB-4L1B8C-5D1",
    venueId: MOCK_VENUES[0].id,
    scannedBy: "mitra-admin-1",
    result: TicketScanResult.SAH,
    scannedAt: "2026-10-14T15:45:12+07:00",
  },
  {
    id: "scn-2",
    ticketId: "tkt-2",
    scannedCode: "TKT-FB-4L1B8C-5D1",
    venueId: MOCK_VENUES[0].id,
    scannedBy: "mitra-admin-1",
    result: TicketScanResult.SUDAH_DIPAKAI,
    scannedAt: "2026-10-14T15:48:30+07:00",
  },
];

// -----------------------------------------------------------------------------
// 10. Data Keuangan & Payout Mitra
// -----------------------------------------------------------------------------
export const MOCK_MITRA_BALANCE: MitraBalance = {
  mitraId: "m1111111-1111-1111-1111-111111111111",
  saldoTotal: 4850000,
  saldoTertahan: 378000,
  saldoBisaDicairkan: 4472000,
};

export const MOCK_PAYOUTS: Payout[] = [
  {
    id: "po-1",
    mitraId: "m1111111-1111-1111-1111-111111111111",
    amount: 2500000,
    status: "selesai",
    bankName: "BCA",
    bankAccountNumber: "8830128491",
    bankAccountHolder: "PT Spartan Olahraga Sejahtera",
    transferReference: "TRF-BCA-20261010-91823",
    createdAt: "2026-10-10T09:00:00+07:00",
  },
  {
    id: "po-2",
    mitraId: "m1111111-1111-1111-1111-111111111111",
    amount: 1500000,
    status: "diproses",
    bankName: "BCA",
    bankAccountNumber: "8830128491",
    bankAccountHolder: "PT Spartan Olahraga Sejahtera",
    createdAt: "2026-10-14T14:30:00+07:00",
  },
];

// -----------------------------------------------------------------------------
// 11. Promo & Banner
// -----------------------------------------------------------------------------
export const MOCK_BANNERS: Banner[] = [
  {
    id: "b1",
    title: "Main Futsal Malam Hemat Diskon 20%!",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "/venues",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "b2",
    title: "Turnamen Mini Soccer Komunitas Akhir Pekan",
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "/venues",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "b3",
    title: "Garansi 100% Bebas Double Booking dengan Sistem Real-Time",
    imageUrl:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
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
    startDate: "2026-10-01T00:00:00+07:00",
    endDate: "2026-10-31T23:59:59+07:00",
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
    startDate: "2026-10-01T00:00:00+07:00",
    endDate: "2026-10-31T23:59:59+07:00",
    isActive: true,
  },
];

// -----------------------------------------------------------------------------
// 12. Pengguna Penyewa Platform
// -----------------------------------------------------------------------------
export const MOCK_USERS: (Profile & { bookingsCount: number })[] = [
  {
    id: "usr-1",
    fullName: "Rizky Ramadhan",
    email: "rizky.ramadhan@example.com",
    phone: "081234567890",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    role: UserRole.PENYEWA,
    status: AccountStatus.AKTIF,
    createdAt: "2026-09-15T10:00:00+07:00",
    bookingsCount: 8,
  },
  {
    id: "usr-2",
    fullName: "Bambang Pamungkas",
    email: "bambang.p@example.com",
    phone: "081987654321",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    role: UserRole.PENYEWA,
    status: AccountStatus.AKTIF,
    createdAt: "2026-09-20T14:30:00+07:00",
    bookingsCount: 12,
  },
  {
    id: "usr-3",
    fullName: "Fajar Nugraha",
    email: "fajar.nugraha@example.com",
    phone: "085612345678",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    role: UserRole.PENYEWA,
    status: AccountStatus.AKTIF,
    createdAt: "2026-10-01T09:15:00+07:00",
    bookingsCount: 3,
  },
  {
    id: "usr-4",
    fullName: "Dimas Anggara",
    email: "dimas.anggara@spammer.net",
    phone: "081399887766",
    role: UserRole.PENYEWA,
    status: AccountStatus.DIBLOKIR,
    createdAt: "2026-10-05T11:20:00+07:00",
    bookingsCount: 0,
  },
  {
    id: "usr-5",
    fullName: "Doni Tata",
    email: "doni.tata@example.com",
    phone: "082155667788",
    role: UserRole.PENYEWA,
    status: AccountStatus.AKTIF,
    createdAt: "2026-10-08T16:45:00+07:00",
    bookingsCount: 5,
  },
];

// -----------------------------------------------------------------------------
// 13. Data Profil & Dokumen Mitra (Verifikasi)
// -----------------------------------------------------------------------------
export const MOCK_MITRA_PROFILES: (MitraProfile & { email: string; phone: string; venuesCount: number })[] = [
  {
    id: "mp-1",
    userId: "m1111111-1111-1111-1111-111111111111",
    businessName: "PT Spartan Olahraga Sejahtera",
    businessAddress: "Jl. TB Simatupang No. 45, Cilandak Barat, Jakarta Selatan",
    documentUrl: "https://storage.googleapis.com/futsal-docs/spartan-nib-siup-signed.pdf",
    verificationStatus: MitraVerificationStatus.DISETUJUI,
    bankName: "BCA",
    bankAccountNumber: "8830128491",
    bankAccountHolder: "PT Spartan Olahraga Sejahtera",
    verifiedBy: "adm-1",
    verifiedAt: "2026-09-01T10:00:00+07:00",
    createdAt: "2026-08-28T14:20:00+07:00",
    email: "owner@spartanfutsal.co.id",
    phone: "081299881122",
    venuesCount: 2,
  },
  {
    id: "mp-2",
    userId: "m2222222-2222-2222-2222-222222222222",
    businessName: "CV Champion Sport Bandung",
    businessAddress: "Jl. Dr. Djunjunan No. 128, Pasteur, Kota Bandung",
    documentUrl: "https://storage.googleapis.com/futsal-docs/champion-ktp-nib.pdf",
    verificationStatus: MitraVerificationStatus.DISETUJUI,
    bankName: "Mandiri",
    bankAccountNumber: "1310098765432",
    bankAccountHolder: "CV Champion Sport Bandung",
    verifiedBy: "adm-1",
    verifiedAt: "2026-09-10T11:15:00+07:00",
    createdAt: "2026-09-05T08:30:00+07:00",
    email: "halo@championsport.com",
    phone: "081322334455",
    venuesCount: 1,
  },
  {
    id: "mp-3",
    userId: "m3333333-3333-3333-3333-333333333333",
    businessName: "CV Arena Bintaro Sportama",
    businessAddress: "Jl. Boulevard Bintaro Sektor 7, Tangerang Selatan",
    documentUrl: "https://storage.googleapis.com/futsal-docs/bintaro-legalitas-nib-ktp.pdf",
    verificationStatus: MitraVerificationStatus.MENUNGGU,
    bankName: "BCA",
    bankAccountNumber: "5410928371",
    bankAccountHolder: "Hendra Wijaya",
    createdAt: "2026-10-14T11:20:00+07:00",
    email: "hendra@arenabintaro.id",
    phone: "081198765432",
    venuesCount: 1,
  },
  {
    id: "mp-4",
    userId: "m4444444-4444-4444-4444-444444444444",
    businessName: "Perseorangan Lapangan Liar",
    businessAddress: "Kompleks Perumahan Blok C, Surabaya",
    documentUrl: "https://storage.googleapis.com/futsal-docs/dokumen-buram.jpg",
    verificationStatus: MitraVerificationStatus.DITOLAK,
    rejectionReason: "Foto KTP buram tidak terbaca dan belum melampirkan Surat Keterangan Domisili Usaha / NIB dari OSS.",
    bankName: "BRI",
    bankAccountNumber: "002101928374",
    bankAccountHolder: "Agus Santoso",
    verifiedBy: "adm-1",
    verifiedAt: "2026-10-12T15:00:00+07:00",
    createdAt: "2026-10-11T09:40:00+07:00",
    email: "agus.liar@example.com",
    phone: "085712398711",
    venuesCount: 0,
  },
];

// -----------------------------------------------------------------------------
// 14. Data Pembayaran Midtrans Gateway
// -----------------------------------------------------------------------------
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    bookingId: "bk-11111111-1111-1111-1111-111111111111",
    midtransOrderId: "MID-FB-8K2M4Q",
    midtransTransactionId: "mid-trx-987123612",
    paymentType: "gopay",
    grossAmount: 380000,
    status: PaymentStatus.BERHASIL,
    paidAt: "2026-10-15T08:35:12+07:00",
    createdAt: "2026-10-15T08:30:00+07:00",
  },
  {
    id: "pay-2",
    bookingId: "bk-22222222-2222-2222-2222-222222222222",
    midtransOrderId: "MID-FB-7X1N9P",
    paymentType: "qris",
    grossAmount: 355000,
    status: PaymentStatus.PENDING,
    createdAt: "2026-10-15T10:15:00+07:00",
  },
  {
    id: "pay-3",
    bookingId: "bk-33333333-3333-3333-3333-333333333333",
    midtransOrderId: "MID-FB-4L1B8C",
    midtransTransactionId: "mid-trx-554129841",
    paymentType: "bca_va",
    grossAmount: 180000,
    status: PaymentStatus.BERHASIL,
    paidAt: "2026-10-13T10:05:00+07:00",
    createdAt: "2026-10-13T10:00:00+07:00",
  },
  {
    id: "pay-4",
    bookingId: "bk-44444444-4444-4444-4444-444444444444",
    midtransOrderId: "MID-FB-9W3K1Z",
    midtransTransactionId: "mid-trx-334192842",
    paymentType: "bank_transfer",
    grossAmount: 705000,
    status: PaymentStatus.BERHASIL,
    paidAt: "2026-10-10T14:05:00+07:00",
    createdAt: "2026-10-10T14:00:00+07:00",
  },
];

// -----------------------------------------------------------------------------
// 15. Data Refund & Pengembalian Dana
// -----------------------------------------------------------------------------
export const MOCK_REFUNDS: (Refund & { bookingCode: string; customerName: string; venueName: string })[] = [
  {
    id: "ref-11111111-1111-1111-1111-111111111111",
    bookingId: "bk-44444444-4444-4444-4444-444444444444",
    paymentId: "pay-4",
    bookingCode: "FB-9W3K1Z",
    customerName: "Futsal Squad UI",
    venueName: "Champion Mini Soccer & Futsal Pasteur",
    amount: 705000,
    refundPercent: 100,
    status: RefundStatus.DIAJUKAN,
    reason: "Mitra melakukan pembatalan karena perbaikan lampu sorot lapangan mendadak (100% full refund).",
    requestedBy: "usr-3",
    createdAt: "2026-10-14T10:00:00+07:00",
  },
  {
    id: "ref-22222222-2222-2222-2222-222222222222",
    bookingId: "bk-33333333-3333-3333-3333-333333333333",
    paymentId: "pay-3",
    bookingCode: "FB-4L1B8C",
    customerName: "Bambang Pamungkas",
    venueName: "Spartan Futsal Arena Cilandak",
    amount: 87500,
    refundPercent: 50,
    status: RefundStatus.SELESAI,
    reason: "Penyewa membatalkan H-12 jam sebelum jadwal tanding (Aturan Venue 50%).",
    midtransRefundKey: "REF-MID-20261014-99823",
    requestedBy: "usr-2",
    processedBy: "adm-1",
    processedAt: "2026-10-14T11:30:00+07:00",
    createdAt: "2026-10-14T10:45:00+07:00",
  },
  {
    id: "ref-33333333-3333-3333-3333-333333333333",
    bookingId: "bk-11111111-1111-1111-1111-111111111111",
    paymentId: "pay-1",
    bookingCode: "FB-8K2M4Q",
    customerName: "Rizky Ramadhan",
    venueName: "Spartan Futsal Arena Cilandak",
    amount: 375000,
    refundPercent: 100,
    status: RefundStatus.DIPROSES,
    reason: "Salah jadwal dan request refund dalam batas waktu 24 jam.",
    requestedBy: "usr-1",
    processedBy: "adm-1",
    processedAt: "2026-10-15T09:00:00+07:00",
    createdAt: "2026-10-15T08:50:00+07:00",
  },
  {
    id: "ref-44444444-4444-4444-4444-444444444444",
    bookingId: "bk-22222222-2222-2222-2222-222222222222",
    bookingCode: "FB-7X1N9P",
    customerName: "Tim Futsal Garuda",
    venueName: "Spartan Futsal Arena Cilandak",
    amount: 175000,
    refundPercent: 0,
    status: RefundStatus.DITOLAK,
    reason: "Permintaan refund dibatalkan mendadak 1 jam sebelum main.",
    rejectionReason: "Sesuai kebijakan venue, pembatalan kurang dari 6 jam sebelum waktu main tidak berhak atas pengembalian dana (Refund 0%).",
    requestedBy: "usr-2",
    processedBy: "adm-1",
    processedAt: "2026-10-14T16:00:00+07:00",
    createdAt: "2026-10-14T15:00:00+07:00",
  },
];

// -----------------------------------------------------------------------------
// 16. Konfigurasi Sistem Platform (system_settings)
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
// 17. Audit Log Aktivitas Super Admin
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
    adminEmail: "superadmin@futsal.id",
    action: "VERIFY_MITRA",
    targetType: "MitraProfile",
    targetId: "mp-1",
    details: "Menyetujui verifikasi mitra PT Spartan Olahraga Sejahtera setelah pengecekan kelengkapan NIB dan KTP.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-15T09:12:00+07:00",
  },
  {
    id: "log-2",
    adminEmail: "superadmin@futsal.id",
    action: "PROCESS_REFUND",
    targetType: "Refund",
    targetId: "ref-22222222-2222-2222-2222-222222222222",
    details: "Memproses pengembalian dana Rp 87.500 ke rekening penyewa Bambang Pamungkas via Midtrans Direct Refund.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-14T11:30:00+07:00",
  },
  {
    id: "log-3",
    adminEmail: "superadmin@futsal.id",
    action: "REJECT_MITRA",
    targetType: "MitraProfile",
    targetId: "mp-4",
    details: "Menolak pengajuan mitra Perseorangan Lapangan Liar. Alasan: Dokumen KTP buram dan NIB tidak terdaftar.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-12T15:00:00+07:00",
  },
  {
    id: "log-4",
    adminEmail: "superadmin@futsal.id",
    action: "APPROVE_PAYOUT",
    targetType: "Payout",
    targetId: "po-1",
    details: "Menyetujui pencairan saldo Rp 2.500.000 ke rekening BCA PT Spartan Olahraga Sejahtera (Ref: TRF-BCA-20261010-91823).",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-10T09:30:00+07:00",
  },
  {
    id: "log-5",
    adminEmail: "superadmin@futsal.id",
    action: "BLOCK_USER",
    targetType: "Profile",
    targetId: "usr-4",
    details: "Memblokir akun penyewa Dimas Anggara karena terdeteksi percobaan brute force payment berkali-kali.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-06T14:22:00+07:00",
  },
  {
    id: "log-6",
    adminEmail: "superadmin@futsal.id",
    action: "UPDATE_SYSTEM_CONFIG",
    targetType: "SystemConfig",
    targetId: "global",
    details: "Mengubah primary AI Chatbot provider menjadi GEMINI 1.5 Flash.",
    ipAddress: "182.253.110.45",
    createdAt: "2026-10-01T10:00:00+07:00",
  },
];
