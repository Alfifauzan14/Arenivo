import * as React from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Loader2,
  ExternalLink,
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
import { apiClient } from "@/lib/api-client";
import { MitraVerificationStatus } from "@futsal/shared";
import { Link } from "react-router-dom";

export function MitraApplicationPage() {
  const { addToast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<MitraVerificationStatus>(
    MitraVerificationStatus.MENUNGGU
  );

  const [businessName, setBusinessName] = React.useState("");
  const [businessAddress, setBusinessAddress] = React.useState("");
  const [documentUrl, setDocumentUrl] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState<string | null>(null);
  const [bankInfo, setBankInfo] = React.useState<{
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
  }>({});

  const loadProfile = React.useCallback(async () => {
    try {
      const res = await apiClient.get<any>("/mitra/profile");
      const mp = res.data?.mitraProfile;
      if (mp) {
        setStatus((mp.verificationStatus as MitraVerificationStatus) || MitraVerificationStatus.MENUNGGU);
        setBusinessName(mp.businessName || "");
        setBusinessAddress(mp.businessAddress || "");
        setDocumentUrl(mp.documentUrl || "");
        setRejectionReason(mp.rejectionReason || null);
        setBankInfo({
          bankName: mp.bankName,
          bankAccountNumber: mp.bankAccountNumber,
          bankAccountHolder: mp.bankAccountHolder,
        });
      }
    } catch {
      addToast("error", "Gagal memuat data verifikasi usaha mitra.", "Gagal Memuat");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !businessAddress.trim()) {
      addToast("warning", "Nama usaha dan alamat wajib diisi.", "Data Belum Lengkap");
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch("/mitra/profile", {
        businessName: businessName.trim(),
      });
      addToast(
        "success",
        "Data usaha berhasil diperbarui dan disimpan.",
        "Tersimpan"
      );
      await loadProfile();
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal memperbarui data usaha.", "Gagal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
        <span>Memuat status verifikasi usaha...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
          Verifikasi Usaha Mitra
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Data legalitas usaha riil dan status peninjauan oleh Admin Platform.
        </p>
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
            Data usaha Anda sedang diverifikasi oleh tim kepatuhan platform.
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
              Disetujui
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Usaha lapangan Anda ({businessName}) telah terverifikasi. Seluruh venue Anda aktif menerima reservasi online dan pencairan saldo.
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

          {rejectionReason && (
            <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-slate-800 space-y-1">
              <span className="font-semibold text-rose-700 block text-[11px]">
                Catatan Penolakan dari Admin:
              </span>
              <p className="leading-relaxed text-slate-700">"{rejectionReason}"</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Informasi Usaha Riil */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            Data Legalitas & Rekening Usaha
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Informasi resmi mitra yang tercatat di database platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-4">
          <form onSubmit={handleResubmit} className="space-y-4 text-xs">
            <Input
              label="Nama Perusahaan / Badan Usaha"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={status === MitraVerificationStatus.DISETUJUI}
            />

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block text-xs">
                Alamat Lengkap Usaha / Venue
              </label>
              <textarea
                rows={2}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                disabled
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-100 text-xs text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Bank Pencairan</span>
                <span className="font-bold text-slate-900">{bankInfo.bankName || "-"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Nomor Rekening</span>
                <span className="font-mono font-bold text-slate-900">{bankInfo.bankAccountNumber || "-"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Atas Nama</span>
                <span className="font-bold text-slate-900">{bankInfo.bankAccountHolder || "-"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block text-xs">
                Berkas Dokumen Legalitas
              </label>
              {documentUrl ? (
                <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono truncate">{documentUrl}</span>
                  </div>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline shrink-0"
                  >
                    Lihat <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-slate-400">Belum ada dokumen diunggah.</p>
              )}
            </div>

            {status !== MitraVerificationStatus.DISETUJUI && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button type="submit" variant="primary" size="md" disabled={saving} className="text-xs">
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
