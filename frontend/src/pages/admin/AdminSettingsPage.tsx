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
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
} from "@/components/ui";
import { MOCK_SYSTEM_CONFIG } from "@/lib/mock-data";
import { AiProvider, type SystemConfig } from "@futsal/shared";

export function AdminSettingsPage() {
  const [config, setConfig] = React.useState<SystemConfig>(() => {
    const saved = localStorage.getItem("futsal_system_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return MOCK_SYSTEM_CONFIG;
  });

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = () => {
    localStorage.setItem("futsal_system_settings", JSON.stringify(config));
    showToast(
      "Konfigurasi platform berhasil diperbarui dan diterapkan ke seluruh sistem secara dinamis!"
    );
  };

  const handleReset = () => {
    setConfig(MOCK_SYSTEM_CONFIG);
    localStorage.setItem("futsal_system_settings", JSON.stringify(MOCK_SYSTEM_CONFIG));
    showToast("Pengaturan sistem dikembalikan ke nilai default standar.");
  };

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
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Simpan Konfigurasi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

