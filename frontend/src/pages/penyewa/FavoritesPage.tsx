import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/context/SessionContext";
import { apiClient } from "@/lib/api-client";
import { VenueCard } from "@/features/venue/components/VenueCard";
import type { Venue } from "@futsal/shared";

export function FavoritesPage() {
  const { favorites } = useSession();
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    if (favorites.length === 0) {
      setVenues([]);
      setLoading(false);
      return;
    }

    // Fetch favorites langsung dari API /me/favorites (backend sudah join venue data)
    setLoading(true);
    apiClient.get<any[]>("/me/favorites")
      .then((res) => {
        if (!isMounted) return;
        setVenues((Array.isArray(res.data) ? res.data : []) as Venue[]);
      })
      .catch(() => {
        // Fallback: fetch semua venue lalu filter
        if (!isMounted) return;
        apiClient.get<any[]>("/venues", { limit: 50 })
          .then((r) => {
            if (!isMounted) return;
            const all = Array.isArray(r.data) ? r.data : [];
            setVenues(all.filter((v) => favorites.includes(v.id)) as Venue[]);
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [favorites]);

  return (
    <div className="min-h-screen">
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Venue Lapangan Favorit</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Daftar venue olahraga yang Anda simpan untuk kemudahan booking berulang.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-red-700 bg-white px-3 py-1.5 rounded-lg border border-white shadow-xs self-start sm:self-auto">
            {venues.length} venue tersimpan
          </span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Content: Cards Grid or Empty State */}
        {venues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Belum Ada Venue yang Disimpan
              </h3>
              <p className="text-xs text-slate-500">
                Tekan tombol ikon hati pada kartu lapangan untuk menyimpannya ke daftar favorit ini.
              </p>
            </div>
            <Link to="/venues">
              <Button variant="primary" size="md" className="font-bold text-xs gap-1.5 rounded-lg shadow-xs">
                <Search className="w-4 h-4" />
                Cari Lapangan Sekarang
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
