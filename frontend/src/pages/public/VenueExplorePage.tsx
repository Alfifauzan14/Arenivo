import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Compass,
  Filter,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Map as MapIcon,
  List,
  X,
} from "lucide-react";
import { Button, Input, Select, Card } from "@/components/ui";
import { VenueCard } from "@/features/venue/components/VenueCard";
import { MOCK_VENUES, MOCK_CITIES, MOCK_FACILITIES, MOCK_FIELD_TYPES } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/features/auth/context/SessionContext";
import { formatRupiah } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function VenueExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useSession();

  // Filter States initialized from URL params
  const initialCity = searchParams.get("city") || "all";
  const initialType = searchParams.get("type") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [cityFilter, setCityFilter] = React.useState(initialCity);
  const [typeFilter, setTypeFilter] = React.useState(initialType);
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([]);
  const [minRating, setMinRating] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(500000);
  const [sortBy, setSortBy] = React.useState<"recommended" | "lowest_price" | "rating" | "nearest">(
    "recommended"
  );
  const [nearMeActive, setNearMeActive] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"list" | "split">("list");
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  // Live Backend Data States with graceful Mock fallbacks
  const [venues, setVenues] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [facilities, setFacilities] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/venues", { limit: 50 }).then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setVenues(res.data);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/master/cities").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCities(res.data);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/master/facilities").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setFacilities(res.data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Toggle fasilitas checkbox
  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setCityFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
    setSelectedFacilities([]);
    setMinRating(0);
    setMaxPrice(500000);
    setSortBy("recommended");
    setNearMeActive(false);
    setSearchParams({});
    setCurrentPage(1);
  };

  // Toggle Location "Terdekat dari Saya"
  const handleToggleNearMe = () => {
    if (!nearMeActive) {
      setNearMeActive(true);
      setSortBy("nearest");
    } else {
      setNearMeActive(false);
      setSortBy("recommended");
    }
  };

  // Filter & Sort Logic
  const filteredVenues = React.useMemo(() => {
    return venues.filter((venue) => {
      // 1. Filter Favorit
      if (initialFilter === "favorit" && !favorites.includes(venue.id)) {
        return false;
      }

      // 2. Filter Kota
      if (cityFilter !== "all" && venue.cityId !== cityFilter) {
        return false;
      }

      // 3. Filter Query Nama / Alamat
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = venue.name.toLowerCase().includes(q);
        const matchAddress = venue.address.toLowerCase().includes(q);
        if (!matchName && !matchAddress) return false;
      }

      // 4. Filter Rating
      if (minRating > 0 && venue.ratingAvg < minRating) {
        return false;
      }

      // 5. Filter Harga Maksimal
      if (venue.startingPrice && venue.startingPrice > maxPrice) {
        return false;
      }

      // 6. Filter Fasilitas (AND filter)
      if (selectedFacilities.length > 0) {
        const venueFacilityIds = venue.facilities?.map((f: any) => f.id) || [];
        const hasAll = selectedFacilities.every((fid) => venueFacilityIds.includes(fid));
        if (!hasAll) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "lowest_price") {
        return (a.startingPrice || 0) - (b.startingPrice || 0);
      }
      if (sortBy === "rating") {
        return b.ratingAvg - a.ratingAvg;
      }
      if (sortBy === "nearest") {
        // Mock distance sort
        return (a.reviewCount % 5) - (b.reviewCount % 5);
      }
      return 0; // default / recommended
    });
  }, [
    cityFilter,
    searchQuery,
    minRating,
    maxPrice,
    selectedFacilities,
    sortBy,
    initialFilter,
    favorites,
    venues,
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage) || 1;
  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Eksplorasi Lapangan Olahraga
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Menampilkan {filteredVenues.length} pilihan lapangan futsal, mini soccer & sepak bola
            </p>
          </div>

          {/* View Mode Toggle & Mobile Filter Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden gap-1.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter ({selectedFacilities.length + (cityFilter !== "all" ? 1 : 0)})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleNearMe}
              className={cn(
                "gap-1.5 text-xs font-bold rounded-lg transition-all",
                nearMeActive
                  ? "bg-white text-red-700 border-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-white shadow-xs"
              )}
            >
              <Navigation className="w-4 h-4" />
              {nearMeActive ? "Lokasi Aktif (Terdekat)" : "Venue Terdekat"}
            </Button>

            <div className="hidden sm:flex items-center p-1 bg-red-900 rounded-lg border border-red-800 shadow-xs">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-white hover:text-white"
                )}
                title="Tampilan Grid Katalog"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "split" ? "bg-white text-slate-900 shadow-xs" : "text-white hover:text-white"
                )}
                title="Tampilan Split Peta"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe space-y-6">

      {/* 2. Main Content Grid: Filter Sidebar + Venues Grid (Tablet & Desktop Split) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* FILTER SIDEBAR (Tablet & Desktop) */}
        <div
          className={cn(
            "md:col-span-1 space-y-6 md:block",
            mobileFilterOpen ? "block" : "hidden"
          )}
        >
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-600" />
                Filter Pencarian
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Filter Kota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Kota</label>
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                options={[
                  { value: "all", label: "Semua Kota" },
                  ...cities.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {/* Filter Rentang Harga */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Maks. Harga Sewa</label>
                <span className="font-mono text-xs font-bold text-red-600 tabular-nums">
                  {formatRupiah(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={500000}
                step={25000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rp 100 rb</span>
                <span>Rp 500 rb</span>
              </div>
            </div>

            {/* Filter Rating Minimum */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Rating Minimum</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 0, label: "Semua" },
                  { val: 4.5, label: "★ 4.5+" },
                  { val: 4.8, label: "★ 4.8+" },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setMinRating(r.val)}
                    className={cn(
                      "py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      minRating === r.val
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Fasilitas */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Fasilitas Venue</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {facilities.map((f) => (
                  <label
                    key={f.id}
                    className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(f.id)}
                      onChange={() => toggleFacility(f.id)}
                      className="rounded text-red-600 focus:ring-red-600 w-4 h-4"
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VENUES LIST & SORTING (Tablet 2 Cols, Desktop 3 Cols) */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          {/* Unified Search & Sort Category Select Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shadow-xs">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama venue, lapangan, atau lokasi kota..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: "recommended", label: "Urutkan: Paling Relevan" },
                  { value: "lowest_price", label: "Urutkan: Harga Termurah" },
                  { value: "rating", label: "Urutkan: Rating Tertinggi" },
                  { value: "nearest", label: "Urutkan: Terdekat" },
                ]}
              />
            </div>
          </div>

          {/* Venues Grid / Empty State */}
          {paginatedVenues.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Tidak ada venue yang sesuai dengan filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba sesuaikan filter pencarian kota, rentang harga, atau reset filter untuk
                melihat seluruh venue.
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                Reset Semua Filter
              </Button>
            </div>
          ) : viewMode === "split" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {paginatedVenues.map((v, i) => (
                  <VenueCard key={v.id} venue={v} distanceKm={2.1 + i * 1.2} />
                ))}
              </div>
              <div className="sticky top-20 h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                <iframe
                  title="Peta Eksplorasi Venue"
                  src="https://maps.google.com/maps?q=-6.2915,106.7984&hl=id&z=12&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVenues.map((venue, idx) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  distanceKm={2.1 + (idx + (currentPage - 1) * itemsPerPage) * 1.2}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Sebelumnya
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all",
                    page === currentPage
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                  )}
                >
                  {page}
                </button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Selanjutnya →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
