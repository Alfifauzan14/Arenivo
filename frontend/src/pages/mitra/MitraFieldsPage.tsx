import * as React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Clock,
  Zap,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Select,
  Modal,
  useToast,
} from "@/components/ui";
import { MOCK_FIELDS, MOCK_VENUES, MOCK_FIELD_TYPES } from "@/lib/mock-data";
import { formatRupiah, type Field } from "@futsal/shared";
import { cn } from "@/lib/utils";

interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openHour: number;
  closeHour: number;
}

export function MitraFieldsPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { addToast } = useToast();

  const venue = MOCK_VENUES.find((v) => v.id === venueId) || MOCK_VENUES[0];
  const [fields, setFields] = React.useState<Field[]>(() => {
    const list = MOCK_FIELDS.filter((f) => f.venueId === venue.id);
    return list.length > 0 ? list : [MOCK_FIELDS[0], MOCK_FIELDS[1]];
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<Field | null>(null);

  // Form Field State
  const [name, setName] = React.useState("");
  const [fieldTypeId, setFieldTypeId] = React.useState(MOCK_FIELD_TYPES[0].id);
  const [sizeDescription, setSizeDescription] = React.useState("26 x 16 meter (Standar Nasional)");
  const [surface, setSurface] = React.useState("Vinyl Gerflor 7.5mm Wood Texture");
  const [basePrice, setBasePrice] = React.useState<number>(175000);

  const defaultSchedules: DaySchedule[] = [
    { dayName: "Senin", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Selasa", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Rabu", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Kamis", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Jumat", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Sabtu", isOpen: true, openHour: 8, closeHour: 24 },
    { dayName: "Minggu", isOpen: true, openHour: 8, closeHour: 24 },
  ];
  const [schedules, setSchedules] = React.useState<DaySchedule[]>(defaultSchedules);

  const handleOpenAdd = () => {
    setEditingField(null);
    setName("");
    setFieldTypeId(MOCK_FIELD_TYPES[0].id);
    setSizeDescription("26 x 16 meter (Standar Nasional)");
    setSurface("Vinyl Gerflor 7.5mm Wood Texture");
    setBasePrice(175000);
    setSchedules(defaultSchedules);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Field) => {
    setEditingField(f);
    setName(f.name);
    setFieldTypeId(f.fieldTypeId);
    setSizeDescription(f.sizeDescription || "26 x 16 meter");
    setSurface(f.surface || "Vinyl Gerflor");
    setBasePrice(f.basePrice);
    setIsModalOpen(true);
  };

  const toggleDayOpen = (index: number) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("warning", "Nama lapangan tidak boleh kosong.", "Validasi");
      return;
    }

    if (editingField) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingField.id
            ? {
                ...f,
                name,
                fieldTypeId,
                sizeDescription,
                surface,
                basePrice,
                fieldType: MOCK_FIELD_TYPES.find((t) => t.id === fieldTypeId),
              }
            : f
        )
      );
      addToast("success", `Lapangan "${name}" berhasil diperbarui.`, "Tersimpan");
    } else {
      const newField: Field = {
        id: `fld-${Date.now()}`,
        venueId: venue.id,
        fieldTypeId,
        name,
        sizeDescription,
        surface,
        basePrice,
        status: "aktif",
        fieldType: MOCK_FIELD_TYPES.find((t) => t.id === fieldTypeId),
      };
      setFields((prev) => [...prev, newField]);
      addToast("success", `Lapangan baru "${name}" berhasil ditambahkan.`, "Lapangan Ditambahkan");
    }

    setIsModalOpen(false);
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
            Lapangan — {venue.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Atur spesifikasi lapangan, jadwal operasional harian, dan tarif jam ramai (peak hour).
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

      {/* Field Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {fields.map((field) => (
          <Card key={field.id} className="p-4 sm:p-5 space-y-4 bg-white border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase font-mono">
                  {field.fieldType?.name || "Futsal"}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1.5 truncate">
                  {field.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {field.surface} • {field.sizeDescription}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-bold font-mono text-red-600 tabular-nums block">
                  {formatRupiah(field.basePrice)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">per jam</span>
              </div>
            </div>

            {/* Operational Hours & Peak Tariff */}
            <div className="p-3 sm:p-3.5 bg-white rounded-lg border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Jam Buka</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  08:00 – 24:00 WIB
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Tarif Malam (18:00+)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(field.basePrice + 35000)}/jam
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(field)}
                className="w-full sm:w-auto justify-center gap-1.5 text-xs h-7 px-2.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Spesifikasi & Tarif
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
            placeholder="Contoh: Lapangan A (Vinyl Pro)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Kategori Olahraga"
            value={fieldTypeId}
            onChange={(e) => setFieldTypeId(e.target.value)}
            options={MOCK_FIELD_TYPES.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ukuran Lapangan"
              placeholder="26 x 16 meter"
              value={sizeDescription}
              onChange={(e) => setSizeDescription(e.target.value)}
            />
            <Input
              label="Jenis Lantai / Rumput"
              placeholder="Vinyl Gerflor 7.5mm"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            />
          </div>

          <Input
            label="Tarif Dasar per Jam (Rp)"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(parseInt(e.target.value, 10) || 0)}
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

          {/* Dynamic Price Info */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Tarif Malam (18:00 – 24:00)</span>
              </span>
              <span className="font-mono font-bold text-amber-900 tabular-nums">
                {formatRupiah(basePrice + 35000)}/jam
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              Diterapkan otomatis untuk pemesanan mulai pukul 18:00 WIB.
            </p>
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraFieldsPage;
