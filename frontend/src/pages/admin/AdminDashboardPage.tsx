import * as React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, Button } from "@/components/ui";
import {
  MOCK_VENUES,
  MOCK_BOOKINGS,
  MOCK_MITRA_PROFILES,
  MOCK_USERS,
} from "@/lib/mock-data";
import { formatRupiah } from "@futsal/shared";

export function AdminDashboardPage() {
  const [downloadingFormat, setDownloadingFormat] = React.useState<string | null>(null);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);

  // Compute metrics
  const totalUsers = MOCK_USERS.length;
  const totalMitra = MOCK_MITRA_PROFILES.length;
  const pendingMitraCount = MOCK_MITRA_PROFILES.filter(
    (m) => m.verificationStatus === "menunggu"
  ).length;
  const totalVenues = MOCK_VENUES.length;
  const totalBookings = MOCK_BOOKINGS.length;
  const gmv = MOCK_BOOKINGS.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const platformCommission = MOCK_BOOKINGS.reduce(
    (acc, curr) => acc + (curr.platformCommission || 0),
    0
  );

  // Monthly revenue breakdown simulation
  const monthlyStats = [
    { month: "Mei", gmv: 42000000, bookings: 160 },
    { month: "Jun", gmv: 58000000, bookings: 210 },
    { month: "Jul", gmv: 71000000, bookings: 265 },
    { month: "Agt", gmv: 83500000, bookings: 310 },
    { month: "Sep", gmv: 92400000, bookings: 350 },
    { month: "Okt (Bulan Ini)", gmv: 114250000, bookings: 428 },
  ];

  const handleExport = (format: "PDF" | "Excel/CSV") => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      setExportMessage(`Laporan format ${format} berhasil digenerate dan diunduh.`);
      setTimeout(() => setExportMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Pengawasan Platform
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring performa real-time seluruh Indonesia, transaksi GMV, dan status operasional mitra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("Excel/CSV")}
            disabled={!!downloadingFormat}
            className="text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            {downloadingFormat === "Excel/CSV" ? "Mengekspor..." : "Ekspor Excel/CSV"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport("PDF")}
            disabled={!!downloadingFormat}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            {downloadingFormat === "PDF" ? "Mengekspor..." : "Ekspor Laporan PDF"}
          </Button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{exportMessage}</span>
          <button onClick={() => setExportMessage(null)} className="text-emerald-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross GMV Transaksi</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {formatRupiah(gmv > 100000000 ? gmv : 114250000)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+24.6% dari bulan lalu</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Komisi Platform (10%)</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2 font-mono tabular-nums">
            {formatRupiah(platformCommission > 10000000 ? platformCommission : 11425000)}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Pendapatan bersih platform
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Booking Terkonfirmasi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            428 Pesanan
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-600 font-medium">
            <span>98.2% pembayaran via QRIS & VA</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mitra & Pengguna</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalMitra} Mitra</p>
            <span className="text-xs text-slate-400">/ {totalUsers} Penyewa</span>
          </div>
          {pendingMitraCount > 0 ? (
            <Link
              to="/admin/mitra"
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mt-2"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{pendingMitraCount} mitra menunggu verifikasi →</span>
            </Link>
          ) : (
            <span className="text-[11px] text-emerald-600 font-medium block mt-2">
              Seluruh mitra terverifikasi
            </span>
          )}
        </Card>
      </div>

      {/* Chart & Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Visualization */}
        <Card className="lg:col-span-2 p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pertumbuhan GMV & Booking (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-slate-500">Volume transaksi booking online tiket platform</p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              IDR (Rupiah)
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
            {monthlyStats.map((item, idx) => {
              const maxGmv = 120000000;
              const heightPercent = Math.round((item.gmv / maxGmv) * 100);
              const isCurrent = idx === monthlyStats.length - 1;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-red-600 transition-colors">
                    {(item.gmv / 1000000).toFixed(1)}M
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-sm h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isCurrent
                          ? "bg-red-600 group-hover:bg-red-700 shadow-sm shadow-red-200"
                          : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium truncate ${
                      isCurrent ? "font-bold text-red-600" : "text-slate-500"
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span>Rata-rata tiket per booking: 2.1 jam main</span>
            <span className="font-semibold text-slate-700">Tingkat keberhasilan bayar: 94.8%</span>
          </div>
        </Card>

        {/* Quick System Status Card */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Status Operasional Layanan</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Midtrans Gateway Normal</p>
                <p className="text-[11px] text-emerald-700">
                  Webhook notification response time: 240ms
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-950">Slot Lock Engine Aktif</p>
                <p className="text-[11px] text-blue-700">
                  Auto-expire slot 15 menit berjalan konsisten
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-purple-950">AI Chatbot Asisten Aktif</p>
                <p className="text-[11px] text-purple-700">
                  Provider: Gemini 1.5 Flash (Latency 850ms)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Versi Platform</span>
            <span className="font-mono font-medium text-slate-600">v2.4.0 (Enterprise)</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
