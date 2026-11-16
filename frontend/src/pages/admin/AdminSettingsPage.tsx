import * as React from "react";
import {
  Save,
  Bot,
  RotateCcw,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Select,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { LoadingSkeleton, ErrorState } from "@/components/common/LoadingStates";
import { AiProvider, type SystemConfig } from "@futsal/shared";

const DEFAULT_CONFIG: SystemConfig = {
  bookingExpirationMinutes: 15,
  maxBookingDaysAhead: 30,
  defaultPlatformCommissionPercent: 10,
  defaultServiceFeeRupiah: 5000,
  minPayoutAmountRupiah: 100000,
  scannerEarlyCheckinMinutes: 30,
  primaryAiProvider: AiProvider.GEMINI,
};

export function AdminSettingsPage() {
  const [config, setConfig] = React.useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch config from API on mount
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .get<Record<string, any>>("/admin/settings")
      .then((res) => {
        if (!active) return;
        const data = res.data || {};
        // system_settings returns key->value map; each value may be a nested object
        const cfg: SystemConfig = {
          bookingExpirationMinutes: Number(data.bookingExpirationMinutes?.value ?? data.bookingExpirationMinutes ?? 15),
          maxBookingDaysAhead: Number(data.maxBookingDaysAhead?.value ?? data.maxBookingDaysAhead ?? 30),
          defaultPlatformCommissionPercent: Number(data.defaultPlatformCommissionPercent?.value ?? data.defaultPlatformCommissionPercent ?? 10),
          defaultServiceFeeRupiah: Number(data.defaultServiceFeeRupiah?.value ?? data.defaultServiceFeeRupiah ?? 5000),
          minPayoutAmountRupiah: Number(data.minPayoutAmountRupiah?.value ?? data.minPayoutAmountRupiah ?? 100000),
          scannerEarlyCheckinMinutes: Number(data.scannerEarlyCheckinMinutes?.value ?? data.scannerEarlyCheckinMinutes ?? 30),
          primaryAiProvider: (data.primaryAiProvider?.value ?? data.primaryAiProvider ?? AiProvider.GEMINI) as any,
        };
        setConfig(cfg);
        setError(null);
      })
      .catch((err: any) => {
        if (active) setError(err?.data?.error?.message || "Gagal memuat pengaturan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each config value as a system_settings row
      const patch: Record<string, unknown> = {};
      (Object.keys(config) as (keyof SystemConfig)[]).forEach((key) => {
        patch[key] = config[key];
      });
      await apiClient.patch("/admin/settings", patch);
      showToast("Konfigurasi platform berhasil disimpan dan diterapkan ke seluruh sistem.");
    } catch (err: any) {
      showToast(err?.data?.error?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      setConfig(DEFAULT_CONFIG);
      await apiClient.patch("/admin/settings", DEFAULT_CONFIG);
      showToast("Pengaturan berhasil dikembalikan ke nilai default dan disimpan ke database.");
    } catch (err: any) {
      showToast(err?.data?.error?.message || "Gagal mereset konfigurasi ke database.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          apiClient
            .get("/admin/settings")
            .then(() => window.location.reload())
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Aturan Bisnis Sistem (system_settings)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ubah parameter operasional secara dinamis tanpa perlu deploy ulang kode (Zero-Downtime Config)
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

      {/* Settings Form Card */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-red-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Parameter Inti Booking & Keuangan
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Aturan batas waktu bayar, komisi sewa platform, dan limit payout mitra
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Batas Waktu Bayar & Kunci Slot (Menit)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={config.bookingExpirationMinutes}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    bookingExpirationMinutes: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Slot terkunci otomatis kedaluwarsa setelah durasi ini jika belum dibayar (Default: 15 menit).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Batas Pemesanan ke Depan (Hari)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={config.maxBookingDaysAhead}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxBookingDaysAhead: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Maksimal hari kalender ke depan yang dapat dipilih oleh penyewa (Default: 30 hari).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Komisi Platform (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={config.defaultPlatformCommissionPercent}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    defaultPlatformCommissionPercent: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Dipotong otomatis dari subtotal sewa saat booking online terkonfirmasi (Default: 10%).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Biaya Layanan Flat per Transaksi (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={config.defaultServiceFeeRupiah}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    defaultServiceFeeRupiah: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                100% milik platform untuk pemeliharaan server, ditanggung penyewa (Default: Rp 5.000).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Pencairan Minimum Saldo Mitra (Rp)
              </label>
              <input
                type="number"
                min={50000}
                step={50000}
                value={config.minPayoutAmountRupiah}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    minPayoutAmountRupiah: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Batas saldo minimal per permohonan penarikan dana mitra (Default: Rp 100.000).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Jendela Buka Check-in Scanner (Menit)
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={config.scannerEarlyCheckinMinutes}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    scannerEarlyCheckinMinutes: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Gate Scanner terbuka X menit sebelum jam main dimulai (Default: 30 menit).
              </span>
            </div>
          </div>

          {/* AI Provider Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <label className="text-xs font-bold text-slate-900">
                Provider Utama Chatbot Asisten AI
              </label>
            </div>
            <div className="w-full sm:w-96">
              <Select
                value={config.primaryAiProvider}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    primaryAiProvider: e.target.value as any,
                  }))
                }
                options={[
                  {
                    value: AiProvider.GEMINI,
                    label: "Google Gemini (Gemini Flash - AI Resmi Arenivo)",
                  },
                  
                ]}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              Didukung oleh Google Gemini Flash dengan integrasi katalog venue dan promo aktif secara real-time.
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Kembalikan ke Default
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Simpan Konfigurasi
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

