import * as React from "react";
import { Plus, Search, X, Trash2 } from "lucide-react";
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
import { MOCK_PROMOS } from "@/lib/mock-data";
import { formatRupiah, type Promo } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraPromosPage() {
  const { addToast } = useToast();
  const [promos, setPromos] = React.useState<Promo[]>(MOCK_PROMOS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("semua");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  // Form Promo State
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = React.useState<number>(20000);
  const [minSpend, setMinSpend] = React.useState<number>(150000);
  const [quota, setQuota] = React.useState<number>(50);

  const filteredPromos = React.useMemo(() => {
    return promos.filter((p) => {
      if (typeFilter !== "semua" && p.discountType !== typeFilter) return false;
      if (searchQuery.trim()) {
        return p.code.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      addToast("warning", "Kode promo wajib diisi.", "Validasi");
      return;
    }

    const newPromo: Promo = {
      id: `pr-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minSpend,
      quota,
      usedCount: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true,
    };

    setPromos((prev) => [newPromo, ...prev]);
    setIsModalOpen(false);
    setCode("");
    setCurrentPage(1);
    addToast(
      "success",
      `Kode promo ${newPromo.code} berhasil dibuat dan aktif untuk penyewa.`,
      "Promo Dibuat"
    );
  };

  const handleTogglePromoActive = (promoId: string) => {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const nextActive = !p.isActive;
          addToast(
            "success",
            `Kode promo ${p.code} berhasil di${nextActive ? "aktifkan" : "nonaktifkan"}.`,
            "Status Promo"
          );
          return { ...p, isActive: nextActive };
        }
        return p;
      })
    );
  };

  const handleDeletePromo = (promoId: string) => {
    const target = promos.find((p) => p.id === promoId);
    setPromos((prev) => prev.filter((p) => p.id !== promoId));
    addToast(
      "success",
      `Kode promo ${target?.code || ""} berhasil dihapus.`,
      "Promo Dihapus"
    );
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
            Kelola kode voucher diskon untuk meningkatkan okupansi lapangan pada jam sepi.
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

      {/* Promos Card (Unified Modern Table + Wide Search & Select) */}
      <Card className="bg-white border-slate-200">
        {/* Filter Header */}
        <div className="p-3.5 sm:p-4 bg-white rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode voucher promo..."
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
                  { value: "fixed", label: "Nominal Tetap (Rp)" },
                  { value: "percent", label: "Persentase (%)" },
                ]}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 */}
          <div className="md:hidden divide-y divide-slate-200 border-t border-slate-200">
            {paginatedPromos.length > 0 ? (
              paginatedPromos.map((p, idx) => {
                const rowNo = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "px-4 py-3.5 space-y-2 text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-red-50 text-red-700 border border-red-100 font-mono text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0">
                          {rowNo}
                        </span>
                        <span className="font-mono font-bold text-red-600 tabular-nums">
                          {p.code}
                        </span>
                      </div>
                      <Badge variant={p.isActive ? "success" : "default"}>
                        {p.isActive ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Diskon</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {p.discountType === "fixed"
                            ? formatRupiah(p.discountValue)
                            : `${p.discountValue}%`}
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Min. Sewa</span>
                        <span className="font-mono text-slate-700 tabular-nums">
                          {formatRupiah(p.minSpend || 0)}
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Kuota</span>
                        <span className="font-medium text-slate-800 tabular-nums">
                          <strong>{p.usedCount}</strong> / {p.quota} klaim
                        </span>
                      </div>
                    </div>

                    {/* Action buttons mobile */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePromoActive(p.id)}
                        className="flex-1 h-7 text-xs justify-center"
                      >
                        {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePromo(p.id)}
                        className="h-7 px-2 text-xs justify-center"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                Tidak ada kode promo yang sesuai dengan pencarian.
              </div>
            )}
          </div>

          {/* 2. Tampilan Web / Desktop: Tabel Modern Header Merah Soft */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Kode Promo</TableHead>
                  <TableHead className="text-xs">Nilai Diskon</TableHead>
                  <TableHead className="text-xs">Min. Transaksi</TableHead>
                  <TableHead className="text-xs">Kuota</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
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
                          <span className="font-bold text-slate-900">{p.usedCount}</span>
                          <span className="text-slate-400"> / {p.quota} klaim</span>
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
                            onClick={() => handleTogglePromoActive(p.id)}
                            className="h-7 text-xs px-2.5"
                          >
                            {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeletePromo(p.id)}
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
                      Tidak ada kode promo yang sesuai dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
          <Input
            label="Kode Voucher (Huruf Kapital)"
            placeholder="Contoh: MAINSIANG20"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase font-mono"
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
              value={discountValue}
              onChange={(e) => setDiscountValue(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Minimum Transaksi (Rp)"
              type="number"
              value={minSpend}
              onChange={(e) => setMinSpend(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Kuota Klaim"
              type="number"
              value={quota}
              onChange={(e) => setQuota(parseInt(e.target.value, 10) || 0)}
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
              Aktifkan Promo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MitraPromosPage;
