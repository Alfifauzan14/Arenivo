import * as React from "react";
import {
  Ban,
  Calendar as CalendarIcon,
  Plus,
  User,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  SlotStatusBadge,
  Modal,
  Input,
  Select,
  useToast,
} from "@/components/ui";
import { MOCK_FIELDS, generateMockSlots } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import {
  SlotStatus,
  formatRupiah,
  formatDateIndo,
  type SlotItem,
} from "@futsal/shared";
import { cn } from "@/lib/utils";

interface ExtendedSlotItem extends SlotItem {
  customerName?: string;
  isWalkIn?: boolean;
}

export function MitraSchedulePage() {
  const { addToast } = useToast();
  const [fields, setFields] = React.useState<any[]>(MOCK_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = React.useState(MOCK_FIELDS[0].id);
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  // Modals state
  const [isBlockModalOpen, setIsBlockModalOpen] = React.useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = React.useState(false);

  // Form Blokir Slot
  const [blockHour, setBlockHour] = React.useState<number>(12);
  const [blockReason, setBlockReason] = React.useState<string>(
    "Perawatan & Pembersihan Lantai"
  );

  // Form Walk-in Booking
  const [walkInName, setWalkInName] = React.useState<string>("Pak Hendra (Komunitas RT)");
  const [walkInPhone, setWalkInPhone] = React.useState<string>("081399887766");
  const [walkInStartHour, setWalkInStartHour] = React.useState<number>(14);
  const [walkInDuration, setWalkInDuration] = React.useState<number>(2);

  // Active Field Object
  const currentField =
    MOCK_FIELDS.find((f) => f.id === selectedFieldId) || MOCK_FIELDS[0];

  // Base slots generated from mock
  const [customSlots, setCustomSlots] = React.useState<Record<string, ExtendedSlotItem[]>>({});

  const dateKey = `${selectedFieldId}-${selectedDate}`;

  const slots: ExtendedSlotItem[] = React.useMemo(() => {
    if (customSlots[dateKey]) {
      return customSlots[dateKey];
    }
    const base = generateMockSlots(selectedFieldId, selectedDate);
    return base.map((s) => {
      if (s.hour === 16 || s.hour === 17) {
        return { ...s, customerName: "Futsal Squad UI (Online)" };
      }
      if (s.hour === 18) {
        return { ...s, customerName: "Checkout Sedang Berjalan" };
      }
      return s;
    });
  }, [selectedFieldId, selectedDate, customSlots, dateKey]);

  // Handler: Blokir Slot
  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = slots.map((s) =>
      s.hour === blockHour
        ? {
            ...s,
            status: SlotStatus.DIBLOKIR,
            reason: blockReason,
          }
        : s
    );

    setCustomSlots((prev) => ({ ...prev, [dateKey]: updated }));
    setIsBlockModalOpen(false);
    addToast(
      "success",
      `Slot jam ${blockHour}:00 berhasil diblokir (${blockReason}).`,
      "Slot Diblokir"
    );
  };

  // Handler: Walk-in Booking
  const handleConfirmWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      addToast("warning", "Nama pelanggan walk-in wajib diisi.", "Validasi");
      return;
    }

    const endHour = walkInStartHour + walkInDuration;
    const updated = slots.map((s) => {
      if (s.hour >= walkInStartHour && s.hour < endHour) {
        return {
          ...s,
          status: SlotStatus.TERISI,
          customerName: `${walkInName} (Walk-in)`,
          isWalkIn: true,
        };
      }
      return s;
    });

    setCustomSlots((prev) => ({ ...prev, [dateKey]: updated }));
    setIsWalkInModalOpen(false);
    addToast(
      "success",
      `Booking walk-in atas nama ${walkInName} (${walkInDuration} jam) berhasil disimpan tanpa komisi platform.`,
      "Walk-in Tercatat"
    );
  };

  // Handler: Buka Blokir
  const handleUnblockSlot = (hour: number) => {
    const updated = slots.map((s) =>
      s.hour === hour
        ? {
            ...s,
            status: SlotStatus.TERSEDIA,
            reason: undefined,
          }
        : s
    );
    setCustomSlots((prev) => ({ ...prev, [dateKey]: updated }));
    addToast("info", `Slot jam ${hour}:00 dibuka kembali untuk publik.`, "Slot Dibuka");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Jadwal & Manajemen Slot
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Atur ketersediaan lapangan, blokir jam perawatan, atau catat reservasi walk-in.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBlockModalOpen(true)}
            className="w-full sm:w-auto justify-center gap-1.5 text-xs"
          >
            <Ban className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Blokir Slot</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsWalkInModalOpen(true)}
            className="w-full sm:w-auto justify-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Booking Walk-in</span>
          </Button>
        </div>
      </div>

      {/* Simple 2-Column Filter Bar */}
      <Card className="p-3.5 sm:p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end">
          <Select
            label="Pilih Lapangan"
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            options={fields.map((f) => ({
              value: f.id,
              label: `${f.name} — ${formatRupiah(f.basePrice)}/jam`,
            }))}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Tanggal Jadwal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-full px-3 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 cursor-pointer shadow-xs"
            />
          </div>
        </div>
      </Card>

      {/* Daily Slot Matrix */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-red-600 shrink-0" />
              <span className="truncate">
                {currentField.name} — {formatDateIndo(selectedDate, false)}
              </span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Tarif dasar:{" "}
              <span className="font-mono font-semibold text-slate-700 tabular-nums">
                {formatRupiah(currentField.basePrice)}/jam
              </span>
            </CardDescription>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300" /> Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-50 border border-emerald-300" /> Terisi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-50 border border-amber-300" /> Dikunci
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" /> Diblokir
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-5 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {slots.map((s) => {
              const isAvailable = s.status === SlotStatus.TERSEDIA;
              const isFilled = s.status === SlotStatus.TERISI;
              const isLocked = s.status === SlotStatus.DIKUNCI;
              const isBlocked = s.status === SlotStatus.DIBLOKIR;
              const isPassed = s.status === SlotStatus.LEWAT;

              return (
                <div
                  key={s.hour}
                  className={cn(
                    "p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between transition-colors space-y-2",
                    isAvailable &&
                      "bg-white border-slate-200 text-slate-900 hover:border-red-600",
                    isFilled &&
                      "bg-emerald-50 border-emerald-200 text-emerald-950",
                    isLocked &&
                      "bg-amber-50 border-amber-300 text-amber-900",
                    isBlocked &&
                      "bg-slate-100 border-slate-200 text-slate-600",
                    isPassed &&
                      "bg-slate-100 border-slate-200 text-slate-400"
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-[11px] sm:text-xs tabular-nums">
                      {s.timeLabel}
                    </span>
                    <SlotStatusBadge status={s.status} className="px-2 py-0.5 text-[10px]" />
                  </div>

                  {/* Slot Details */}
                  <div className="text-xs">
                    {isFilled && (
                      <div className="space-y-0.5">
                        <span className="font-semibold block truncate text-slate-900 text-[11px] sm:text-xs">
                          {s.customerName || "Penyewa"}
                        </span>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-emerald-800 tabular-nums">
                          <span>{formatRupiah(s.price)}</span>
                          <span>{s.isWalkIn ? "Walk-in" : "Online"}</span>
                        </div>
                      </div>
                    )}

                    {isLocked && (
                      <span className="text-[10px] sm:text-[11px] text-amber-800 block truncate">
                        Checkout (15 mnt)
                      </span>
                    )}

                    {isBlocked && (
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] text-slate-600 truncate">
                          {s.reason || "Perawatan"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockSlot(s.hour)}
                          className="h-5 px-1.5 text-[10px]"
                        >
                          Buka
                        </Button>
                      </div>
                    )}

                    {isAvailable && (
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 text-[11px] sm:text-xs tabular-nums">
                          {formatRupiah(s.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">Kosong</span>
                      </div>
                    )}

                    {isPassed && (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Blokir Slot Manual */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Blokir Slot Jam Operasional"
      >
        <form onSubmit={handleConfirmBlock} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
            Slot yang diblokir tidak dapat dipesan oleh penyewa di halaman publik.
          </div>

          <Select
            label="Pilih Jam yang Diblokir"
            value={String(blockHour)}
            onChange={(e) => setBlockHour(parseInt(e.target.value, 10))}
            options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(
              (h) => ({
                value: String(h),
                label: `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00 WIB`,
              })
            )}
          />

          <Input
            label="Alasan Pemblokiran"
            placeholder="Contoh: Perawatan rumput sintetis / Turnamen internal"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsBlockModalOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs">
              Simpan Blokir Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Input Booking Walk-in */}
      <Modal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        title="Input Booking Walk-in (Offline)"
      >
        <form onSubmit={handleConfirmWalkIn} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Bebas Komisi Platform (0%)</span>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Pemesanan langsung di lokasi dicatat ke kalender jadwal dan pembayaran diterima tunai oleh kasir venue.
              </p>
            </div>
          </div>

          <Input
            label="Nama Penyewa / Tim"
            placeholder="Contoh: Pak Hendra (Komunitas RT)"
            value={walkInName}
            onChange={(e) => setWalkInName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Nomor WhatsApp"
            placeholder="0813xxxxxxxx"
            value={walkInPhone}
            onChange={(e) => setWalkInPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jam Mulai"
              value={String(walkInStartHour)}
              onChange={(e) => setWalkInStartHour(parseInt(e.target.value, 10))}
              options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(
                (h) => ({
                  value: String(h),
                  label: `${String(h).padStart(2, "0")}:00 WIB`,
                })
              )}
            />

            <Select
              label="Durasi Bermain"
              value={String(walkInDuration)}
              onChange={(e) => setWalkInDuration(parseInt(e.target.value, 10))}
              options={[
                { value: "1", label: "1 Jam" },
                { value: "2", label: "2 Jam" },
                { value: "3", label: "3 Jam" },
              ]}
            />
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Total Tagihan Tunai:</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {formatRupiah(currentField.basePrice * walkInDuration)}
            </span>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsWalkInModalOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs">
              Simpan Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraSchedulePage;
