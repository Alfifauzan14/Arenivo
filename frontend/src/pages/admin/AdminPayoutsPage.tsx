import * as React from "react";
import {
  Wallet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  CreditCard,
  Check,
  X,
  Eye,
  ArrowUpRight,
  Send,
  FileCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Select,
  Modal,
  TablePagination,
} from "@/components/ui";
import { MOCK_PAYOUTS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatDateIndo, PayoutStatus, type Payout } from "@futsal/shared";

type PayoutItem = Payout;

const EXTENDED_PAYOUTS: PayoutItem[] = [
  ...MOCK_PAYOUTS,
  {
    id: "po-3",
    mitraId: "m2222222-2222-2222-2222-222222222222",
    amount: 3200000,
    status: "menunggu",
    bankName: "Mandiri",
    bankAccountNumber: "1310098765432",
    bankAccountHolder: "CV Champion Sport Bandung",
    createdAt: "2026-10-15T09:10:00+07:00",
  },
  {
    id: "po-4",
    mitraId: "m4444444-4444-4444-4444-444444444444",
    amount: 500000,
    status: "ditolak",
    bankName: "BRI",
    bankAccountNumber: "002101928374",
    bankAccountHolder: "Agus Santoso",
    createdAt: "2026-10-11T10:00:00+07:00",
  },
];

export function AdminPayoutsPage() {
  const [payouts, setPayouts] = React.useState<PayoutItem[]>(EXTENDED_PAYOUTS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/admin/payouts").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPayouts(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedPayout, setSelectedPayout] = React.useState<PayoutItem | null>(null);

  // Complete Transfer Modal
  const [completingPayout, setCompletingPayout] = React.useState<PayoutItem | null>(null);
  const [transferRef, setTransferRef] = React.useState("");
  const [transferError, setTransferError] = React.useState<string | null>(null);

  // Reject Modal
  const [rejectingPayout, setRejectingPayout] = React.useState<PayoutItem | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.bankAccountHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bankAccountNumber.includes(searchQuery) ||
      p.bankName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = (payoutItem: PayoutItem) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payoutItem.id ? { ...p, status: "diproses" } : p))
    );
    if (selectedPayout?.id === payoutItem.id) {
      setSelectedPayout((prev) => (prev ? { ...prev, status: "diproses" } : null));
    }
    showToast(
      `Pengajuan payout ${formatRupiah(payoutItem.amount)} disetujui. Status berubah menjadi DIPROSES.`
    );
  };

  const handleOpenComplete = (payoutItem: PayoutItem) => {
    setCompletingPayout(payoutItem);
    setTransferRef(`TRF-${payoutItem.bankName.toUpperCase()}-${Date.now().toString().slice(-6)}`);
    setTransferError(null);
  };

  const handleConfirmComplete = () => {
    if (!transferRef.trim() || transferRef.trim().length < 6) {
      setTransferError("Nomor referensi transfer bank wajib diisi minimal 6 karakter.");
      return;
    }

    if (!completingPayout) return;

    setPayouts((prev) =>
      prev.map((p) =>
        p.id === completingPayout.id
          ? {
              ...p,
              status: "selesai",
              transferReference: transferRef.trim(),
            }
          : p
      )
    );

    if (selectedPayout?.id === completingPayout.id) {
      setSelectedPayout((prev) =>
        prev
          ? {
              ...prev,
              status: "selesai",
              transferReference: transferRef.trim(),
            }
          : null
      );
    }

    showToast(
      `Pencairan dana ${formatRupiah(completingPayout.amount)} ke ${completingPayout.bankAccountHolder} berhasil ditandai selesai!`
    );
    setCompletingPayout(null);
  };

  const handleOpenReject = (payoutItem: PayoutItem) => {
    setRejectingPayout(payoutItem);
    setRejectReason("");
    setRejectError(null);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 8) {
      setRejectError("Alasan penolakan pencairan wajib diisi minimal 8 karakter.");
      return;
    }

    if (!rejectingPayout) return;

    setPayouts((prev) =>
      prev.map((p) => (p.id === rejectingPayout.id ? { ...p, status: "ditolak" } : p))
    );

    if (selectedPayout?.id === rejectingPayout.id) {
      setSelectedPayout((prev) => (prev ? { ...prev, status: "ditolak" } : null));
    }

    showToast(`Pengajuan pencairan saldo ${rejectingPayout.bankAccountHolder} ditolak.`);
    setRejectingPayout(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Pencairan Dana Saldo Mitra (Payouts)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Proses transfer penarikan pendapatan bersih sewa lapangan ke rekening bank mitra
        </p>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Unified Filter Toolbar & Main Table Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari pemilik rekening, nomor rekening, atau bank..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Status (${payouts.length})` },
                  {
                    value: "menunggu",
                    label: `Menunggu (${payouts.filter((p) => p.status === "menunggu").length})`,
                  },
                  {
                    value: "diproses",
                    label: `Diproses (${payouts.filter((p) => p.status === "diproses").length})`,
                  },
                  {
                    value: "selesai",
                    label: `Selesai (${payouts.filter((p) => p.status === "selesai").length})`,
                  },
                  {
                    value: "ditolak",
                    label: `Ditolak (${payouts.filter((p) => p.status === "ditolak").length})`,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Penerima & Rekening</TableHead>
                <TableHead className="text-xs">Bank</TableHead>
                <TableHead className="text-xs text-right">Nominal Payout</TableHead>
                <TableHead className="text-xs">Tanggal Pengajuan</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada permohonan payout yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayouts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900 block">
                        {p.bankAccountHolder}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {p.bankAccountNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-semibold text-xs text-slate-800">
                        {p.bankName}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono font-bold text-xs text-slate-900 text-right tabular-nums">
                      {formatRupiah(p.amount)}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {p.createdAt ? formatDateIndo(p.createdAt.split("T")[0]) : "-"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          p.status === "selesai"
                            ? "success"
                            : p.status === "ditolak"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {p.status === "selesai" ? "DITRANSFER" : p.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayout(p)}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail
                      </Button>

                      {p.status === "menunggu" && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(p)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Setujui
                        </Button>
                      )}

                      {(p.status === "menunggu" || p.status === "diproses") && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleOpenComplete(p)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            Transfer Selesai
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenReject(p)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredPayouts.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredPayouts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* DETAIL MODAL */}
      {selectedPayout && (
        <Modal
          isOpen={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          title={`Detail Pencairan: ${formatRupiah(selectedPayout.amount)}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Status Pencairan</span>
                <Badge
                  variant={
                    selectedPayout.status === "selesai"
                      ? "success"
                      : selectedPayout.status === "ditolak"
                      ? "danger"
                      : "warning"
                  }
                  className="mt-1"
                >
                  {selectedPayout.status === "selesai" ? "DITRANSFER" : selectedPayout.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <span className="text-slate-400 block">Nominal Penarikan</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {formatRupiah(selectedPayout.amount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Rekening Bank Tujuan
              </span>
              <p className="text-slate-600">
                Bank: <strong className="text-slate-900">{selectedPayout.bankName}</strong>
              </p>
              <p className="text-slate-600">
                Nomor Rekening:{" "}
                <strong className="text-slate-900 font-mono">
                  {selectedPayout.bankAccountNumber}
                </strong>
              </p>
              <p className="text-slate-600">
                Pemilik Rekening:{" "}
                <strong className="text-slate-900">{selectedPayout.bankAccountHolder}</strong>
              </p>
            </div>

            {selectedPayout.transferReference && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor Referensi Transfer Selesai
                </span>
                <p className="font-mono text-emerald-950 font-bold">
                  {selectedPayout.transferReference}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPayout(null)}
                className="text-xs"
              >
                Tutup
              </Button>

              {(selectedPayout.status === "menunggu" || selectedPayout.status === "diproses") && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenComplete(selectedPayout)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Selesaikan Transfer
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenReject(selectedPayout)}
                    className="text-xs"
                  >
                    Tolak Payout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* COMPLETE TRANSFER MODAL */}
      {completingPayout && (
        <Modal
          isOpen={!!completingPayout}
          onClose={() => setCompletingPayout(null)}
          title={`Konfirmasi Transfer: ${formatRupiah(completingPayout.amount)}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Masukkan nomor referensi transaksi transfer bank (misal dari mutasi KlikBCA / Mandiri
              Cash Management) untuk rekonsiliasi keuangan platform.
            </p>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
              <span className="text-slate-400 block text-[11px]">Tujuan Transfer:</span>
              <p className="font-semibold">{completingPayout.bankAccountHolder}</p>
              <p className="font-mono">
                {completingPayout.bankName} - {completingPayout.bankAccountNumber}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">
                Nomor Referensi Bank <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transferRef}
                onChange={(e) => {
                  setTransferRef(e.target.value);
                  if (transferError) setTransferError(null);
                }}
                placeholder="Contoh: TRF-BCA-20261015-99881"
                className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              {transferError && <p className="text-red-600 text-[11px]">{transferError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompletingPayout(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Konfirmasi Transfer Berhasil
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT PAYOUT MODAL */}
      {rejectingPayout && (
        <Modal
          isOpen={!!rejectingPayout}
          onClose={() => setRejectingPayout(null)}
          title={`Tolak Pengajuan Pencairan Saldo`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Harap jelaskan alasan penolakan pencairan (misal: nomor rekening tidak sesuai nama
              pemilik venue terdaftar, atau sedang dalam investigasi fraud).
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="Contoh: Nama pemilik rekening tidak sinkron dengan dokumen NIB mitra..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              {rejectError && <p className="text-red-600 text-[11px]">{rejectError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingPayout(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                className="text-xs"
              >
                Konfirmasi Tolak Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
