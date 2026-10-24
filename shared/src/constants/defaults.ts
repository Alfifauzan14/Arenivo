/**
 * Nilai default aturan bisnis sistem (sesuai PRD 4.1 & system_settings)
 */
export const SYSTEM_DEFAULTS = {
  /** Batas waktu pembayaran & kunci slot dalam menit */
  BOOKING_EXPIRATION_MINUTES: 15,

  /** Batas pemesanan ke depan dalam hari */
  MAX_BOOKING_DAYS_AHEAD: 30,

  /** Komisi platform default dalam persen (10%) */
  DEFAULT_PLATFORM_COMMISSION_PERCENT: 10,

  /** Biaya layanan platform default dalam Rupiah */
  DEFAULT_SERVICE_FEE_RUPIAH: 5000,

  /** Batas minimal pengajuan pencairan dana mitra (Rupiah) */
  MIN_PAYOUT_AMOUNT_RUPIAH: 100000,

  /** Jendela waktu pembukaan Gate Scanner sebelum jam mulai bermain (menit) */
  SCANNER_EARLY_CHECKIN_MINUTES: 30,

  /** Batas minimal jam sebelum main untuk pengajuan reschedule */
  RESCHEDULE_MIN_HOURS_BEFORE: 24,

  /** Maksimal reschedule per booking */
  MAX_RESCHEDULE_COUNT: 1,

  /** Provider default untuk Chatbot AI */
  DEFAULT_AI_PROVIDER: "gemini" as const,
} as const;
