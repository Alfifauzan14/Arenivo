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
  Loader2,
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
import { apiClient } from "@/lib/api-client";
import { formatRupiah, type Venue } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraVenuesPage() {
  const { addToast } = useToast();
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [facilities, setFacilities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVenue, setEditingVenue] = React.useState<Venue | null>(null);

  // Form Fields
  const [name, setName] = React.useState("");
  const [cityId, setCityId] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [latitude, setLatitude] = React.useState<number>(-6.2915);
  const [longitude, setLongitude] = React.useState<number>(106.7984);
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [rules, setRules] = React.useState("");
  const [selectedFacilityIds, setSelectedFacilityIds] = React.useState<string[]>([]);

  const loadData = React.useCallback(async () => {
    try {
      const [vRes, cRes, fRes] = await Promise.all([
        apiClient.get<any[]>("/mitra/venues"),
        apiClient.get<any[]>("/master/cities"),
        apiClient.get<any[]>("/master/facilities"),
      ]);
      if (Array.isArray(vRes.data)) setVenues(vRes.data);
      if (Array.isArray(cRes.data)) {
        setCities(cRes.data);
        setCityId((prev) => prev || cRes.data[0]?.id || "");
      }
      if (Array.isArray(fRes.data)) setFacilities(fRes.data);
    } catch {
      // biarkan state kosong bila gagal
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setName("");
    setCityId(cities[0]?.id || "");
    setAddress("");
    setLatitude(-6.2915);
    setLongitude(106.7984);
    setYoutubeUrl("");
    setRules("1. Wajib mengenakan sepatu sol karet.\n2. Dilarang merokok di area lapangan.");
    setSelectedFacilityIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setCityId(v.cityId || (v as any).city?.id || cities[0]?.id || "");
    setAddress(v.address);
    setLatitude(v.latitude || -6.2915);
    setLongitude(v.longitude || 106.7984);
    setYoutubeUrl(v.youtubeUrl || "");
    setRules(v.rules || "");
    setSelectedFacilityIds((v.facilities || []).map((f: any) => f.id).filter(Boolean));
    setIsModalOpen(true);
  };

  const toggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      addToast("warning", "Nama venue dan alamat lengkap wajib diisi.", "Validasi");
      return;
    }
    if (!cityId) {
      addToast("warning", "Pilih kota / wilayah terlebih dahulu.", "Validasi");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        cityId,
        address: address.trim(),
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        youtubeUrl: youtubeUrl.trim() ? youtubeUrl.trim() : null,
        rules: rules.trim() || null,
        facilityIds: selectedFacilityIds,
      };

      if (editingVenue) {
        await apiClient.patch("/mitra/venues", { id: editingVenue.id, ...payload });
        addToast("success", `Venue "${name.trim()}" berhasil diperbarui ke database.`, "Tersimpan");
      } else {
        payload.photos = [
          { url: "/images/hero-futsal-indoor.webp", isCover: true },
        ];
        await apiClient.post("/mitra/venues", payload);
        addToast("success", `Venue baru "${name.trim()}" berhasil disimpan ke database.`, "Venue Ditambahkan");
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      addToast(
        "error",
        err?.error?.message || "Gagal menyimpan venue ke server. Periksa kelengkapan data.",
        "Gagal Menyimpan"
      );
    } finally {
      setSaving(false);
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Memuat data venue...</span>
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500 bg-white border-slate-200">
          Belum ada venue terdaftar. Klik "Tambah Venue" untuk mendaftarkan arena pertama Anda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {venues.map((v) => {
            const sportCategory = v.name.toLowerCase().includes("mini soccer")
              ? "Mini Soccer & Futsal"
              : "Futsal";
            const cityName = v.city?.name
              ? v.city.name.startsWith("Kota") || v.city.name.startsWith("Jakarta")
                ? v.city.name
                : `Kota ${v.city.name}`
              : "-";

            return (
              <Card
                key={v.id}
                className="overflow-hidden bg-white border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between rounded-xl"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={v.photos?.[0]?.url || "/images/hero-futsal-indoor.webp"}
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
                          {Number(v.ratingAvg || 0).toFixed(1)}
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
                          {formatRupiah(v.startingPrice || 0)}
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
      )}

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
            placeholder="Contoh: Champion Futsal Arena Cilandak"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Kota / Wilayah"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            options={cities.map((c) => ({
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
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
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
              {facilities.map((fac) => {
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
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Venue"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraVenuesPage;
