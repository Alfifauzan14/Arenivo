import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Lock,
  Ban,
  Sparkles,
} from "lucide-react";
import { SlotStatus, type Field, type SlotItem, formatRupiah, formatDateIndo } from "@futsal/shared";
import { generateMockSlots } from "@/lib/mock-data";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface SlotPickerGridProps {
  fields: Field[];
  activeFieldId?: string;
  onFieldChange?: (fieldId: string) => void;
  onSelectionChange: (
    selectedSlots: SlotItem[],
    selectedField: Field,
    selectedDate: string
  ) => void;
}

export function SlotPickerGrid({
  fields,
  activeFieldId,
  onFieldChange,
  onSelectionChange,
}: SlotPickerGridProps) {
  const { addToast } = useToast();

  // 1. State Lapangan Aktif
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>(
    activeFieldId || fields[0]?.id || ""
  );

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // 2. Generate 30 Hari ke Depan untuk Horizontal Date Strip
  const dateOptions = React.useMemo(() => {
    const dates: Array<{ dateStr: string; dayName: string; dayNum: number; monthName: string }> = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().split("T")[0];
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];

      dates.push({
        dateStr,
        dayName: i === 0 ? "Hari Ini" : i === 1 ? "Besok" : dayNames[d.getDay()],
        dayNum: d.getDate(),
        monthName: monthNames[d.getMonth()],
      });
    }

    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(dateOptions[0].dateStr);

  // 3. Slot Matrix Data
  const slots: SlotItem[] = React.useMemo(() => {
    return generateMockSlots(selectedFieldId, selectedDate);
  }, [selectedFieldId, selectedDate]);

  // 4. Selected Hours State (Array of hours: [19, 20])
  const [selectedHours, setSelectedHours] = React.useState<number[]>([]);

  // Reset pilihan slot saat ganti lapangan atau tanggal
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setSelectedHours([]);
    onFieldChange?.(fieldId);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedHours([]);
  };

  // 5. ATURAN BISNIS BERURUTAN (Sequential Selection Logic)
  const handleSlotClick = (slot: SlotItem) => {
    if (slot.status !== SlotStatus.TERSEDIA) {
      if (slot.status === SlotStatus.DIKUNCI) {
        addToast(
          "warning",
          "Slot ini sedang dikunci selama 15 menit oleh penyewa lain dalam alur checkout.",
          "Slot Dikunci"
        );
      } else if (slot.status === SlotStatus.TERISI) {
        addToast("info", "Slot jam ini sudah terisi dan lunas.", "Slot Terisi");
      } else if (slot.status === SlotStatus.DIBLOKIR) {
        addToast("error", `Slot diblokir: ${slot.reason || "Pemeliharaan lapangan"}`, "Tidak Tersedia");
      }
      return;
    }

    const clickedHour = slot.hour;

    // Jika belum ada slot dipilih, langsung pilih
    if (selectedHours.length === 0) {
      const updated = [clickedHour];
      setSelectedHours(updated);
      notifyParent(updated);
      return;
    }

    // Jika slot yang diklik sudah dipilih (Unselect)
    if (selectedHours.includes(clickedHour)) {
      // Hanya izinkan unselect jika merupakan ujung awal atau ujung akhir agar tetap berurutan
      const minHour = Math.min(...selectedHours);
      const maxHour = Math.max(...selectedHours);

      if (clickedHour === minHour || clickedHour === maxHour) {
        const updated = selectedHours.filter((h) => h !== clickedHour);
        setSelectedHours(updated);
        notifyParent(updated);
      } else {
        // Jika klik di tengah-tengah, reset ke jam yang baru diklik
        addToast(
          "warning",
          "Slot harus tetap berurutan. Pilihan diatur ulang ke jam yang baru diklik.",
          "Aturan Jam Berurutan"
        );
        const updated = [clickedHour];
        setSelectedHours(updated);
        notifyParent(updated);
      }
      return;
    }

    // Jika menambah slot baru: cek apakah bersebelahan langsung dengan ujung slot yang ada
    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);

    if (clickedHour === minHour - 1 || clickedHour === maxHour + 1) {
      const updated = [...selectedHours, clickedHour].sort((a, b) => a - b);
      setSelectedHours(updated);
      notifyParent(updated);
    } else {
      // Tidak berurutan! Tampilkan toast dan setel ulang ke jam baru
      addToast(
        "warning",
        `Jam bermain harus berurutan. Pilihan dipindahkan ke jam ${slot.timeLabel}.`,
        "Pilihan Jam Berurutan"
      );
      const updated = [clickedHour];
      setSelectedHours(updated);
      notifyParent(updated);
    }
  };

  const notifyParent = (hours: number[]) => {
    const chosenSlots = slots.filter((s) => hours.includes(s.hour));
    if (currentField) {
      onSelectionChange(chosenSlots, currentField, selectedDate);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-6">
      {/* 1. Header & Tab Pilihan Lapangan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Pilih Lapangan & Jadwal Main
          </h3>
          <span className="text-xs text-slate-500 font-mono">Batas pesan 30 hari ke depan</span>
        </div>

        {/* Tab Lapangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {fields.map((f) => {
            const isSelected = f.id === selectedFieldId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFieldSelect(f.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between",
                  isSelected
                    ? "border-red-600 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs line-clamp-1">{f.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {f.surface || f.sizeDescription || "Standar Nasional"}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Harga dasar</span>
                  <span className="font-mono font-bold text-xs text-red-600 tabular-nums">
                    {formatRupiah(f.basePrice)}
                    <span className="font-normal text-slate-400 text-[10px]">/jam</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Horizontal Date Strip (Scrollable 30 Days) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">Pilih Tanggal Bermain</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {dateOptions.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => handleDateSelect(item.dateStr)}
                className={cn(
                  "min-w-[70px] sm:min-w-[76px] py-2 px-1.5 rounded-lg border text-center transition-all shrink-0 flex flex-col items-center justify-center shadow-xs",
                  isSelected
                    ? "bg-red-600 border-red-600 text-white font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50/20"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] uppercase font-semibold leading-none",
                    isSelected ? "text-red-100" : "text-slate-400"
                  )}
                >
                  {item.dayName}
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums leading-tight mt-0.5">
                  {item.dayNum}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    isSelected ? "text-red-100" : "text-slate-500"
                  )}
                >
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Matriks Slot Jadwal Per 1 Jam */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Ketersediaan Jam Main ({formatDateIndo(selectedDate, true)})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedHours.length > 0
              ? `${selectedHours.length} jam dipilih (Berurutan)`
              : "Klik slot untuk memilih"}
          </span>
        </div>

        {/* 5 States Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedHours.includes(slot.hour);
            const isAvailable = slot.status === SlotStatus.TERSEDIA;
            const isLocked = slot.status === SlotStatus.DIKUNCI;
            const isFilled = slot.status === SlotStatus.TERISI;
            const isBlockedOrPassed =
              slot.status === SlotStatus.DIBLOKIR || slot.status === SlotStatus.LEWAT;

            return (
              <button
                key={slot.hour}
                type="button"
                onClick={() => handleSlotClick(slot)}
                className={cn(
                  "p-2.5 sm:p-3 min-h-[64px] min-touch-target rounded-lg border text-left transition-all relative flex flex-col justify-between select-none shadow-xs",
                  // State: DIPILIH (Lokal UI)
                  isSelected &&
                    "bg-red-600 border-red-600 text-white font-semibold ring-1 ring-red-600 scale-[1.01]",
                  // State: TERSEDIA
                  !isSelected &&
                    isAvailable &&
                    "bg-white border-slate-300 text-slate-900 hover:border-red-600 hover:bg-red-50/40 cursor-pointer",
                  // State: DIKUNCI (Pusher 15 menit)
                  !isSelected &&
                    isLocked &&
                    "bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed",
                  // State: TERISI (Sudah lunas)
                  !isSelected &&
                    isFilled &&
                    "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
                  // State: DIBLOKIR / LEWAT
                  !isSelected &&
                    isBlockedOrPassed &&
                    "bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs sm:text-sm tabular-nums">
                    {slot.timeLabel}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold uppercase">
                      Dipilih
                    </span>
                  )}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  {slot.status === SlotStatus.DIBLOKIR && (
                    <Ban className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "font-mono tabular-nums font-semibold",
                      isSelected
                        ? "text-red-100"
                        : isAvailable
                        ? "text-red-600"
                        : "text-slate-400"
                    )}
                  >
                    {formatRupiah(slot.price)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isSelected
                        ? "text-red-200"
                        : isAvailable
                        ? "text-slate-400"
                        : "text-slate-400 font-medium"
                    )}
                  >
                    {isSelected
                      ? "Siap"
                      : isAvailable
                      ? "Kosong"
                      : isLocked
                      ? "15 mnt"
                      : isFilled
                      ? "Terisi"
                      : "Tutup"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. Legend Warna Semantik (desain.md 2.2) */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md border border-slate-300 bg-white" />
            <span className="font-medium">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-red-600" />
            <span className="font-medium text-red-700">Pilihan Anda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
            <span className="font-medium text-amber-800">Dikunci 15 Mnt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200" />
            <span className="font-medium text-slate-500">Terisi / Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 line-through text-[9px] text-center font-bold text-slate-400">
              ✕
            </span>
            <span className="font-medium text-slate-500">Diblokir / Lewat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
