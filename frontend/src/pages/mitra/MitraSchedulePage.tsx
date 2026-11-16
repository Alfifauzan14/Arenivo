import * as React from "react";
import {
  Ban,
  Calendar as CalendarIcon,
  Plus,
  User,
  Phone,
  ShieldCheck,
  Loader2,
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
  blockId?: string;
}

export function MitraSchedulePage() {
  const { addToast } = useToast();
  const [fields, setFields] = React.useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const now = new Date(Date.now() + 7 * 60 * 60000);
    return now.toISOString().split("T")[0];
  });
  const [slots, setSlots] = React.useState<ExtendedSlotItem[]>([]);
  const [loadingFields, setLoadingFields] = React.useState(true);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Modals state
  const [isBlockModalOpen, setIsBlockModalOpen] = React.useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = React.useState(false);

  // Form Blokir Slot
  const [blockHour, setBlockHour] = React.useState<number>(12);
  const [blockReason, setBlockReason] = React.useState<string>("Perawatan & Pembersihan Lantai");

  // Form Walk-in Booking
  const [walkInName, setWalkInName] = React.useState<string>("");
  const [walkInPhone, setWalkInPhone] = React.useState<string>("");
  const [walkInStartHour, setWalkInStartHour] = React.useState<number>(14);
  const [walkInDuration, setWalkInDuration] = React.useState<number>(1);

  React.useEffect(() => {
    let active = true;
    apiClient
      .get<any[]>("/mitra/fields")
      .then((res) => {
        if (active && Array.isArray(res.data)) {
          const activeFields = res.data.filter((f) => f.status === "aktif");
          const list = activeFields.length > 0 ? activeFields : res.data;
          setFields(list);
          if (list.length > 0) setSelectedFieldId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingFields(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0] || { name: "-", basePrice: 0 };

  const loadSchedule = React.useCallback(async () => {
    if (!selectedFieldId || !selectedDate) return;
    setLoadingSlots(true);
    try {
      const [availRes, blocksRes, bookingsRes] = await Promise.all([
        apiClient.get<any[]>(`/fields/${selectedFieldId}/availability`, { date: selectedDate }),
        apiClient.get<any[]>("/mitra/blocks", { fieldId: selectedFieldId, date: selectedDate }),
        apiClient.get<any[]>("/mitra/bookings", { date: selectedDate, limit: 100 }),
      ]);

      const rawSlots = Array.isArray(availRes.data) ? availRes.data : [];
      const blockRows = Array.isArray(blocksRes.data) ? blocksRes.data : [];
      const bookingRows = (Array.isArray(bookingsRes.data) ? bookingsRes.data : []).filter(
        (b: any) => b.fieldId === selectedFieldId && b.status !== "dibatalkan" && b.status !== "kedaluwarsa"
      );

      const blockByHour = new Map<number, any>();
      for (const blk of blockRows) {
        const wib = new Date(new Date(blk.slotStart).getTime() + 7 * 60 * 60000);
        blockByHour.set(wib.getUTCHours(), blk);
      }

      const bookingByHour = new Map<number, any>();
      for (const b of bookingRows) {
        const startH = new Date(new Date(b.playStart).getTime() + 7 * 60 * 60000).getUTCHours();
        const endH = new Date(new Date(b.playEnd).getTime() + 7 * 60 * 60000).getUTCHours();
        for (let h = startH; h < (endH > startH ? endH : startH + (b.totalHours || 1)); h++) {
          bookingByHour.set(h, b);
        }
      }

      const merged: ExtendedSlotItem[] = rawSlots.map((s: any) => {
        const hour = Number(s.hour ?? (s.slotStart ? new Date(new Date(s.slotStart).getTime() + 7 * 60 * 60000).getUTCHours() : 0));
        const blk = blockByHour.get(hour);
        const bk = bookingByHour.get(hour);
        return {
          hour,
          timeLabel: s.timeLabel || `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`,
          slotStart: s.slotStart || `${selectedDate}T${String(hour).padStart(2, "0")}:00:00+07:00`,
          slotEnd: s.slotEnd || `${selectedDate}T${String(hour + 1).padStart(2, "0")}:00:00+07:00`,
          price: Number(s.price ?? currentField.basePrice ?? 0),
          status: s.status as SlotStatus,
          reason: blk?.reason || s.reason,
          blockId: blk?.id,
          customerName: bk?.customerName,
          isWalkIn: bk?.source === "manual",
        };
      });

      setSlots(merged);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedFieldId, selectedDate, currentField.basePrice]);

  React.useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleConfirmBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) return;
    setSubmitting(true);
    try {
      const slotStart = `${selectedDate}T${String(blockHour).padStart(2, "0")}:00:00+07:00`;
      await apiClient.post("/mitra/blocks", {
        fieldId: selectedFieldId,
        slotStart,
        reason: blockReason.trim() || "Perawatan Lapangan",
      });
      setIsBlockModalOpen(false);
      addToast("success", `Slot jam ${blockHour}:00 berhasil diblokir di database.`, "Slot Diblokir");
      await loadSchedule();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal memblokir slot.", "Gagal Blokir");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblockSlot = async (slot: ExtendedSlotItem) => {
    if (!slot.blockId) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/mitra/blocks/${slot.blockId}`);
      addToast("info", `Slot jam ${slot.hour}:00 dibuka kembali untuk publik.`, "Slot Dibuka");
      await loadSchedule();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal membuka blokir slot.", "Gagal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) {
      addToast("warning", "Nama dan nomor WhatsApp penyewa wajib diisi.", "Validasi");
      return;
    }
    if (!selectedFieldId) return;

    setSubmitting(true);
    try {
      const slotStarts: string[] = [];
      for (let i = 0; i < walkInDuration; i++) {
        const h = walkInStartHour + i;
        slotStarts.push(`${selectedDate}T${String(h).padStart(2, "0")}:00:00+07:00`);
      }

      await apiClient.post("/mitra/bookings", {
        fieldId: selectedFieldId,
        slotStarts,
        customerName: walkInName.trim(),
        customerPhone: walkInPhone.trim(),
      });

      setIsWalkInModalOpen(false);
      setWalkInName("");
      setWalkInPhone("");
      addToast(
        "success",
        `Booking walk-in atas nama ${walkInName.trim()} (${walkInDuration} jam) berhasil disimpan ke database.`,
        "Walk-in Tercatat"
      );
      await loadSchedule();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal mencatat booking walk-in.", "Gagal Walk-in");
    } finally {
      setSubmitting(false);
    }
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
            Atur ketersediaan lapangan, blokir jam perawatan, atau catat reservasi walk-in secara live.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBlockModalOpen(true)}
            disabled={!selectedFieldId}
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
            disabled={!selectedFieldId}
            className="w-full sm:w-auto justify-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Booking Walk-in</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
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
          {loadingFields || loadingSlots ? (
            <div className="flex items-center justify-center py-10 text-slate-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>Memuat jadwal real-time...</span>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">
              Tidak ada slot tersedia untuk tanggal atau lapangan ini.
            </p>
          ) : (
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
                      isAvailable && "bg-white border-slate-200 text-slate-900 hover:border-red-600",
                      isFilled && "bg-emerald-50 border-emerald-200 text-emerald-950",
                      isLocked && "bg-amber-50 border-amber-300 text-amber-900",
                      isBlocked && "bg-slate-100 border-slate-200 text-slate-600",
                      isPassed && "bg-slate-100 border-slate-200 text-slate-400"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[11px] sm:text-xs tabular-nums">
                        {s.timeLabel}
                      </span>
                      <SlotStatusBadge status={s.status} className="px-2 py-0.5 text-[10px]" />
                    </div>

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
                          Checkout Berlangsung
                        </span>
                      )}

                      {isBlocked && (
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] sm:text-[11px] text-slate-600 truncate">
                            {s.reason || "Perawatan"}
                          </span>
                          {s.blockId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleUnblockSlot(s)}
                              className="h-5 px-1.5 text-[10px]"
                            >
                              Buka
                            </Button>
                          )}
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
                          Lewat
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => ({
              value: String(h),
              label: `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00 WIB`,
            }))}
          />

          <Input
            label="Alasan Pemblokiran"
            placeholder="Contoh: Perawatan rumput sintetis / Turnamen internal"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            required
          />

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsBlockModalOpen(false)}
              className="flex-1 text-xs"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Blokir Slot"}
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
            required
          />

          <Input
            label="Nomor WhatsApp"
            placeholder="0813xxxxxxxx"
            value={walkInPhone}
            onChange={(e) => setWalkInPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jam Mulai"
              value={String(walkInStartHour)}
              onChange={(e) => setWalkInStartHour(parseInt(e.target.value, 10))}
              options={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => ({
                value: String(h),
                label: `${String(h).padStart(2, "0")}:00 WIB`,
              }))}
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
              {formatRupiah((currentField.basePrice || 0) * walkInDuration)}
            </span>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsWalkInModalOpen(false)}
              className="flex-1 text-xs"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Booking"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraSchedulePage;
