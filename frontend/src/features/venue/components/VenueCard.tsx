import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Trophy } from "lucide-react";
import type { Venue } from "@futsal/shared";
import { formatRupiah } from "@futsal/shared";
import { Button } from "@/components/ui";
import { useSession } from "@/features/auth/context/SessionContext";
import { cn } from "@/lib/utils";

export interface VenueCardProps {
  venue: Venue;
  distanceKm?: number;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const { isFavorite, toggleFavorite } = useSession();
  const favorited = isFavorite(venue.id);

  // Ambil foto cover utama
  const coverPhoto =
    venue.photos?.find((p) => p.isCover)?.url ||
    venue.photos?.[0]?.url ||
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80";

  // Tentukan kategori olahraga utama dari nama venue
  const sportCategory = React.useMemo(() => {
    const lowerName = venue.name.toLowerCase();
    if (lowerName.includes("mini soccer") && lowerName.includes("futsal")) {
      return "Mini Soccer & Futsal";
    }
    if (lowerName.includes("mini soccer")) {
      return "Mini Soccer";
    }
    return "Futsal";
  }, [venue.name]);

  const cityName = venue.city?.name
    ? venue.city.name.startsWith("Kota") || venue.city.name.startsWith("Jakarta")
      ? venue.city.name
      : `Kota ${venue.city.name}`
    : "Indonesia";

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col group relative",
        className
      )}
    >
      {/* 1. Bagian Atas: Foto Cover Bersih + Tombol Favorit */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/venues/${venue.slug}`} className="block w-full h-full">
          <img
            src={coverPhoto}
            alt={venue.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Tombol Hati (Favorit) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(venue.id);
          }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-sm z-10 border border-slate-200 cursor-pointer",
            favorited
              ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              : "bg-white text-slate-400 hover:text-red-500 hover:bg-slate-50"
          )}
          title={favorited ? "Hapus dari Favorit" : "Simpan ke Favorit"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-transform active:scale-125",
              favorited && "fill-red-600 text-red-600"
            )}
          />
        </button>
      </div>

      {/* 2. Bagian Konten (Sesuai Gambar Referensi: Venue -> Nama -> ★ Rating • Kota -> Ikon Olahraga -> Mulai Rp... /sesi + Pilih Jam) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Label Kategori Kecil */}
          <span className="text-xs font-semibold text-slate-400 block">
            Venue
          </span>

          {/* Nama Venue */}
          <Link
            to={`/venues/${venue.slug}`}
            className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 hover:text-red-600 transition-colors block leading-snug"
          >
            {venue.name}
          </Link>

          {/* Rating & Kota */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 pt-0.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-medium text-slate-700 tabular-nums">
              {venue.ratingAvg.toFixed(2).replace(/\.00$/, ".0")}
            </span>
            <span className="text-slate-400">•</span>
            <span className="truncate">{cityName}</span>
          </div>

          {/* Jenis Olahraga */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
            <Trophy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{sportCategory}</span>
          </div>
        </div>

        {/* 3. Bagian Bawah: Harga Mulai Rp... /sesi & Tombol Pilih Jam (1 Baris Sejajar) */}
        <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-500 whitespace-nowrap truncate">
            <span>Mulai </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              {formatRupiah(venue.startingPrice || 150000)}
            </span>
            <span className="text-[11px] text-slate-400 font-normal"> /sesi</span>
          </div>

          <Link to={`/venues/${venue.slug}`} className="shrink-0">
            <Button variant="primary" size="sm" className="rounded-lg font-bold shadow-xs px-3.5 py-1.5 text-xs">
              Pilih Jam
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
