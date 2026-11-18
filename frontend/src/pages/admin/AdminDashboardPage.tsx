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
import { LoadingSkeleton } from "@/components/common/LoadingStates";
import { apiClient } from "@/lib/api-client";
import { formatRupiah } from "@futsal/shared";

export function AdminDashboardPage() {
  const [downloadingFormat, setDownloadingFormat] = React.useState<string | null>(null);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Live Compute metrics with Supabase API integration
  const [metrics, setMetrics] = React.useState({
    totalUsers: 0,
    totalMitra: 0,
    pendingMitraCount: 0,
    totalVenues: 0,
    totalBookings: 0,
    gmv: 0,
    platformCommission: 0,
    monthlyStats: [] as Array<{ month: string; gmv: number; bookings: number }>,
    avgHoursPerBooking: 0,
    paymentSuccessRate: 0,
    qrisVaSharePercent: 0,
    gmvGrowthPercent: 0,
    serviceHealth: {
      midtransMode: "Sandbox",
      slotLockMinutes: 15,
      aiProvider: "gemini",
      aiModel: "Gemini Flash",
    },
  });
  const [commissionPercent, setCommissionPercent] = React.useState<number>(12);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      apiClient.get<any>("/admin/dashboard").then((res) => {
        if (isMounted && res.data) {
          setMetrics((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      }),
      apiClient
        .get<any>("/admin/settings")
        .then((res) => {
          const pct = Number(res.data?.defaultPlatformCommissionPercent);
          if (isMounted && Number.isFinite(pct) && pct > 0) {
            setCommissionPercent(pct);
          }
        })
        .catch(() => {}),
    ])
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    totalUsers,
    totalMitra,
    pendingMitraCount,
    totalBookings,
    gmv,
    platformCommission,
    monthlyStats,
    avgHoursPerBooking,
    paymentSuccessRate,
    qrisVaSharePercent,
    gmvGrowthPercent,
    serviceHealth,
  } = metrics;

  if (loading) {
    return <LoadingSkeleton />;
  }

  const maxMonthlyGmv = Math.max(1000000, ...monthlyStats.map((m) => m.gmv || 0));

  const handleExport = async (format: "PDF" | "Excel/CSV") => {
    setDownloadingFormat(format);
    try {
      const bookingsRes = await apiClient.get<any[]>("/admin/bookings").catch(() => ({ data: [] }));
      const rows = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const today = new Date().toISOString().split("T")[0];

      if (format === "Excel/CSV") {
        const escapeCsv = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        const summaryHeader = [
          ["Laporan Platform Arenivo", today],
          ["Gross GMV", gmv],
          [`Komisi Platform (${commissionPercent}%)`, platformCommission],
          ["Total Booking Terkonfirmasi", totalBookings],
          ["Total Mitra", totalMitra],
          ["Total Penyewa", totalUsers],
          [],
          ["Kode Booking", "Tanggal", "Penyewa", "Venue", "Lapangan", "Total (Rp)", "Komisi (Rp)", "Status"],
        ];
        const dataRows = rows.map((b: any) => [
          b.bookingCode,
          b.createdAt ? String(b.createdAt).split("T")[0] : "-",
          b.customerName,
          b.venue?.name || "-",
          b.field?.name || "-",
          b.totalPrice ?? 0,
          b.platformCommission ?? 0,
          b.status,
        ]);
        const csvContent =
          "\uFEFF" +
          [...summaryHeader, ...dataRows].map((r) => r.map(escapeCsv).join(",")).join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `laporan-arenivo-${today}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setExportMessage(`File laporan-arenivo-${today}.csv berhasil diunduh (${rows.length} transaksi).`);
      } else {
        const printWin = window.open("", "_blank", "width=900,height=700");
        if (printWin) {
          const tableRowsHtml = rows
            .slice(0, 100)
            .map(
              (b: any) =>
                `<tr><td>${b.bookingCode || "-"}</td><td>${b.customerName || "-"}</td><td>${b.venue?.name || "-"}</td><td>${formatRupiah(Number(b.totalPrice || 0))}</td><td>${b.status || "-"}</td></tr>`
            )
            .join("");
          printWin.document.write(
            `<!doctype html><html><head><title>Laporan Arenivo ${today}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}th{background:#f1f5f9}</style></head><body><h1>Laporan Platform Arenivo (${today})</h1><p>GMV: ${formatRupiah(gmv)} | Komisi (${commissionPercent}%): ${formatRupiah(platformCommission)} | Booking Aktif/Selesai: ${totalBookings}</p><table><thead><tr><th>Kode</th><th>Penyewa</th><th>Venue</th><th>Total</th><th>Status</th></tr></thead><tbody>${tableRowsHtml || '<tr><td colspan="5">Belum ada transaksi.</td></tr>'}</tbody></table></body></html>`
          );
          printWin.document.close();
          printWin.focus();
          printWin.print();
          setExportMessage("Pratinjau cetak / simpan PDF berhasil dibuka.");
        } else {
          window.print();
          setExportMessage("Dialog cetak PDF halaman dibuka.");
        }
      }
      setTimeout(() => setExportMessage(null), 5000);
    } finally {
      setDownloadingFormat(null);
    }
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
            {formatRupiah(gmv)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>
              {gmvGrowthPercent >= 0 ? `+${gmvGrowthPercent}%` : `${gmvGrowthPercent}%`} vs bulan lalu
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Komisi Platform ({commissionPercent}%)</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2 font-mono tabular-nums">
            {formatRupiah(platformCommission)}
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
            {totalBookings} Pesanan
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-600 font-medium">
            <span>{qrisVaSharePercent}% via QRIS &amp; VA</span>
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
              const heightPercent = item.gmv > 0 ? Math.max(6, Math.round((item.gmv / maxMonthlyGmv) * 100)) : 2;
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
            <span>Rata-rata durasi booking: {avgHoursPerBooking} jam main</span>
            <span className="font-semibold text-slate-700">Tingkat keberhasilan bayar: {paymentSuccessRate}%</span>
          </div>
        </Card>

        {/* Quick System Status Card */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Status Operasional Layanan</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Midtrans Gateway ({serviceHealth.midtransMode})
                </p>
                <p className="text-[11px] text-emerald-700">
                  Integrasi Snap &amp; Webhook aktif
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-950">Slot Lock Engine Aktif</p>
                <p className="text-[11px] text-blue-700">
                  Auto-expire slot {serviceHealth.slotLockMinutes} menit sesuai pengaturan sistem
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-purple-950">AI Chatbot Asisten Aktif</p>
                <p className="text-[11px] text-purple-700">
                  Provider: {serviceHealth.aiProvider} ({serviceHealth.aiModel})
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Komisi Aktif</span>
            <span className="font-mono font-medium text-slate-600">{commissionPercent}% Platform</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
