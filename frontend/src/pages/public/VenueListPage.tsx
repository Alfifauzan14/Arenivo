import * as React from "react";
import { Select } from "@/components/ui";
import { MOCK_VENUES, MOCK_CITIES } from "@/lib/mock-data";
import { VenueCard } from "@/features/venue/components/VenueCard";

export function VenueListPage() {
  const [selectedCity, setSelectedCity] = React.useState("all");

  const filteredVenues =
    selectedCity === "all"
      ? MOCK_VENUES
      : MOCK_VENUES.filter((v) => v.cityId === selectedCity);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Katalog Lapangan Olahraga</h1>
          <p className="text-xs text-slate-500 mt-1">
            Temukan dan booking lapangan futsal, mini soccer, dan sepak bola terdekat
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-48 text-xs"
          >
            <option value="all">Semua Kota</option>
            {MOCK_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}
