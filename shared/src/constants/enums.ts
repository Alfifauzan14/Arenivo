/**
 * Enum status booking (pesanan)
 * Nilai disimpan dalam format snake_case sesuai PRD & ERD
 */
export const BookingStatus = {
  MENUNGGU_BAYAR: "menunggu_bayar",
  DIKONFIRMASI: "dikonfirmasi",
  DIGUNAKAN: "digunakan",
  SELESAI: "selesai",
  KEDALUWARSA: "kedaluwarsa",
  DIBATALKAN: "dibatalkan",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

/**
 * Enum status slot jadwal lapangan per jam
 */
export const SlotStatus = {
  TERSEDIA: "tersedia",
  DIKUNCI: "dikunci",
  TERISI: "terisi",
  DIBLOKIR: "diblokir",
  LEWAT: "lewat",
} as const;

export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

/**
 * Enum role pengguna sistem
 */
export const UserRole = {
  PENYEWA: "penyewa",
  MITRA: "mitra",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Enum status akun pengguna
 */
export const AccountStatus = {
  AKTIF: "aktif",
  DIBLOKIR: "diblokir",
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

/**
 * Enum status verifikasi pendaftaran mitra
 */
export const MitraVerificationStatus = {
  MENUNGGU: "menunggu",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
} as const;

export type MitraVerificationStatus =
  (typeof MitraVerificationStatus)[keyof typeof MitraVerificationStatus];

/**
 * Enum hasil scan e-tiket pada Gate Scanner Mitra
 */
export const TicketScanResult = {
  SAH: "sah",
  SUDAH_DIPAKAI: "sudah_dipakai",
  BELUM_DIBAYAR: "belum_dibayar",
  SALAH_WAKTU: "salah_waktu",
  SALAH_VENUE: "salah_venue",
  DIBATALKAN: "dibatalkan",
  TIDAK_DITEMUKAN: "tidak_ditemukan",
} as const;

export type TicketScanResult = (typeof TicketScanResult)[keyof typeof TicketScanResult];

/**
 * Enum status pembayaran Midtrans
 */
export const PaymentStatus = {
  PENDING: "pending",
  BERHASIL: "berhasil",
  GAGAL: "gagal",
  KEDALUWARSA: "kedaluwarsa",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Enum status tiket
 */
export const TicketStatus = {
  AKTIF: "aktif",
  DIGUNAKAN: "digunakan",
  DIBATALKAN: "dibatalkan",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

/**
 * Enum status refund dana
 */
export const RefundStatus = {
  DIAJUKAN: "diajukan",
  DISETUJUI: "disetujui",
  DIPROSES: "diproses",
  SELESAI: "selesai",
  DITOLAK: "ditolak",
} as const;

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

/**
 * Enum status pencairan saldo mitra (payout)
 */
export const PayoutStatus = {
  MENUNGGU: "menunggu",
  DISETUJUI: "disetujui",
  DIPROSES: "diproses",
  SELESAI: "selesai",
  DITOLAK: "ditolak",
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

/**
 * Enum sumber pesanan (online web vs manual walk-in mitra)
 */
export const BookingSource = {
  ONLINE: "online",
  MANUAL: "manual",
} as const;

export type BookingSource = (typeof BookingSource)[keyof typeof BookingSource];

/**
 * Enum tipe reservasi slot
 */
export const ReservationType = {
  BOOKING: "booking",
  BLOKIR: "blokir",
} as const;

export type ReservationType = (typeof ReservationType)[keyof typeof ReservationType];

/**
 * Enum status venue
 */
export const VenueStatus = {
  AKTIF: "aktif",
  NONAKTIF: "nonaktif",
  DIBLOKIR: "diblokir",
} as const;

export type VenueStatus = (typeof VenueStatus)[keyof typeof VenueStatus];

/**
 * Enum status lapangan
 */
export const FieldStatus = {
  AKTIF: "aktif",
  NONAKTIF: "nonaktif",
} as const;

export type FieldStatus = (typeof FieldStatus)[keyof typeof FieldStatus];

/**
 * Enum provider AI Chatbot
 */
export const AiProvider = {
  GEMINI: "gemini",

} as const;

export type AiProvider = (typeof AiProvider)[keyof typeof AiProvider];
