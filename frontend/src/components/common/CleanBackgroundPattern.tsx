import * as React from "react";
import { cn } from "@/lib/utils";

interface CleanBackgroundPatternProps {
  className?: string;
  variant?: "default" | "subtle" | "auth";
}

/**
 * CleanBackgroundPattern
 * Memberikan tekstur modern, bersih, dan sporty pada latar belakang halaman
 * tanpa membuat tampilan berantakan atau mengganggu keterbacaan teks/kartu.
 * 
 * Terdiri dari:
 * 1. Ambient soft gradient mesh (glow lembut merah & amber)
 * 2. Dot-matrix tactical grid (titik-titik halus)
 * 3. Garis geometri lapangan olahraga minimalis (SVG court lines & tactical crosses)
 */
export function CleanBackgroundPattern({
  className: _className,
  variant: _variant = "default",
}: CleanBackgroundPatternProps) {
  // Dinonaktifkan: Menghilangkan seluruh tekstur titik, garis geometri lapangan, dan glow latar belakang
  // agar latar belakang halaman 100% bersih dan solid tanpa bayangan tekstur.
  return null;
}
