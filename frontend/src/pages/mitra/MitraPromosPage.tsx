import * as React from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Search, X, Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
  useToast,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, type Promo } from "@futsal/shared";

export function MitraPromosPage() {
  const outletCtx = useOutletContext<{ selectedVenueId?: string } | null>();
  const activeVenueId = outletCtx?.selectedVenueId || "";
  const { addToast } = useToast();
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [venues, setVenues] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("semua");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  // Form Promo State
  const [selectedVenueId, setSelectedVenueId] = React.useState(activeVenueId);
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = React.useState<number>(20000);
  const [minSpend, setMinSpend] = React.useState<number>(100000);
  const [quota, setQuota] = React.useState<number>(50);
  const [endDateStr, setEndDateStr] = React.useState<string>(() =>
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );

  React.useEffect(() => {
    if (activeVenueId) {
      setSelectedVenueId(activeVenueId);
    }
  }, [activeVenueId]);

  const loadData = React.useCallback(async () => {
    try {
      const [pRes, vRes] = await Promise.all([
        apiClient.get<any[]>("/mitra/promos"),
        apiClient.get<any[]>("/mitra/venues"),
      ]);
      if (Array.isArray(pRes.data)) setPromos(pRes.data);
      if (Array.isArray(vRes.data)) {
        setVenues(vRes.data);
        setSelectedVenueId((prev) => prev || activeVenueId || vRes.data[0]?.id || "");
      }
    } catch {
      // biarkan state kosong
    } finally {
      setLoading(false);
    }
  }, [activeVenueId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPromos = React.useMemo(() => {
    return promos.filter((p) => {
      if (typeFilter !== "semua" && p.discountType !== typeFilter) return false;
      if (searchQuery.trim()) {
        return (p.code || "").toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [promos, typeFilter, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchQuery]);

  const paginatedPromos = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPromos.slice(start, start + pageSize);
  }, [filteredPromos, currentPage]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 3) {
      addToast("warning", "Kode promo wajib diisi minimal 3 karakter.", "Validasi");
      return;
    }
    const vId = selectedVenueId || venues[0]?.id;
    if (!vId) {
      addToast("error", "Venue mitra belum ditemukan.", "Validasi");
      return;
    }

    setSaving(true);
    try {
      const parsedEnd = endDateStr
        ? new Date(`${endDateStr}T23:59:59+07:00`).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString();
      await apiClient.post("/mitra/promos", {
        venueId: vId,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Math.max(1, Math.round(discountValue)),
        minSpend: Math.max(0, Math.round(minSpend)),
        quota: Math.max(0, Math.round(quota)),
        endDate: parsedEnd,
      });

      setIsModalOpen(false);
      setCode("");
      setCurrentPage(1);
      addToast("success", `Kode promo ${code.trim().toUpperCase()} berhasil disimpan ke database.`, "Promo Dibuat");
      await loadData();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal menyimpan promo.", "Gagal");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePromoActive = async (promo: Promo) => {
    const nextActive = !promo.isActive;
    try {
      await apiClient.patch("/mitra/promos", { id: promo.id, isActive: nextActive });
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: nextActive } : p))
      );
      addToast(
        "success",
        `Kode promo ${promo.code} berhasil di${nextActive ? "aktifkan" : "nonaktifkan"}.`,
        "Status Promo"
      );
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal mengubah status promo.", "Gagal");
    }
  };

  const handleDeletePromo = async (promo: Promo) => {
    try {
      await apiClient.delete(`/mitra/promos?id=${promo.id}`);
      setPromos((prev) => prev.filter((p) => p.id !== promo.id));
      addToast("success", `Kode promo ${promo.code} berhasil dihapus.`, "Promo Dihapus");
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal menghapus promo.", "Gagal");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Promo Venue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Kelola kode voucher diskon riil untuk meningkatkan okupansi lapangan pada jam sepi.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center gap-1.5 text-xs"
        >
          <Plus className="w-4 h-4" />
          Buat Promo Baru
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 sm:p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "semua", label: `Semua Tipe (${promos.length})` },
                { value: "fixed", label: "Potongan Nominal (Rp)" },
                { value: "percent", label: "Potongan Persen (%)" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Promos Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>Memuat daftar promo...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs">No</TableHead>
                    <TableHead className="text-xs">Kode Promo</TableHead>
                    <TableHead className="text-xs">Nilai Diskon</TableHead>
                    <TableHead className="text-xs">Min. Belanja</TableHead>
                    <TableHead className="text-xs">Kuota Terpakai</TableHead>
                    <TableHead className="text-center text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPromos.length > 0 ? (
                    paginatedPromos.map((p, idx) => {
                      const rowNo = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                            {rowNo}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-red-600 tabular-nums whitespace-nowrap">
                            {p.code}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                            {p.discountType === "fixed"
                              ? formatRupiah(p.discountValue)
                              : `${p.discountValue}%`}
                          </TableCell>
                          <TableCell className="font-mono text-slate-600 tabular-nums whitespace-nowrap">
                            {formatRupiah(p.minSpend || 0)}
                          </TableCell>
                          <TableCell className="font-mono tabular-nums whitespace-nowrap">
                            <span className="font-bold text-slate-900">{p.usedCount || 0}</span>
                            <span className="text-slate-400"> / {p.quota || "∞"} klaim</span>
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            <Badge variant={p.isActive ? "success" : "default"}>
                              {p.isActive ? "AKTIF" : "NONAKTIF"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePromoActive(p)}
                              className="h-7 text-xs px-2.5"
                            >
                              {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeletePromo(p)}
                              className="h-7 text-xs px-2"
                              title="Hapus Promo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        Belum ada kode promo terdaftar untuk venue Anda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredPromos.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* MODAL: Buat Promo Baru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Kode Promo Baru"
      >
        <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
          {venues.length > 1 && (
            <Select
              label="Venue Target"
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              options={venues.map((v) => ({ value: v.id, label: v.name }))}
            />
          )}

          <Input
            label="Kode Voucher (Huruf Kapital)"
            placeholder="Contoh: MAINSIANG20"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase font-mono"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipe Potongan"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "fixed" | "percent")}
              options={[
                { value: "fixed", label: "Nominal Tetap (Rp)" },
                { value: "percent", label: "Persentase (%)" },
              ]}
            />

            <Input
              label={discountType === "fixed" ? "Nominal Diskon (Rp)" : "Persentase (%)"}
              type="number"
              min={1}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Minimum Transaksi (Rp)"
              type="number"
              min={0}
              value={minSpend}
              onChange={(e) => setMinSpend(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Kuota Klaim"
              type="number"
              min={0}
              value={quota}
              onChange={(e) => setQuota(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <Input
            label="Berlaku Sampai Tanggal"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
            required
          />

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
              {saving ? "Menyimpan..." : "Aktifkan Promo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraPromosPage;
