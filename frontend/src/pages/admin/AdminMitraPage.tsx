import * as React from "react";
import {
  Check,
  X,
  FileText,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Building,
  CreditCard,
  Phone,
  Mail,
  Shield,
  ShieldAlert,
  ExternalLink,
  Ban,
  CheckCircle2,
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
  Input,
  Select,
  Modal,
  TablePagination,
} from "@/components/ui";
import { MOCK_MITRA_PROFILES } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatDateIndo, MitraVerificationStatus, AccountStatus } from "@futsal/shared";

type MitraItem = (typeof MOCK_MITRA_PROFILES)[number] & {
  accountStatus?: "aktif" | "diblokir";
};

export function AdminMitraPage() {
  const [mitraList, setMitraList] = React.useState<MitraItem[]>(
    MOCK_MITRA_PROFILES.map((m) => ({
      ...m,
      accountStatus: m.id === "mp-4" ? AccountStatus.DIBLOKIR : AccountStatus.AKTIF,
    }))
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterVerification, setFilterVerification] = React.useState<string>("all");
  const [filterAccount, setFilterAccount] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/admin/mitra").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMitraList(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected Mitra for detail inspection modal
  const [selectedMitra, setSelectedMitra] = React.useState<MitraItem | null>(null);

  // Reject Modal state
  const [rejectingMitra, setRejectingMitra] = React.useState<MitraItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  // Success Toast message
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered List
  const filteredMitra = mitraList.filter((m) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bankAccountNumber.includes(searchQuery);

    const matchesVerification =
      filterVerification === "all" || m.verificationStatus === filterVerification;

    const matchesAccount =
      filterAccount === "all" || m.accountStatus === filterAccount;

    return matchesSearch && matchesVerification && matchesAccount;
  });

  const paginatedMitra = filteredMitra.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = (mitraId: string) => {
    setMitraList((prev) =>
      prev.map((m) =>
        m.id === mitraId
          ? {
              ...m,
              verificationStatus: MitraVerificationStatus.DISETUJUI,
              rejectionReason: null,
              verifiedAt: new Date().toISOString(),
              verifiedBy: "adm-1",
            }
          : m
      )
    );
    if (selectedMitra?.id === mitraId) {
      setSelectedMitra((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: MitraVerificationStatus.DISETUJUI,
              rejectionReason: null,
            }
          : null
      );
    }
    apiClient.post(`/admin/mitra/${mitraId}/approve`).catch(() => {});
    showToast("Mitra berhasil disetujui! Venue mitra sekarang dapat ditayangkan.");
  };

  const handleOpenReject = (mitra: MitraItem) => {
    setRejectingMitra(mitra);
    setRejectionReason("");
    setRejectError(null);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 8) {
      setRejectError("Alasan penolakan wajib diisi minimal 8 karakter.");
      return;
    }

    if (!rejectingMitra) return;

    setMitraList((prev) =>
      prev.map((m) =>
        m.id === rejectingMitra.id
          ? {
              ...m,
              verificationStatus: MitraVerificationStatus.DITOLAK,
              rejectionReason: rejectionReason.trim(),
              verifiedAt: new Date().toISOString(),
              verifiedBy: "adm-1",
            }
          : m
      )
    );

    if (selectedMitra?.id === rejectingMitra.id) {
      setSelectedMitra((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: MitraVerificationStatus.DITOLAK,
              rejectionReason: rejectionReason.trim(),
            }
          : null
      );
    }

    showToast(`Pengajuan mitra ditolak dengan alasan: "${rejectionReason.trim()}".`);
    apiClient.post(`/admin/mitra/${rejectingMitra.id}/reject`, { reason: rejectionReason.trim() }).catch(() => {});
    setRejectingMitra(null);
  };

  const handleToggleBlock = (mitra: MitraItem) => {
    const newStatus =
      mitra.accountStatus === AccountStatus.DIBLOKIR
        ? AccountStatus.AKTIF
        : AccountStatus.DIBLOKIR;

    setMitraList((prev) =>
      prev.map((m) => (m.id === mitra.id ? { ...m, accountStatus: newStatus } : m))
    );

    if (selectedMitra?.id === mitra.id) {
      setSelectedMitra((prev) => (prev ? { ...prev, accountStatus: newStatus } : null));
    }

    showToast(
      `Akun mitra ${mitra.businessName} telah diubah menjadi ${newStatus.toUpperCase()}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Verifikasi & Manajemen Mitra Lapangan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tinjau legalitas dokumen usaha (NIB / KTP), rekening bank, serta kontrol akses akun mitra
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
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama usaha, email owner, nomor rekening..."
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

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0 md:w-96">
              <Select
                value={filterVerification}
                onChange={(e) => {
                  setFilterVerification(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Verifikasi (${mitraList.length})` },
                  {
                    value: "menunggu",
                    label: `Menunggu (${mitraList.filter((m) => m.verificationStatus === "menunggu").length})`,
                  },
                  {
                    value: "disetujui",
                    label: `Disetujui (${mitraList.filter((m) => m.verificationStatus === "disetujui").length})`,
                  },
                  {
                    value: "ditolak",
                    label: `Ditolak (${mitraList.filter((m) => m.verificationStatus === "ditolak").length})`,
                  },
                ]}
              />

              <Select
                value={filterAccount}
                onChange={(e) => {
                  setFilterAccount(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Semua Status Akun" },
                  { value: "aktif", label: "Akun Aktif" },
                  { value: "diblokir", label: "Akun Diblokir" },
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
                <TableHead className="text-xs">Nama Usaha / Owner</TableHead>
                <TableHead className="text-xs">Kontak & Alamat</TableHead>
                <TableHead className="text-xs">Rekening Bank</TableHead>
                <TableHead className="text-xs">Verifikasi</TableHead>
                <TableHead className="text-xs">Status Akun</TableHead>
                <TableHead className="text-xs text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMitra.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada mitra yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMitra.map((mitra) => (
                  <TableRow key={mitra.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mitra.businessName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block pl-5 truncate max-w-[200px]">
                        {mitra.email}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mitra.phone}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                        {mitra.businessAddress}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono font-medium text-slate-800 block">
                        {mitra.bankName} - {mitra.bankAccountNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                        a.n. {mitra.bankAccountHolder}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          mitra.verificationStatus === "disetujui"
                            ? "success"
                            : mitra.verificationStatus === "menunggu"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {mitra.verificationStatus.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={mitra.accountStatus === AccountStatus.AKTIF ? "success" : "danger"}
                      >
                        {mitra.accountStatus === AccountStatus.AKTIF ? "AKTIF" : "DIBLOKIR"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMitra(mitra)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail
                      </Button>

                      {mitra.verificationStatus === "menunggu" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(mitra.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenReject(mitra)}
                            className="text-xs h-7 px-2.5"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Tolak
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

        {filteredMitra.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredMitra.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* DETAIL MODAL */}
      {selectedMitra && (
        <Modal
          isOpen={!!selectedMitra}
          onClose={() => setSelectedMitra(null)}
          title={`Detail Mitra: ${selectedMitra.businessName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Status overview banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Status Verifikasi</span>
                <Badge
                  variant={
                    selectedMitra.verificationStatus === "disetujui"
                      ? "success"
                      : selectedMitra.verificationStatus === "menunggu"
                      ? "warning"
                      : "danger"
                  }
                  className="mt-1"
                >
                  {selectedMitra.verificationStatus.toUpperCase()}
                </Badge>
              </div>

              <div>
                <span className="text-slate-500 block">Status Akun</span>
                <Badge
                  variant={
                    selectedMitra.accountStatus === AccountStatus.AKTIF ? "success" : "danger"
                  }
                  className="mt-1"
                >
                  {selectedMitra.accountStatus === AccountStatus.AKTIF ? "AKTIF" : "DIBLOKIR"}
                </Badge>
              </div>
            </div>

            {/* Rejection Reason if any */}
            {selectedMitra.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg">
                <span className="font-bold flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alasan Penolakan:
                </span>
                <p className="mt-1 text-slate-700">{selectedMitra.rejectionReason}</p>
              </div>
            )}

            {/* Business & Owner Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-400 block">Nama Usaha</span>
                <p className="font-semibold text-slate-800">{selectedMitra.businessName}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Alamat Usaha</span>
                <p className="font-semibold text-slate-800">{selectedMitra.businessAddress}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Email Owner</span>
                <p className="font-mono text-slate-800">{selectedMitra.email}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Nomor Telepon</span>
                <p className="font-mono text-slate-800">{selectedMitra.phone}</p>
              </div>
            </div>

            {/* Bank Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Informasi Rekening Bank Pencairan
              </span>
              <p className="text-slate-600">
                Bank: <strong className="text-slate-900">{selectedMitra.bankName}</strong>
              </p>
              <p className="text-slate-600">
                Nomor Rekening:{" "}
                <strong className="text-slate-900 font-mono">
                  {selectedMitra.bankAccountNumber}
                </strong>
              </p>
              <p className="text-slate-600">
                Atas Nama:{" "}
                <strong className="text-slate-900">{selectedMitra.bankAccountHolder}</strong>
              </p>
            </div>

            {/* Document Preview (Signed URL simulation) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Dokumen Legalitas Usaha (NIB / SIUP / KTP)
              </span>
              <p className="text-slate-500 text-[11px]">
                Dokumen tersimpan aman pada Cloud Storage dengan Signed URL kedaluwarsa 15 menit.
              </p>
              <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-md">
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-[280px]">
                  {selectedMitra.documentUrl}
                </span>
                <a
                  href={selectedMitra.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Dokumen
                </a>
              </div>
            </div>

            {/* Action Bar inside Modal */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <Button
                variant={
                  selectedMitra.accountStatus === AccountStatus.AKTIF
                    ? "danger"
                    : "outline"
                }
                size="sm"
                onClick={() => handleToggleBlock(selectedMitra)}
                className="text-xs"
              >
                {selectedMitra.accountStatus === AccountStatus.AKTIF ? (
                  <>
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    Blokir Akun Mitra
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    Buka Blokir Akun
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                {selectedMitra.verificationStatus !== "disetujui" && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(selectedMitra.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Setujui Mitra
                  </Button>
                )}
                {selectedMitra.verificationStatus !== "ditolak" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenReject(selectedMitra)}
                    className="text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Tolak Mitra
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL REQUIRING REASON */}
      {rejectingMitra && (
        <Modal
          isOpen={!!rejectingMitra}
          onClose={() => setRejectingMitra(null)}
          title={`Tolak Pengajuan Mitra: ${rejectingMitra.businessName}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Harap cantumkan alasan penolakan secara spesifik dan jelas. Alasan ini akan
              ditampilkan kepada pemilik usaha agar mereka dapat memperbaiki dokumen legalitasnya.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="Contoh: Foto KTP buram dan nomor NIB OSS tidak valid saat diverifikasi..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              {rejectError && <p className="text-red-600 text-[11px]">{rejectError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingMitra(null)}
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
                Konfirmasi Tolak Mitra
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
