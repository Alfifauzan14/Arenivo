/**
 * Format angka ke format Rupiah standar Indonesia
 * Contoh: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s+/g, " ");
}

/**
 * Parsing string Rupiah menjadi angka murni
 */
export function parseRupiah(str: string): number {
  const cleaned = str.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}
