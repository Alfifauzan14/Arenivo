import * as React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Edit,
  Layers,
  MapPin,
  Plus,
  Star,
  Trophy,
  Video,
  ArrowRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Modal,
  useToast,
} from "@/components/ui";
import { MOCK_VENUES, MOCK_CITIES, MOCK_FACILITIES } from "@/lib/mock-data";
import { formatRupiah, type Venue } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraVenuesPage() {
  const { addToast } = useToast();
  const [venues, setVenues] = React.useState<Venue[]>(MOCK_VENUES.slice(0, 2));
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVenue, setEditingVenue] = React.useState<Venue | null>(null);

  // Form Fields
  const [name, setName] = React.useState("");
  const [cityId, setCityId] = React.useState(MOCK_CITIES[0].id);
  const [address, setAddress] = React.useState("");
  const [latitude, setLatitude] = React.useState<number>(-6.2915);
  const [longitude, setLongitude] = React.useState<number>(106.7984);
  const [youtubeUrl, setYoutubeUrl] = React.useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [rules, setRules] = React.useState("");
  const [selectedFacilityIds, setSelectedFacilityIds] = React.useState<string[]>([
    MOCK_FACILITIES[0].id,
    MOCK_FACILITIES[1].id,
    MOCK_FACILITIES[3].id,
  ]);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setName("");
    setCityId(MOCK_CITIES[0].id);
    setAddress("");
    setLatitude(-6.2915);
    setLongitude(106.7984);
    setYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setRules("1. Wajib mengenakan sepatu sol karet.\n2. Dilarang merokok di area lapangan.");
    setSelectedFacilityIds([MOCK_FACILITIES[0].id, MOCK_FACILITIES[1].id]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setCityId(v.cityId);
    setAddress(v.address);
    setLatitude(v.latitude || -6.2915);
    setLongitude(v.longitude || 106.7984);
    setYoutubeUrl(v.youtubeUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setRules(v.rules || "");
    setSelectedFacilityIds(v.facilities?.map((f) => f.id) || []);
    setIsModalOpen(true);
  };

  const toggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      addToast("warning", "Nama venue dan alamat lengkap wajib diisi.", "Validasi");
      return;
    }

    if (editingVenue) {
      setVenues((prev) =>
        prev.map((v) =>
          v.id === editingVenue.id
            ? {
                ...v,
                name,
                cityId,
                address,
                latitude,
                longitude,
                youtubeUrl,
                rules,
                city: MOCK_CITIES.find((c) => c.id === cityId),
              }
            : v
        )
      );
      addToast("success", `Venue "${name}" berhasil diperbarui.`, "Tersimpan");
    } else {
      const newV: Venue = {
        id: `v-new-${Date.now()}`,
        mitraId: "m1111111-1111-1111-1111-111111111111",
        cityId,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: "Arena olahraga modern berstandar resmi dengan fasilitas lengkap dan nyaman.",
        address,
        latitude,
        longitude,
        youtubeUrl,
        rules,
        status: "aktif",
        ratingAvg: 5.0,
        reviewCount: 0,
        startingPrice: 175000,
        city: MOCK_CITIES.find((c) => c.id === cityId),
        photos: [
          {
            id: `p-${Date.now()}`,
            venueId: `v-new-${Date.now()}`,
            url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80",
            isCover: true,
            sortOrder: 0,
          },
        ],
      };
      setVenues((prev) => [newV, ...prev]);
      addToast("success", `Venue baru "${name}" berhasil ditambahkan.`, "Venue Ditambahkan");
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Venue & Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Kelola informasi lokasi arena olahraga, fasilitas, serta daftar lapangan di dalamnya.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto justify-center gap-1.5 text-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Venue
        </Button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {venues.map((v) => {
          const sportCategory = v.name.toLowerCase().includes("mini soccer")
            ? "Mini Soccer & Futsal"
            : "Futsal";
          const cityName = v.city?.name
            ? v.city.name.startsWith("Kota") || v.city.name.startsWith("Jakarta")
              ? v.city.name
              : `Kota ${v.city.name}`
            : "Jakarta Selatan";

          return (
            <Card
              key={v.id}
              className="overflow-hidden bg-white border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between rounded-xl"
            >
              <div>
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={
                      v.photos?.[0]?.url ||
                      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={v.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Venue
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 leading-snug">
                      {v.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 pt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-medium text-slate-700 tabular-nums">
                        {v.ratingAvg.toFixed(2).replace(/\.00$/, ".0")}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="truncate">{cityName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                      <Trophy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{sportCategory}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="text-xs text-slate-600">
                      <span>Mulai </span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                        {formatRupiah(v.startingPrice || 175000)}
                      </span>
                      <span className="text-xs text-slate-400 font-normal"> /sesi</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(v)}
                        className="w-full justify-center gap-1.5 text-xs rounded-lg h-8"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Venue
                      </Button>

                      <Link to={`/mitra/venues/${v.id}/fields`} className="w-full">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="w-full justify-center gap-1.5 text-xs rounded-lg font-bold h-8"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Lapangan</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Venue */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? "Edit Informasi Venue" : "Tambah Venue Baru"}
      >
        <form
          onSubmit={handleSaveVenue}
          className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1"
        >
          <Input
            label="Nama Venue"
            placeholder="Contoh: Spartan Futsal Arena Cilandak"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Kota / Wilayah"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            options={MOCK_CITIES.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.province})`,
            }))}
          />

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Raya Nomor..."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
            />
          </div>

          {/* Map Preview */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <span className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              Pratinjau Titik Peta
            </span>
            <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-200">
              <iframe
                title="Pratinjau Peta"
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>

          <Input
            label="Tautan Video YouTube (Opsional)"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            leftIcon={<Video className="w-4 h-4 text-slate-400" />}
          />

          {/* Facilities Checklist */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-700 block">Fasilitas Tersedia</label>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_FACILITIES.map((fac) => {
                const checked = selectedFacilityIds.includes(fac.id);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => toggleFacility(fac.id)}
                    className={cn(
                      "p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer",
                      checked
                        ? "border-red-600 bg-red-50 text-slate-900 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 shrink-0",
                        checked ? "text-red-600" : "text-slate-300"
                      )}
                    />
                    <span className="truncate">{fac.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue Rules */}
          <div className="space-y-1.5 pt-1">
            <label className="font-semibold text-slate-700 block">Aturan & Tata Tertib</label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="1. Wajib sepatu sol karet non-marking..."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs">
              Simpan Venue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraVenuesPage;
