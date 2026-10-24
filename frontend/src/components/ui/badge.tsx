import * as React from "react";
import {
  BookingStatus,
  SlotStatus,
  TicketScanResult,
} from "@futsal/shared";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  icon,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 font-semibold rounded-md border select-none whitespace-nowrap leading-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-red-50 text-red-700 border-red-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-white text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

/**
 * Badge khusus status booking (Super Ringkas & Jelas)
 * Konsistensi Warna:
 * - Aktif / Dikonfirmasi = HIJAU (success)
 * - Batal / Expired = MERAH (danger)
 * - Menunggu Bayar = KUNING (warning)
 * - Main / Digunakan = BIRU (info)
 * - Selesai = SLATE (default)
 */
export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus | string;
  className?: string;
}) {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "menunggu":
    case "menunggu_bayar":
    case BookingStatus.MENUNGGU_BAYAR:
      return (
        <Badge variant="warning" className={className}>
          Menunggu
        </Badge>
      );
    case "aktif":
    case "dikonfirmasi":
    case BookingStatus.DIKONFIRMASI:
      return (
        <Badge variant="success" className={className}>
          Aktif
        </Badge>
      );
    case "main":
    case "digunakan":
    case BookingStatus.DIGUNAKAN:
      return (
        <Badge variant="info" className={className}>
          Main
        </Badge>
      );
    case "selesai":
    case BookingStatus.SELESAI:
      return (
        <Badge variant="default" className={className}>
          Selesai
        </Badge>
      );
    case "expired":
    case "kedaluwarsa":
    case BookingStatus.KEDALUWARSA:
      return (
        <Badge variant="danger" className={className}>
          Expired
        </Badge>
      );
    case "batal":
    case "dibatalkan":
    case BookingStatus.DIBATALKAN:
      return (
        <Badge variant="danger" className={className}>
          Batal
        </Badge>
      );
    default:
      return <Badge className={className}>{status}</Badge>;
  }
}

/**
 * Badge status slot jadwal (Simple & Ringkas)
 */
export function SlotStatusBadge({
  status,
  className,
}: {
  status: SlotStatus | string;
  className?: string;
}) {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "tersedia":
    case "kosong":
    case SlotStatus.TERSEDIA:
      return (
        <Badge variant="neutral" className={cn("text-slate-700 border-slate-300", className)}>
          Kosong
        </Badge>
      );
    case "dikunci":
    case SlotStatus.DIKUNCI:
      return (
        <Badge variant="warning" className={className}>
          Dikunci
        </Badge>
      );
    case "terisi":
    case SlotStatus.TERISI:
      return (
        <Badge variant="success" className={className}>
          Terisi
        </Badge>
      );
    case "diblokir":
    case SlotStatus.DIBLOKIR:
      return (
        <Badge variant="danger" className={className}>
          Diblokir
        </Badge>
      );
    case "lewat":
    case SlotStatus.LEWAT:
      return (
        <Badge variant="default" className={cn("text-slate-400", className)}>
          Lewat
        </Badge>
      );
    default:
      return <Badge className={className}>{status}</Badge>;
  }
}

/**
 * Badge hasil Gate Scanner Mitra (Simple & Jelas)
 */
export function TicketScanResultBadge({
  result,
  className,
}: {
  result: TicketScanResult | string;
  className?: string;
}) {
  const s = String(result || "").toLowerCase();
  switch (s) {
    case "sah":
    case TicketScanResult.SAH:
      return (
        <Badge variant="success" className={className}>
          Sah
        </Badge>
      );
    case "terpakai":
    case "sudah_dipakai":
    case TicketScanResult.SUDAH_DIPAKAI:
      return (
        <Badge variant="danger" className={className}>
          Terpakai
        </Badge>
      );
    case "belum_bayar":
    case "belum_dibayar":
    case TicketScanResult.BELUM_DIBAYAR:
      return (
        <Badge variant="warning" className={className}>
          Belum Bayar
        </Badge>
      );
    case "salah_waktu":
    case TicketScanResult.SALAH_WAKTU:
      return (
        <Badge variant="warning" className={className}>
          Salah Waktu
        </Badge>
      );
    case "salah_venue":
    case TicketScanResult.SALAH_VENUE:
      return (
        <Badge variant="danger" className={className}>
          Salah Venue
        </Badge>
      );
    case "batal":
    case "dibatalkan":
    case TicketScanResult.DIBATALKAN:
      return (
        <Badge variant="danger" className={className}>
          Batal
        </Badge>
      );
    case "tak_ada":
    case "tidak_ditemukan":
    case TicketScanResult.TIDAK_DITEMUKAN:
      return (
        <Badge variant="danger" className={className}>
          Tak Ada
        </Badge>
      );
    default:
      return <Badge className={className}>{result}</Badge>;
  }
}
