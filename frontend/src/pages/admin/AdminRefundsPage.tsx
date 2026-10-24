import * as React from "react";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Building,
  Check,
  X,
  Eye,
  ExternalLink,
  DollarSign,
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
import { MOCK_REFUNDS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatDateIndo, RefundStatus } from "@futsal/shared";

type RefundItem = (typeof MOCK_REFUNDS)[number];

export function AdminRefundsPage() {
  const [refunds, setRefunds] = React.useState<RefundItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/admin/refunds").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data)) {
        setRefunds(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedRefund, setSelectedRefund] = React.useState<RefundItem | null>(null);

  // Manual Transfer Complete Modal
  const [manualRefund, setManualRefund] = React.useState<RefundItem | null>(null);
  const [transferRef, setTransferRef] = React.useState("");
  const [transferError, setTransferError] = React.useState<string | null>(null);

  // Reject Modal
  const [rejectingRefund, setRejectingRefund] = React.useState<RefundItem | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.venueName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || r.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleProcessMidtrans = (refundItem: RefundItem) => {
    const refundKey = `REF-MID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundItem.id
          ? {
              ...r,
              status: RefundStatus.SELESAI,
              midtransRefundKey: refundKey,
              processedBy: "adm-1",
              processedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (selectedRefund?.id === refundItem.id) {
      setSelectedRefund((prev) =>
        prev
          ? {
              ...prev,
              status: RefundStatus.SELESAI,
              midtransRefundKey: refundKey,
            }
          : null
      );
    }

    showToast(
      `Pengembalian dana ${formatRupiah(refundItem.amount)} via Midtrans API berhasil diproses. Kunci refund: ${refundKey}.`
    );
  };

  const handleOpenManual = (refundItem: RefundItem) => {
    setManualRefund(refundItem);
    setTransferRef(`TRF-MANUAL-${Date.now().toString().slice(-6)}`);
    setTransferError(null);
  };

  const handleConfirmManual = () => {
    if (!transferRef.trim() || transferRef.trim().length < 6) {
      setTransferError("Nomor referensi transfer bank wajib diisi minimal 6 karakter.");
      return;
    }

    if (!manualRefund) return;

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === manualRefund.id
          ? {
              ...r,
              status: RefundStatus.SELESAI,
              midtransRefundKey: transferRef.trim(),
              processedBy: "adm-1",
              processedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (selectedRefund?.id === manualRefund.id) {
      setSelectedRefund((prev) =>
        prev
          ? {
              ...prev,
              status: RefundStatus.SELESAI,
              midtransRefundKey: transferRef.trim(),
            }
          : null
      );
    }

    showToast(
      `Refund ${formatRupiah(manualRefund.amount)} ditandai selesai secara manual dengan No. Ref: ${transferRef.trim()}.`
    );
    setManualRefund(null);
  };

  const handleOpenReject = (refundItem: RefundItem) => {
    setRejectingRefund(refundItem);
    setRejectReason("");
    setRejectError(null);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 8) {
      setRejectError("Alasan penolakan wajib diisi minimal 8 karakter.");
      return;
    }

    if (!rejectingRefund) return;

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === rejectingRefund.id
          ? {
              ...r,
              status: RefundStatus.DITOLAK,
              rejectionReason: rejectReason.trim(),
              processedBy: "adm-1",
              processedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (selectedRefund?.id === rejectingRefund.id) {
      setSelectedRefund((prev) =>
        prev
          ? {
              ...prev,
              status: RefundStatus.DITOLAK,
              rejectionReason: rejectReason.trim(),
            }
          : null
      );
    }

    showToast(`Klaim refund ${rejectingRefund.bookingCode} berhasil ditolak.`);
    setRejectingRefund(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Penanganan & Proses Refund Dana
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verifikasi klaim pembatalan pesanan penyewa atau pembatalan sepihak oleh mitra sesuai aturan venue
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
                placeholder="Cari kode booking, nama penyewa, atau venue..."
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
            <div className="w-full sm:w-60 shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Status (${refunds.length})` },
                  {
                    value: "diajukan",
                    label: `Diajukan (${refunds.filter((r) => r.status === "diajukan").length})`,
                  },
                  {
                    value: "disetujui",
                    label: `Disetujui (${refunds.filter((r) => r.status === "disetujui").length})`,
                  },
                  {
                    value: "diproses",
                    label: `Diproses (${refunds.filter((r) => r.status === "diproses").length})`,
                  },
                  {
                    value: "selesai",
                    label: `Selesai (${refunds.filter((r) => r.status === "selesai").length})`,
                  },
                  {
                    value: "ditolak",
                    label: `Ditolak (${refunds.filter((r) => r.status === "ditolak").length})`,
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
                <TableHead className="text-xs">Kode & Penyewa</TableHead>
                <TableHead className="text-xs">Venue & Alasan</TableHead>
                <TableHead className="text-xs text-right">Nominal Refund</TableHead>
                <TableHead className="text-xs text-center">% Refund</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada klaim refund yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRefunds.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-red-600 block">
                        {r.bookingCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 block">
                        {r.customerName}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-800 block">
                        {r.venueName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[260px]">
                        {r.reason}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono font-bold text-xs text-slate-900 text-right tabular-nums">
                      {formatRupiah(r.amount)}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {r.refundPercent}%
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          r.status === RefundStatus.SELESAI
                            ? "success"
                            : r.status === RefundStatus.DIAJUKAN
                            ? "warning"
                            : r.status === RefundStatus.DIPROSES
                            ? "info"
                            : "danger"
                        }
                      >
                        {r.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRefund(r)}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail
                      </Button>

                      {r.status === RefundStatus.DIAJUKAN || r.status === RefundStatus.DIPROSES ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleProcessMidtrans(r)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1" />
                            Midtrans
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenReject(r)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredRefunds.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredRefunds.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* DETAIL MODAL */}
      {selectedRefund && (
        <Modal
          isOpen={!!selectedRefund}
          onClose={() => setSelectedRefund(null)}
          title={`Detail Klaim Refund: ${selectedRefund.bookingCode}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Status Refund</span>
                <Badge
                  variant={
                    selectedRefund.status === RefundStatus.SELESAI
                      ? "success"
                      : selectedRefund.status === RefundStatus.DIAJUKAN
                      ? "warning"
                      : selectedRefund.status === RefundStatus.DIPROSES
                      ? "info"
                      : "danger"
                  }
                  className="mt-1"
                >
                  {selectedRefund.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <span className="text-slate-400 block">Nominal Disetujui</span>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {formatRupiah(selectedRefund.amount)} ({selectedRefund.refundPercent}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block">Nama Penyewa</span>
                <p className="font-semibold text-slate-800">{selectedRefund.customerName}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Venue Terkait</span>
                <p className="font-semibold text-slate-800">{selectedRefund.venueName}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-800">Alasan Permintaan Refund</span>
              <p className="text-slate-600 p-2.5 bg-slate-50 border border-slate-200 rounded">
                {selectedRefund.reason}
              </p>
            </div>

            {selectedRefund.midtransRefundKey && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Kunci / Referensi Pengembalian Dana
                </span>
                <p className="font-mono text-emerald-950 font-bold">
                  {selectedRefund.midtransRefundKey}
                </p>
              </div>
            )}

            {selectedRefund.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <span className="font-bold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Alasan Penolakan Refund
                </span>
                <p className="text-red-950">{selectedRefund.rejectionReason}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRefund(null)}
                className="text-xs"
              >
                Tutup
              </Button>

              {(selectedRefund.status === RefundStatus.DIAJUKAN ||
                selectedRefund.status === RefundStatus.DIPROSES) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenManual(selectedRefund)}
                    className="text-xs"
                  >
                    Tandai Selesai Manual
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleProcessMidtrans(selectedRefund)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Proses Midtrans API
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenReject(selectedRefund)}
                    className="text-xs"
                  >
                    Tolak Refund
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MANUAL COMPLETE MODAL */}
      {manualRefund && (
        <Modal
          isOpen={!!manualRefund}
          onClose={() => setManualRefund(null)}
          title={`Selesaikan Refund Manual: ${manualRefund.bookingCode}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Gunakan opsi ini jika transfer pengembalian dana telah dilakukan melalui m-Banking /
              Internet Banking ke rekening penyewa secara langsung.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">
                Nomor Referensi Transfer Bank <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transferRef}
                onChange={(e) => {
                  setTransferRef(e.target.value);
                  if (transferError) setTransferError(null);
                }}
                placeholder="Contoh: TRF-BCA-20261015-88192"
                className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              {transferError && <p className="text-red-600 text-[11px]">{transferError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualRefund(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmManual}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Tandai Selesai
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectingRefund && (
        <Modal
          isOpen={!!rejectingRefund}
          onClose={() => setRejectingRefund(null)}
          title={`Tolak Permintaan Refund: ${rejectingRefund.bookingCode}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Harap jelaskan alasan penolakan sesuai kebijakan refund venue (misalnya: pembatalan
              kurang dari 6 jam sebelum waktu bermain).
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
                placeholder="Contoh: Sesuai aturan venue, pembatalan kurang dari 6 jam sebelum waktu main tidak berhak refund (0%)..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              {rejectError && <p className="text-red-600 text-[11px]">{rejectError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingRefund(null)}
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
                Konfirmasi Tolak Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
