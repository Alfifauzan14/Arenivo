/**
 * Nama-nama hari dalam bahasa Indonesia
 */
export const HARI_INDO = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

/**
 * Nama-nama bulan dalam bahasa Indonesia
 */
export const BULAN_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/**
 * Format tanggal ke format bahasa Indonesia
 * Contoh: "Kamis, 15 Oktober 2026"
 */
export function formatDateIndo(dateInput: string | Date, withDay = true): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";

  const day = d.getDate();
  const month = BULAN_INDO[d.getMonth()];
  const year = d.getFullYear();

  if (withDay) {
    const dayName = HARI_INDO[d.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Format waktu ke WIB (HH.mm)
 * Contoh: "19.00"
 */
export function formatTimeWIB(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}.${minutes}`;
}

/**
 * Format label jam slot
 * Contoh: "19.00 - 20.00"
 */
export function formatSlotLabel(startInput: string | Date, endInput: string | Date): string {
  return `${formatTimeWIB(startInput)} - ${formatTimeWIB(endInput)}`;
}

/**
 * Hitung mundur sisa detik ke format MM:SS
 * Contoh: 899 detik -> "14:59"
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
