import * as React from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui";

export interface VenueMapProps {
  venueName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function VenueMap({
  venueName,
  address,
  latitude = -6.2915,
  longitude = 106.7984,
}: VenueMapProps) {
  const lat = latitude || -6.2915;
  const lng = longitude || 106.7984;

  // URL Google Maps Embed publik tanpa API Key / Billing
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&output=embed`;

  // URL eksternal Google Maps untuk tombol 'Buka di Google Maps'
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" />
            Lokasi & Titik Peta
          </h3>
          <p className="text-xs text-slate-500">{address}</p>
        </div>

        <a
          href={mapsExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-700">
            <Navigation className="w-3.5 h-3.5 text-red-600" />
            Buka di Google Maps
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Button>
        </a>
      </div>

      {/* Google Maps Embed Iframe */}
      <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
        <iframe
          title={`Peta Lokasi ${venueName}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
