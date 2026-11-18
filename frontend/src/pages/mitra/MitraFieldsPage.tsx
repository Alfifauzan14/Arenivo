import * as React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Clock,
  Zap,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Select,
  Modal,
  useToast,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, type Field } from "@futsal/shared";
import { cn } from "@/lib/utils";

interface DaySchedule {
  dayName: string;
  dayOfWeek: number;
  isOpen: boolean;
  openHour: number;
  closeHour: number;
}

const DEFAULT_SCHEDULES: DaySchedule[] = [
  { dayName: "Senin", dayOfWeek: 1, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Selasa", dayOfWeek: 2, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Rabu", dayOfWeek: 3, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Kamis", dayOfWeek: 4, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Jumat", dayOfWeek: 5, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Sabtu", dayOfWeek: 6, isOpen: true, openHour: 8, closeHour: 23 },
  { dayName: "Minggu", dayOfWeek: 0, isOpen: true, openHour: 8, closeHour: 23 },
];

export function MitraFieldsPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { addToast } = useToast();

  const [venue, setVenue] = React.useState<any>(null);
  const [fields, setFields] = React.useState<Field[]>([]);
  const [fieldTypes, setFieldTypes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<Field | null>(null);
  const [deletingField, setDeletingField] = React.useState<Field | null>(null);

  // Form Field State
  const [name, setName] = React.useState("");
  const [fieldTypeId, setFieldTypeId] = React.useState("");
  const [sizeDescription, setSizeDescription] = React.useState("");
  const [surface, setSurface] = React.useState("");
  const [basePrice, setBasePrice] = React.useState<number>(150000);
  const [schedules, setSchedules] = React.useState<DaySchedule[]>(DEFAULT_SCHEDULES);

  const loadData = React.useCallback(async () => {
    try {
      const [vRes, fRes, tRes] = await Promise.all([
        apiClient.get<any[]>("/mitra/venues"),
        apiClient.get<any[]>(venueId ? `/mitra/fields?venueId=${venueId}` : "/mitra/fields"),
        apiClient.get<any[]>("/master/field-types"),
      ]);
      if (Array.isArray(vRes.data)) {
        const matched = vRes.data.find((v) => v.id === venueId) || vRes.data[0] || null;
        setVenue(matched);
      }
      if (Array.isArray(fRes.data)) {
        setFields(fRes.data);
      }
      if (Array.isArray(tRes.data)) {
        setFieldTypes(tRes.data);
        setFieldTypeId((prev) => prev || tRes.data[0]?.id || "");
      }
    } catch {
      // biarkan state saat error
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingField(null);
    setName("");
    setFieldTypeId(fieldTypes[0]?.id || "");
    setSizeDescription("");
    setSurface("");
    setBasePrice(150000);
    setSchedules(DEFAULT_SCHEDULES.map((s) => ({ ...s })));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditingField(f);
    setName(f.name || "");
    setFieldTypeId(f.fieldTypeId || f.fieldType?.id || fieldTypes[0]?.id || "");
    setSizeDescription(f.sizeDescription || "");
    setSurface(f.surface || "");
    setBasePrice(Number(f.basePrice || 0));

    const existingHours = Array.isArray(f.fieldOperatingHours) ? f.fieldOperatingHours : [];
    if (existingHours.length > 0) {
      setSchedules(
        DEFAULT_SCHEDULES.map((def) => {
          const found = existingHours.find((h: any) => h.dayOfWeek === def.dayOfWeek);
          if (!found) return { ...def };
          return {
            ...def,
            isOpen: !found.isClosed,
            openHour: parseInt(String(found.openTime || "08:00").split(":")[0], 10) || 8,
            closeHour: parseInt(String(found.closeTime || "23:00").split(":")[0], 10) || 23,
          };
        })
      );
    } else {
      setSchedules(DEFAULT_SCHEDULES.map((s) => ({ ...s })));
    }
    setIsModalOpen(true);
  };

  const toggleDayOpen = (index: number) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("warning", "Nama lapangan tidak boleh kosong.", "Validasi");
      return;
    }
    const targetVenueId = venueId || venue?.id;
    if (!targetVenueId) {
      addToast("error", "Venue belum ditemukan.", "Gagal");
      return;
    }

    setSaving(true);
    try {
      const operatingHours = schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        openTime: `${String(s.openHour).padStart(2, "0")}:00`,
        closeTime: `${String(s.closeHour).padStart(2, "0")}:00`,
        isClosed: !s.isOpen,
      }));

      if (editingField) {
        await apiClient.patch("/mitra/fields", {
          id: editingField.id,
          fieldTypeId,
          name: name.trim(),
          sizeDescription: sizeDescription.trim() || null,
          surface: surface.trim() || null,
          basePrice: Math.max(0, Math.round(basePrice)),
          operatingHours,
        });
        addToast("success", `Lapangan "${name.trim()}" berhasil diperbarui ke database.`, "Tersimpan");
      } else {
        await apiClient.post("/mitra/fields", {
          venueId: targetVenueId,
          fieldTypeId,
          name: name.trim(),
          sizeDescription: sizeDescription.trim() || null,
          surface: surface.trim() || null,
          basePrice: Math.max(0, Math.round(basePrice)),
          operatingHours,
        });
        addToast("success", `Lapangan baru "${name.trim()}" berhasil disimpan ke database.`, "Lapangan Ditambahkan");
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      addToast(
        "error",
        err?.error?.message || "Gagal menyimpan lapangan ke server.",
        "Gagal Menyimpan"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingField) return;
    setSaving(true);
    try {
      const res = await apiClient.delete<any>(`/mitra/fields?id=${deletingField.id}`);
      if (res.data?.deactivated) {
        addToast(
          "info",
          `Lapangan "${deletingField.name}" dinonaktifkan karena sudah memiliki riwayat transaksi.`,
          "Lapangan Dinonaktifkan"
        );
      } else {
        addToast("success", `Lapangan "${deletingField.name}" berhasil dihapus.`, "Lapangan Dihapus");
      }
      setDeletingField(null);
      await loadData();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal menghapus lapangan.", "Gagal Menghapus");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Back Link & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <Link
            to="/mitra/venues"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 mb-1.5 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Venue
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lapangan — {venue?.name || "Venue"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Atur spesifikasi lapangan, jadwal operasional harian, dan tarif sewa per jam.
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
          Tambah Lapangan
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Memuat daftar lapangan...</span>
        </div>
      ) : fields.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500 bg-white border-slate-200">
          Belum ada lapangan di venue ini. Klik "Tambah Lapangan" untuk membuat lapangan baru.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {fields.map((field: any) => (
            <Card key={field.id} className="p-4 sm:p-5 space-y-4 bg-white border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase font-mono">
                      {field.fieldType?.name || "Futsal"}
                    </span>
                    {field.status === "nonaktif" && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1.5 truncate">
                    {field.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {field.surface || "-"} • {field.sizeDescription || "-"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-bold font-mono text-red-600 tabular-nums block">
                    {formatRupiah(field.basePrice)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400">per jam</span>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 bg-white rounded-lg border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Jam Buka</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {field.operatingHours?.[0]?.openTime?.slice(0, 5) || "07:00"} –{" "}
                    {field.operatingHours?.[0]?.closeTime?.slice(0, 5) || "23:00"} WIB
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Tarif Dasar</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatRupiah(field.basePrice)}/jam
                  </span>
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingField(field)}
                  className="justify-center gap-1.5 text-xs h-7 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(field)}
                  className="justify-center gap-1.5 text-xs h-7 px-2.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Spesifikasi & Tarif
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Tambah / Edit Lapangan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? "Edit Spesifikasi & Tarif Lapangan" : "Tambah Lapangan Baru"}
      >
        <form
          onSubmit={handleSaveField}
          className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1"
        >
          <Input
            label="Nama Lapangan"
            placeholder="Contoh: Lapangan C (Sintetis Pro)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Kategori Olahraga"
            value={fieldTypeId}
            onChange={(e) => setFieldTypeId(e.target.value)}
            options={fieldTypes.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ukuran Lapangan"
              placeholder="Contoh: 26 x 16 meter"
              value={sizeDescription}
              onChange={(e) => setSizeDescription(e.target.value)}
            />
            <Input
              label="Jenis Lantai / Rumput"
              placeholder="Contoh: Vinyl Gerflor 7.5mm"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            />
          </div>

          <Input
            label="Tarif Dasar per Jam (Rp)"
            type="number"
            min={0}
            value={basePrice}
            onChange={(e) => setBasePrice(parseInt(e.target.value, 10) || 0)}
            required
          />

          {/* Daily Schedule */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-700 block">
              Jadwal Operasional Harian
            </label>
            <div className="space-y-1.5">
              {schedules.map((s, idx) => (
                <div
                  key={s.dayName}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <span className="font-semibold text-slate-800 w-16">{s.dayName}</span>

                  <button
                    type="button"
                    onClick={() => toggleDayOpen(idx)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md font-mono font-semibold text-[10px] border cursor-pointer",
                      s.isOpen
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    {s.isOpen ? "Buka" : "Libur"}
                  </button>

                  <span className="font-mono text-slate-600 tabular-nums text-[11px]">
                    {String(s.openHour).padStart(2, "0")}:00 – {String(s.closeHour).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>
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
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Konfirmasi Hapus Lapangan */}
      <Modal
        isOpen={Boolean(deletingField)}
        onClose={() => setDeletingField(null)}
        title="Hapus Lapangan"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus lapangan{" "}
            <span className="font-bold text-slate-900">{deletingField?.name}</span>? Jika lapangan sudah pernah memiliki booking, lapangan akan otomatis dinonaktifkan agar riwayat transaksi tetap aman.
          </p>
          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeletingField(null)}
              className="flex-1 text-xs"
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmDelete}
              className="flex-1 text-xs bg-rose-600 hover:bg-rose-700"
              disabled={saving}
            >
              {saving ? "Memproses..." : "Ya, Hapus Lapangan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MitraFieldsPage;
