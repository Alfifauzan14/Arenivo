import * as React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ArrowRight,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  useToast,
} from "@/components/ui";
import { MitraVerificationStatus } from "@futsal/shared";
import { cn } from "@/lib/utils";

export function MitraApplicationPage() {
  const { addToast } = useToast();

  // Verification status state
  const [status, setStatus] = React.useState<MitraVerificationStatus>(
    MitraVerificationStatus.MENUNGGU
  );

  const [businessName, setBusinessName] = React.useState("PT Spartan Olahraga Sejahtera");
  const [businessAddress, setBusinessAddress] = React.useState(
    "Jl. TB Simatupang No. 45, Cilandak Barat, Jakarta Selatan"
  );
  const [npwpNumber, setNpwpNumber] = React.useState("01.234.567.8-901.000");
  const [nibNumber, setNibNumber] = React.useState("1234567890123");
  const [uploadedFile] = React.useState<string>("NIB_SIUP_Spartan.pdf");
  const [rejectionReason] = React.useState<string>(
    "Foto dokumen NIB/SIUP terpotong dan alamat usaha pada dokumen tidak cocok dengan alamat arena lapangan yang diajukan. Mohon unggah scan dokumen resmi yang jelas."
  );

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !businessAddress) {
      addToast("warning", "Mohon lengkapi seluruh kolom formulir.", "Data Belum Lengkap");
      return;
    }

    setStatus(MitraVerificationStatus.MENUNGGU);
    addToast(
      "success",
      "Berkas verifikasi usaha berhasil dikirim ulang. Tim Admin akan meninjau dalam 1x24 jam.",
      "Pengajuan Terkirim"
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header & Status Simulator Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Verifikasi Usaha Mitra
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Kelola berkas legalitas usaha dan pantau status peninjauan oleh Admin Platform.
          </p>
        </div>

        {/* Status Preview Switcher */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xs w-full sm:w-auto">
          {[
            { id: MitraVerificationStatus.MENUNGGU, label: "Menunggu" },
            { id: MitraVerificationStatus.DISETUJUI, label: "Disetujui" },
            { id: MitraVerificationStatus.DITOLAK, label: "Ditolak" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center",
                status === item.id
                  ? "bg-red-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Status Indicator Banner */}
      {status === MitraVerificationStatus.MENUNGGU && (
        <div className="p-4 sm:p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
              <span>Berkas Sedang Ditinjau Admin</span>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border border-amber-300 shrink-0">
              Menunggu
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Data usaha Anda sedang diverifikasi oleh tim kepatuhan platform (estimasi 1x24 jam kerja). Anda tetap dapat mengatur jadwal dan spesifikasi lapangan sambil menunggu persetujuan.
          </p>
        </div>
      )}

      {status === MitraVerificationStatus.DISETUJUI && (
        <div className="p-4 sm:p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              <span>Akun Mitra Resmi Terverifikasi</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border border-emerald-300 shrink-0">
              Terverifikasi
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Usaha lapangan Anda telah terverifikasi. Seluruh venue Anda kini aktif menerima reservasi online dan pembayaran otomatis.
          </p>
          <div>
            <Link to="/mitra/venues">
              <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center text-xs gap-1.5">
                Kelola Venue & Lapangan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === MitraVerificationStatus.DITOLAK && (
        <div className="p-4 sm:p-5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-800">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
              <span>Memerlukan Revisi Berkas</span>
            </div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border border-rose-300 shrink-0">
              Ditolak
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-slate-800 space-y-1">
            <span className="font-semibold text-rose-700 block text-[11px]">
              Catatan Penolakan dari Admin:
            </span>
            <p className="leading-relaxed text-slate-700">"{rejectionReason}"</p>
          </div>
        </div>
      )}

      {/* 2. Formulir Data & Dokumen Usaha */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            Data Legalitas & Dokumen Usaha
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Lengkapi informasi badan usaha dan unggah dokumen izin operasional resmi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-4">
          <form onSubmit={handleResubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Perusahaan / Badan Usaha"
                placeholder="Contoh: PT Spartan Olahraga Sejahtera"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={status === MitraVerificationStatus.DISETUJUI}
              />

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <Input
                  label="Nomor NPWP"
                  value={npwpNumber}
                  onChange={(e) => setNpwpNumber(e.target.value)}
                  disabled={status === MitraVerificationStatus.DISETUJUI}
                  className="font-mono"
                />
                <Input
                  label="Nomor NIB / SIUP"
                  value={nibNumber}
                  onChange={(e) => setNibNumber(e.target.value)}
                  disabled={status === MitraVerificationStatus.DISETUJUI}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block text-xs">
                Alamat Lengkap Usaha / Venue
              </label>
              <textarea
                rows={2}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                disabled={status === MitraVerificationStatus.DISETUJUI}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2 pt-1">
              <label className="font-semibold text-slate-700 block text-xs">
                Dokumen Pendukung (KTP Pemilik / NIB / SIUP)
              </label>
              <div className="p-4 sm:p-5 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400" />
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-red-600">Klik untuk unggah berkas</span> atau tarik dokumen ke area ini
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  PDF, JPG, PNG (Maks. 5MB)
                </span>
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-mono text-emerald-800 max-w-full truncate">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{uploadedFile}</span>
                  </div>
                )}
              </div>
            </div>

            {status !== MitraVerificationStatus.DISETUJUI && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto justify-center text-xs gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Kirim Ulang Berkas
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default MitraApplicationPage;
