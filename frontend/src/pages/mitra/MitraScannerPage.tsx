import * as React from "react";
import {
  Camera,
  CheckCircle2,
  QrCode,
  Building2,
  XCircle,
  Search,
  X,
  Video,
  VideoOff,
  SwitchCamera,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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
import { apiClient } from "@/lib/api-client";
import { TicketScanResult } from "@futsal/shared";
import { cn } from "@/lib/utils";
import { Html5Qrcode } from "html5-qrcode";

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

  const [venues, setVenues] = React.useState<any[]>([]);
  const [selectedVenueId, setSelectedVenueId] = React.useState("");
  const [manualCode, setManualCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  // Kamera Live States
  const [isCameraRunning, setIsCameraRunning] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = React.useState<Array<{ id: string; label: string }>>([]);
  const [facingMode, setFacingMode] = React.useState<"environment" | "user">("environment");
  const [selectedCameraId, setSelectedCameraId] = React.useState<string>("");
  const [isSwitchingCamera, setIsSwitchingCamera] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showDemoPresets, setShowDemoPresets] = React.useState(false);

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const lastScannedRef = React.useRef<{ code: string; time: number }>({ code: "", time: 0 });

  // Sound Beep sintetis Web Audio API
  const playBeep = React.useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Muat data venue & riwayat check-in dari database backend
  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get<any[]>("/mitra/venues")
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setVenues(res.data);
          setSelectedVenueId(res.data[0].id);
        }
      })
      .catch(() => {});

    apiClient
      .get<any[]>("/mitra/check-ins")
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setScansHistory(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Hasil Validasi
  const [scanResult, setScanResult] = React.useState<ValidationResultState | null>(null);

  // Riwayat scan
  const [scansHistory, setScansHistory] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resultFilter, setResultFilter] = React.useState("semua");

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  // Inisialisasi daftar kamera perangkat (tidak memaksa selectedCameraId agar facingMode mobile bekerja)
  React.useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
        }
      })
      .catch(() => {});
  }, []);

  // Hentikan scanner saat halaman di-unmount
  React.useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Fungsi Mulai Kamera Live (mendukung kamera belakang & depan di HP maupun webcam)
  const startLiveCamera = async (opts?: { mode?: "environment" | "user"; cameraId?: string }) => {
    const targetMode = opts?.mode ?? facingMode;
    const explicitId = opts?.cameraId;
    try {
      setCameraError(null);
      setIsSwitchingCamera(true);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop().catch(() => {});
        }
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        // Beri jeda singkat agar hardware kamera HP melepas stream sebelum switch
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const scanner = new Html5Qrcode("qr-reader-target");
      scannerRef.current = scanner;

      const scanConfig = {
        fps: 12,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.min(280, Math.max(170, Math.floor(minEdge * 0.68)));
          return { width: edge, height: edge };
        },
        disableFlip: false,
      };

      const onDecoded = (decodedText: string) => {
        onQrCodeDetected(decodedText);
      };
      const onMiss = () => {
        // ignore per-frame miss
      };

      if (explicitId) {
        await scanner.start(explicitId, scanConfig, onDecoded, onMiss);
        setSelectedCameraId(explicitId);
      } else {
        try {
          await scanner.start({ facingMode: { exact: targetMode } }, scanConfig, onDecoded, onMiss);
        } catch {
          // Fallback: cari device label yang cocok atau gunakan soft facingMode (misal di desktop / beberapa HP)
          const refreshed = await Html5Qrcode.getCameras().catch(() => []);
          const pattern =
            targetMode === "user"
              ? /front|user|depan|selfie|facetime/i
              : /back|rear|belakang|environment|main/i;
          const matchedCam = refreshed.find((d) => pattern.test(d.label || ""));
          if (matchedCam) {
            await scanner.start(matchedCam.id, scanConfig, onDecoded, onMiss);
            setSelectedCameraId(matchedCam.id);
          } else {
            await scanner.start({ facingMode: targetMode }, scanConfig, onDecoded, onMiss);
            setSelectedCameraId("");
          }
        }
        setFacingMode(targetMode);
      }

      // Muat ulang daftar kamera setelah izin diberikan agar semua lensa terbaca
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
          }
        })
        .catch(() => {});

      setIsCameraRunning(true);
      addToast(
        "info",
        `Kamera ${targetMode === "user" ? "depan" : "belakang"} aktif. Arahkan ke QR e-tiket.`,
        "Kamera Siap"
      );
    } catch (err: any) {
      console.warn("Gagal membuka kamera:", err);
      setIsCameraRunning(false);
      setCameraError(
        err?.message ||
          "Izin kamera ditolak browser atau kamera tidak tersedia. Pastikan izin kamera aktif dan coba mode kamera lain."
      );
      addToast("error", "Gagal mengaktifkan kamera pemindai. Cek izin kamera browser Anda.", "Kamera Tidak Terbuka");
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    setSelectedCameraId("");
    if (isCameraRunning) {
      void startLiveCamera({ mode: nextMode });
    }
  };

  // Fungsi Hentikan Kamera
  const stopLiveCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Gagal stop kamera:", err);
      }
      setIsCameraRunning(false);
      addToast("info", "Kamera pemindai telah dinonaktifkan.", "Kamera Berhenti");
    }
  };

  // Callback saat QR Code berhasil terdeteksi kamera
  const onQrCodeDetected = (decodedText: string) => {
    const now = Date.now();
    // Cegah multi-scan kode yang sama dalam selang 3 detik
    if (lastScannedRef.current.code === decodedText && now - lastScannedRef.current.time < 3000) {
      return;
    }
    lastScannedRef.current = { code: decodedText, time: now };

    playBeep();

    let clean = decodedText.trim();
    if (clean.includes("/tiket/")) {
      clean = clean.split("/tiket/")[1].split("?")[0].split("/")[0];
    } else if (clean.includes("/pesanan/")) {
      clean = clean.split("/pesanan/")[1].split("?")[0].split("/")[0];
    }

    setManualCode(clean);
    handleValidateCode(clean);
  };

  // Validasi kode tiket ke Database Backend Supabase
  const handleValidateCode = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      addToast("warning", "Masukkan kode tiket terlebih dahulu.", "Kode Kosong");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiClient.post<any>("/mitra/tickets/validate", {
        code: clean,
        venueId: selectedVenueId,
      });

      if (res.data) {
        const liveResult = (res.data.result || "SAH") as TicketScanResult;
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
        } else if (liveResult === TicketScanResult.BELUM_DIBAYAR) {
          title = "DITOLAK: BELUM DIBAYAR";
          message = "Status pemesanan masih menunggu pembayaran dan belum sah.";
        }

        const liveState: ValidationResultState = {
          result: liveResult,
          title,
          message,
          customerName: res.data.customerName || res.data.customer_name || "Penyewa Lapangan",
          field: res.data.fieldName || res.data.field_name || (res.data.fieldId ? `Lapangan (${res.data.bookingCode || "Booking"})` : "Lapangan"),
          time: res.data.playStart ? `${new Date(res.data.playStart).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : undefined,
          scannedAt: res.data.usedAt || res.data.scannedAt ? new Date(res.data.usedAt || res.data.scannedAt).toLocaleString("id-ID") : new Date().toLocaleString("id-ID"),
        };

        setScanResult(liveState);
        apiClient
          .get<any[]>("/mitra/check-ins")
          .then((histRes) => {
            if (histRes.data && Array.isArray(histRes.data)) {
              setScansHistory(histRes.data);
            }
          })
          .catch(() => {});
        setCurrentPage(1);

        if (liveResult === TicketScanResult.SAH) {
          addToast("success", "Tiket Sah! Check-in berhasil tercatat di database.", "Check-in Berhasil");
        } else {
          addToast("error", title, "Validasi Ditolak");
        }
        return;
      }
    } catch (err: any) {
      // Fallback offline / database notice
      const errorMsg = err?.message || "Gagal menghubungi server validasi.";
      addToast("error", errorMsg, "Gagal Memvalidasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredScans = React.useMemo(() => {
    return scansHistory.filter((s) => {
      if (resultFilter !== "semua" && s.result !== resultFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.scannedCode.toLowerCase().includes(q) ||
          (s.scanner?.fullName || s.scanner?.email || s.scannedBy || "").toLowerCase().includes(q)
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

  const demoScenarios = [
    { code: "FB-E51AB7", label: "Tiket Booking Riil (DB)", desc: "Tiket real dari transaksi selesai di database" },
    { code: "TKT-FB-8K2M4Q-9A2", label: "Format Standar E-Tiket", desc: "Format barcode QR e-tiket Arenivo" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Page Header & Active Venue Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Gate Scanner & Check-in
            <span className="text-[10px] uppercase font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Engine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pindai QR e-tiket penyewa secara langsung menggunakan kamera perangkat atau input nomor tiket.
          </p>
        </div>

        {/* Venue Selector */}
        <div className="w-full sm:w-80 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Lokasi Gate Aktif
            </span>
          </div>
          <Select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            options={
              venues.length > 0
                ? venues.map((v) => ({
                    value: v.id,
                    label: `${v.name} (${v.city?.name || "Venue"})`,
                  }))
                : [{ value: "", label: "Memuat venue..." }]
            }
          />
        </div>
      </div>

      {/* 2. Scanner & Validation Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* Card Pemindai Kamera Live */}
        <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-600" />
              Pemindai QR Kamera Perangkat
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title={soundEnabled ? "Bunyi bip aktif" : "Bunyi bip nonaktif"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border",
                  isCameraRunning
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isCameraRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  )}
                />
                {isCameraRunning ? "Kamera Live" : "Kamera Nonaktif"}
              </span>
            </div>
          </CardHeader>

          {/* Area Kamera Viewfinder */}
          <div className="relative w-full min-h-[290px] sm:min-h-[320px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Target element untuk html5-qrcode */}
            <div
              id="qr-reader-target"
              className={cn(
                "w-full",
                facingMode === "user" && "scanner-mirror",
                !isCameraRunning && "hidden"
              )}
            />

            {/* Overlay saat kamera mati atau error */}
            {!isCameraRunning && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3.5 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 border border-white/10 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Kamera Siap Dijalankan</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs">
                    Pilih kamera belakang atau depan lalu mulai memindai QR e-tiket penyewa.
                  </p>
                </div>
                <div className="inline-flex rounded-lg bg-white/10 p-1 border border-white/15 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setFacingMode("environment");
                      setSelectedCameraId("");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md transition-colors cursor-pointer",
                      facingMode === "environment"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    Kamera Belakang
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFacingMode("user");
                      setSelectedCameraId("");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md transition-colors cursor-pointer",
                      facingMode === "user"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    Kamera Depan
                  </button>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isSwitchingCamera}
                  onClick={() => void startLiveCamera({ mode: facingMode })}
                  className="rounded-lg text-xs px-4 h-9 shadow-md"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5" />
                  {isSwitchingCamera
                    ? "Membuka Kamera..."
                    : `Mulai ${facingMode === "user" ? "Kamera Depan" : "Kamera Belakang"}`}
                </Button>
              </div>
            )}

            {/* Error Message jika Izin Ditolak */}
            {cameraError && (
              <div className="absolute inset-x-3 bottom-3 bg-red-950/90 border border-red-500/40 p-2.5 rounded-lg text-white text-[11px] flex items-start gap-2 z-20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block">Gagal Akses Kamera:</span>
                  <span className="text-white/80 leading-tight">{cameraError}</span>
                </div>
              </div>
            )}

            {/* Petunjuk halus saat kamera berjalan tanpa menduplikasi kotak scan html5-qrcode */}
            {isCameraRunning && (
              <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center z-10">
                <span className="text-[11px] text-white/95 font-medium bg-black/65 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  Arahkan QR e-tiket ke dalam kotak pemindai
                </span>
              </div>
            )}
          </div>

          {/* Bar Kontrol Kamera Aktif */}
          {isCameraRunning && (
            <div className="px-3.5 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-white text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSwitchingCamera}
                  onClick={handleToggleFacingMode}
                  className="h-8 text-[11px] px-2.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <SwitchCamera className="w-3.5 h-3.5 mr-1.5" />
                  {isSwitchingCamera
                    ? "Mengganti..."
                    : facingMode === "environment"
                    ? "Pakai Kamera Depan"
                    : "Pakai Kamera Belakang"}
                </Button>
                {availableCameras.length > 2 && (
                  <select
                    aria-label="Pilih lensa kamera"
                    value={selectedCameraId}
                    disabled={isSwitchingCamera}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        void startLiveCamera({ cameraId: val });
                      }
                    }}
                    className="h-8 text-[11px] px-2 rounded-md bg-white/10 text-white border border-white/20 outline-none max-w-[140px] truncate"
                  >
                    <option value="" className="text-slate-900">
                      Auto ({facingMode === "user" ? "Depan" : "Belakang"})
                    </option>
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.id} value={cam.id} className="text-slate-900">
                        {cam.label || `Lensa ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopLiveCamera}
                className="h-8 text-[11px] px-2.5 bg-red-600/20 text-red-300 border-red-500/40 hover:bg-red-600/30"
              >
                <VideoOff className="w-3.5 h-3.5 mr-1" />
                Matikan Kamera
              </Button>
            </div>
          )}

          {/* Form Input Manual Kode Tiket */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Input Kode E-Tiket Manual
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: TKT-FB-8K2M4Q atau FB-E51AB7"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleValidateCode(manualCode);
                    }
                  }}
                  className="flex-1 h-10 px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 min-w-0 shadow-xs"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleValidateCode(manualCode)}
                  className="h-10 text-xs px-4 sm:px-5 rounded-lg shrink-0"
                >
                  {isSubmitting ? "Memeriksa..." : "Validasi"}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Gunakan input manual jika layar ponsel penyewa redup atau kamera tidak dapat fokus.
              </p>
            </div>

            {/* Opsi Uji Cepat (Untuk Pengujian & Presentasi Guru) */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoPresets((prev) => !prev)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Kode Contoh Pengujian (Demo Guru)
                </span>
                {showDemoPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemoPresets && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                  {demoScenarios.map((demo) => (
                    <button
                      key={demo.code}
                      type="button"
                      onClick={() => {
                        setManualCode(demo.code);
                        handleValidateCode(demo.code);
                      }}
                      className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50/40 transition-colors"
                    >
                      <div className="font-mono font-bold text-xs text-slate-900">{demo.code}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{demo.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card Hasil Validasi High-Contrast */}
        <div>
          {scanResult ? (
            <div
              className={cn(
                "p-5 sm:p-6 rounded-xl border transition-all space-y-4 sm:space-y-5 text-white shadow-sm",
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
                    Status Validasi Gate (Database Live)
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
                  {scanResult.time && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-white/75">Jadwal Bermain</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {scanResult.time}
                      </span>
                    </div>
                  )}
                  {scanResult.scannedAt && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-white/75">Waktu Pindai</span>
                      <span className="font-mono text-white/90 tabular-nums">
                        {scanResult.scannedAt}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card className="p-10 bg-white border-slate-200 text-center space-y-2 shadow-xs">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">Siap Memindai E-Tiket</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Nyalakan kamera di sebelah kiri untuk memindai QR code e-tiket penyewa atau masukkan kode tiket secara manual.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 3. Riwayat Pemindaian */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 space-y-3 rounded-t-xl bg-slate-50/30">
          <div className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Riwayat Pemindaian Lapangan</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Catatan check-in tiket di {selectedVenue?.name || "Venue Anda"}
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg tabular-nums shrink-0">
              {filteredScans.length} scan
            </span>
          </div>

          {/* Search & Status Filter */}
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
          {/* Tampilan Mobile / Android */}
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
                        <span className="font-medium text-slate-800">
                          {scan.scanner?.fullName || scan.scanner?.email || scan.scannedBy || "Petugas"}
                        </span>
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

          {/* Tampilan Desktop */}
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
                          {scan.scanner?.fullName || scan.scanner?.email || scan.scannedBy || "Petugas"}
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
