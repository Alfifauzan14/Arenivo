import * as React from "react";
import {
  Camera,
  CheckCircle2,
  QrCode,
  Building2,
  XCircle,
  Search,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  TicketScanResultBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
  useToast,
} from "@/components/ui";
import { MOCK_VENUES, MOCK_SCANS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { TicketScanResult } from "@futsal/shared";
import { cn } from "@/lib/utils";

interface ValidationResultState {
  result: TicketScanResult;
  title: string;
  message: string;
  customerName?: string;
  field?: string;
  time?: string;
  scannedAt?: string;
}

export function MitraScannerPage() {
  const { addToast } = useToast();

  const [venues, setVenues] = React.useState<any[]>(MOCK_VENUES);
  const [selectedVenueId, setSelectedVenueId] = React.useState(MOCK_VENUES[0].id);
  const [manualCode, setManualCode] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  // Live Backend Loading for Venues and Check-in History
  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/mitra/venues").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data)) {
        setVenues(res.data);
        setSelectedVenueId(res.data[0].id);
      }
    }).catch(() => {});

    apiClient.get<any[]>("/mitra/check-ins").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setScansHistory(res.data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Default scan result: SAH
  const [scanResult, setScanResult] = React.useState<ValidationResultState | null>(null);

  // Scans history table
  const [scansHistory, setScansHistory] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resultFilter, setResultFilter] = React.useState("semua");

  const selectedVenue =
    venues.find((v) => v.id === selectedVenueId) || venues[0];

  const filteredScans = React.useMemo(() => {
    return scansHistory.filter((s) => {
      if (resultFilter !== "semua" && s.result !== resultFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.scannedCode.toLowerCase().includes(q) ||
          (s.scannedBy || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [scansHistory, resultFilter, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [resultFilter, searchQuery]);

  const paginatedScans = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredScans.slice(start, start + pageSize);
  }, [filteredScans, currentPage]);

  const handleValidateCode = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      addToast("warning", "Masukkan kode tiket terlebih dahulu.", "Kode Kosong");
      return;
    }

    // 1. Coba validasi secara LIVE ke Backend API
    try {
      const res = await apiClient.post<any>("/mitra/tickets/validate", {
        code: clean,
        venueId: selectedVenueId,
      });

      if (res.data) {
        const liveResult = res.data.result as TicketScanResult;
        let title = "TIKET SAH — CHECK-IN BERHASIL";
        let message = "Validasi gate berhasil. Penyewa dipersilakan memasuki area lapangan.";

        if (liveResult === TicketScanResult.SUDAH_DIPAKAI) {
          title = "DITOLAK: TIKET SUDAH DIPAKAI";
          message = "Tiket ini telah dipindai check-in sebelumnya oleh petugas gate.";
        } else if (liveResult === TicketScanResult.SALAH_WAKTU) {
          title = "DITOLAK: DI LUAR JADWAL MAIN";
          message = "Check-in hanya dibuka 30 menit sebelum jam main dimulai hingga jam main selesai.";
        } else if (liveResult === TicketScanResult.SALAH_VENUE) {
          title = "DITOLAK: SALAH LOKASI VENUE";
          message = "Tiket ini terdaftar untuk venue lain, bukan venue ini.";
        } else if (liveResult === TicketScanResult.DIBATALKAN) {
          title = "DITOLAK: PESANAN DIBATALKAN";
          message = "Pesanan ini telah dibatalkan dan tidak lagi berlaku.";
        } else if (liveResult === TicketScanResult.TIDAK_DITEMUKAN) {
          title = "DITOLAK: KODE TIDAK DITEMUKAN";
          message = "Nomor tiket tidak terdaftar dalam sistem database.";
        }

        const liveState: ValidationResultState = {
          result: liveResult,
          title,
          message,
          customerName: res.data.customerName || "Penyewa Lapangan",
          field: res.data.fieldId ? `Lapangan (${res.data.bookingCode || "Booking"})` : "Lapangan",
          time: res.data.playStart ? `${new Date(res.data.playStart).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : undefined,
          scannedAt: res.data.usedAt ? new Date(res.data.usedAt).toLocaleString("id-ID") : undefined,
        };

        setScanResult(liveState);
        const newScan = {
          id: `scn-${Date.now()}`,
          ticketId: clean,
          scannedCode: clean,
          venueId: selectedVenueId,
          scannedBy: "Operator Gate (Live)",
          result: liveResult,
          scannedAt: new Date().toISOString(),
        };
        setScansHistory((prev) => [newScan, ...prev]);
        setCurrentPage(1);

        if (liveResult === TicketScanResult.SAH) {
          addToast("success", "Tiket Sah! Check-in berhasil tercatat di database.", "Check-in Berhasil");
        } else {
          addToast("error", title, "Validasi Ditolak");
        }
        return;
      }
    } catch {
      // Fallback simulasi jika offline atau backend tidak terjangkau
    }

    let resultState: ValidationResultState;

    if (clean.includes("8K2M4Q") || clean === "SAH") {
      resultState = {
        result: TicketScanResult.SAH,
        title: "TIKET SAH — CHECK-IN BERHASIL",
        message: "Validasi gate berhasil. Penyewa dipersilakan memasuki area lapangan.",
        customerName: "Rizky Ramadhan",
        field: "Lapangan A (Vinyl Pro)",
        time: "19:00 – 21:00 WIB (2 Jam)",
      };
    } else if (clean.includes("4L1B8C") || clean === "SUDAH_DIPAKAI") {
      resultState = {
        result: TicketScanResult.SUDAH_DIPAKAI,
        title: "DITOLAK: TIKET SUDAH DIPAKAI",
        message: "Tiket ini telah dipindai check-in sebelumnya oleh petugas gate.",
        customerName: "Bambang Pamungkas",
        field: "Lapangan B (Interlock Elite)",
        time: "16:00 – 18:00 WIB",
        scannedAt: "14 Okt 2026, 15:45 WIB",
      };
    } else if (clean.includes("BELUM_BAYAR") || clean === "BELUM_DIBAYAR") {
      resultState = {
        result: TicketScanResult.BELUM_DIBAYAR,
        title: "DITOLAK: BELUM DIBAYAR",
        message: "Status pemesanan masih menunggu pembayaran dari penyewa.",
        customerName: "Dimas Anggara",
        field: "Lapangan A (Vinyl Pro)",
        time: "20:00 – 21:00 WIB",
      };
    } else if (clean.includes("WAKTU") || clean === "SALAH_WAKTU") {
      resultState = {
        result: TicketScanResult.SALAH_WAKTU,
        title: "DITOLAK: DI LUAR JADWAL MAIN",
        message: "Check-in hanya dibuka 30 menit sebelum jam main dimulai hingga jam main selesai.",
        customerName: "Fajar Nugraha",
        field: "Lapangan A (Vinyl Pro)",
        time: "Besok, 19:00 – 21:00 WIB",
      };
    } else if (clean.includes("VENUE") || clean === "SALAH_VENUE") {
      resultState = {
        result: TicketScanResult.SALAH_VENUE,
        title: "DITOLAK: SALAH LOKASI VENUE",
        message: "Tiket ini terdaftar untuk Champion Mini Soccer Pasteur, bukan venue ini.",
        customerName: "Ahmad Zaki",
        field: "Mini Soccer Lapangan 1",
        time: "19:00 – 21:00 WIB",
      };
    } else if (clean.includes("BATAL") || clean === "DIBATALKAN") {
      resultState = {
        result: TicketScanResult.DIBATALKAN,
        title: "DITOLAK: PESANAN DIBATALKAN",
        message: "Pesanan ini telah dibatalkan dan tidak lagi berlaku.",
        customerName: "Futsal Squad UI",
        field: "Lapangan B (Interlock Elite)",
        time: "19:00 – 21:00 WIB",
      };
    } else {
      resultState = {
        result: TicketScanResult.TIDAK_DITEMUKAN,
        title: "DITOLAK: KODE TIDAK DITEMUKAN",
        message: "Nomor tiket tidak terdaftar dalam sistem. Periksa kembali kode tiket.",
      };
    }

    setScanResult(resultState);

    const newScan = {
      id: `scn-${Date.now()}`,
      ticketId: clean,
      scannedCode: clean,
      venueId: selectedVenueId,
      scannedBy: "Operator Gate",
      result: resultState.result,
      scannedAt: new Date().toISOString(),
    };
    setScansHistory((prev) => [newScan, ...prev]);
    setCurrentPage(1);

    if (resultState.result === TicketScanResult.SAH) {
      addToast("success", "Tiket Sah! Check-in berhasil.", "Check-in Berhasil");
    } else {
      addToast("error", resultState.title, "Validasi Ditolak");
    }
  };

  const scenarioButtons = [
    { code: "SAH", label: "Tiket Sah (Valid)", result: TicketScanResult.SAH, span: true },
    { code: "SUDAH_DIPAKAI", label: "Sudah Dipakai", result: TicketScanResult.SUDAH_DIPAKAI },
    { code: "BELUM_DIBAYAR", label: "Belum Bayar", result: TicketScanResult.BELUM_DIBAYAR },
    { code: "SALAH_WAKTU", label: "Salah Waktu", result: TicketScanResult.SALAH_WAKTU },
    { code: "SALAH_VENUE", label: "Salah Venue", result: TicketScanResult.SALAH_VENUE },
    { code: "DIBATALKAN", label: "Dibatalkan", result: TicketScanResult.DIBATALKAN },
    { code: "TIDAK_ADA", label: "Tidak Ditemukan", result: TicketScanResult.TIDAK_DITEMUKAN },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Page Header & Custom Active Venue Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Gate Scanner & Check-in
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pindai QR e-tiket penyewa di pintu masuk lapangan atau masukkan kode tiket manual.
          </p>
        </div>

        {/* Custom Stylized Venue Selector */}
        <div className="w-full sm:w-80 bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Lokasi Gate Aktif
            </span>
          </div>
          <Select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            options={venues.map((v) => ({
              value: v.id,
              label: `${v.name} (${v.city?.name})`,
            }))}
          />
        </div>
      </div>

      {/* 2. Scanner & High-Contrast Validation Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        <Card className="bg-white border-slate-200">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-row items-center justify-between rounded-t-xl">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-600" />
              Pemindai QR E-Tiket
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kamera Aktif
            </span>
          </CardHeader>

          <div className="relative aspect-video sm:aspect-[16/10] max-h-56 sm:max-h-64 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <div className="w-44 h-44 sm:w-48 sm:h-48 border-2 border-white/60 rounded-2xl relative flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
              <div className="w-full h-0.5 bg-red-500" />
              <span className="absolute bottom-2.5 text-[10px] text-white/80 font-mono">
                Arahkan QR ke Bingkai
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 space-y-4 rounded-b-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Input Kode Tiket Manual
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="TKT-FB-8K2M4Q-9A2"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 h-10 px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 min-w-0 shadow-xs"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleValidateCode(manualCode)}
                  className="h-10 text-xs px-4 sm:px-5 rounded-lg shrink-0"
                >
                  Validasi
                </Button>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-100">
              <Select
                label="Simulasi Uji Status Tiket"
                defaultValue="SAH"
                onChange={(e) => handleValidateCode(e.target.value)}
                options={scenarioButtons.map((item) => ({
                  value: item.code,
                  label: `Uji Status: ${item.label}`,
                }))}
              />
            </div>
          </div>
        </Card>

        <div>
          {scanResult ? (
            <div
              className={cn(
                "p-5 sm:p-6 rounded-xl border transition-all space-y-4 sm:space-y-5 text-white",
                scanResult.result === TicketScanResult.SAH
                  ? "bg-emerald-600 border-emerald-700"
                  : "bg-rose-700 border-rose-800"
              )}
            >
              <div className="flex items-start gap-3">
                {scanResult.result === TicketScanResult.SAH ? (
                  <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-white shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-8 h-8 sm:w-9 sm:h-9 text-white shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/80 uppercase tracking-wider block font-mono">
                    Status Validasi Gate
                  </span>
                  <h2 className="text-base sm:text-xl font-bold leading-snug mt-0.5">
                    {scanResult.title}
                  </h2>
                </div>
              </div>

              <p className="text-xs text-white/95 leading-relaxed bg-black/15 p-3 sm:p-3.5 rounded-lg border border-white/15">
                {scanResult.message}
              </p>

              {scanResult.customerName && (
                <div className="space-y-2 pt-3 border-t border-white/20 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-white/75">Nama Penyewa</span>
                    <span className="font-bold text-white text-xs sm:text-sm truncate">
                      {scanResult.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-white/75">Lapangan</span>
                    <span className="font-semibold text-white truncate">{scanResult.field}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-white/75">Jadwal Bermain</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {scanResult.time}
                    </span>
                  </div>
                  {scanResult.scannedAt && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-white/75">Scan Sebelumnya</span>
                      <span className="font-mono text-white/90 tabular-nums">
                        {scanResult.scannedAt}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card className="p-10 bg-white border-slate-200 text-center space-y-2">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">Siap Memindai Tiket</h3>
              <p className="text-xs text-slate-500">
                Arahkan QR tiket penyewa ke kamera atau masukkan kode manual.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 3. Scan History (Unified Modern Simple Table + Wide Search & Select) */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 space-y-3 rounded-t-xl">
          <div className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Riwayat Pemindaian Hari Ini</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Log pemeriksaan tiket di gate {selectedVenue.name}
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg tabular-nums shrink-0">
              {filteredScans.length} scan
            </span>
          </div>

          {/* Wide Search & Status Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode tiket atau nama petugas gate..."
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
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                options={[
                  { value: "semua", label: `Semua Hasil (${scansHistory.length})` },
                  { value: TicketScanResult.SAH, label: "Sah" },
                  { value: TicketScanResult.SUDAH_DIPAKAI, label: "Terpakai" },
                  { value: TicketScanResult.BELUM_DIBAYAR, label: "Belum Bayar" },
                  { value: TicketScanResult.SALAH_WAKTU, label: "Salah Waktu" },
                  { value: TicketScanResult.SALAH_VENUE, label: "Salah Venue" },
                  { value: TicketScanResult.DIBATALKAN, label: "Batal" },
                  { value: TicketScanResult.TIDAK_DITEMUKAN, label: "Tak Ada" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 */}
          <div className="md:hidden divide-y divide-slate-200">
            {paginatedScans.length > 0 ? (
              paginatedScans.map((scan, idx) => {
                const rowNo = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <div
                    key={scan.id}
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
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {scan.scannedCode}
                        </span>
                      </div>
                      <TicketScanResultBadge result={scan.result} />
                    </div>

                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Waktu</span>
                        <span className="font-medium text-slate-700 tabular-nums">
                          {new Date(scan.scannedAt || Date.now()).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Petugas</span>
                        <span className="font-medium text-slate-800">{scan.scannedBy}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setManualCode(scan.scannedCode);
                          handleValidateCode(scan.scannedCode);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full h-7 text-xs justify-center"
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1" />
                        Validasi Ulang
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                Tidak ada riwayat pemindaian yang sesuai dengan pencarian.
              </div>
            )}
          </div>

          {/* 2. Tampilan Web / Desktop: Tabel Modern Header Merah Soft */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Kode Tiket</TableHead>
                  <TableHead className="text-xs">Waktu Pindai</TableHead>
                  <TableHead className="text-xs">Petugas</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedScans.length > 0 ? (
                  paginatedScans.map((scan, idx) => {
                    const rowNo = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <TableRow key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                          {rowNo}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900 tabular-nums">
                          {scan.scannedCode}
                        </TableCell>
                        <TableCell className="font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {new Date(scan.scannedAt || Date.now()).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {scan.scannedBy}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <TicketScanResultBadge result={scan.result} />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setManualCode(scan.scannedCode);
                              handleValidateCode(scan.scannedCode);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="h-7 px-2.5 text-xs"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1" />
                            Validasi
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada riwayat pemindaian yang sesuai dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredScans.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MitraScannerPage;
