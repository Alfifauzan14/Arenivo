import * as React from "react";
import { Activity, RefreshCw, Server, Wifi, WifiOff } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function HealthIndicator({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = React.useState<"checking" | "online" | "mock" | "offline">("checking");
  const [latency, setLatency] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const checkConnection = React.useCallback(async () => {
    setStatus("checking");
    const startTime = performance.now();
    try {
      const res = await apiClient.getHealth();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (res.isRealBackend) {
        setStatus("online");
      } else {
        setStatus("mock");
      }
    } catch {
      setStatus("offline");
    }
  }, []);

  React.useEffect(() => {
    checkConnection();
    // Periodic check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full border transition-all shadow-xs select-none",
          compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs",
          status === "online" && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70",
          status === "mock" && "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70",
          status === "offline" && "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70",
          status === "checking" && "bg-slate-50 text-slate-600 border-slate-200"
        )}
        title="Klik untuk melihat detail koneksi backend"
      >
        <span className="relative flex h-2 w-2">
          {status === "online" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              status === "online" && "bg-emerald-500",
              status === "mock" && "bg-amber-500",
              status === "offline" && "bg-rose-500",
              status === "checking" && "bg-slate-400"
            )}
          />
        </span>
        <span className="font-mono tabular-nums">
          {status === "checking" && (compact ? "..." : "Mengecek API...")}
          {status === "online" && (compact ? `API ${latency ? `${latency}ms` : "Online"}` : `API Online (${latency}ms)`)}
          {status === "mock" && (compact ? "Mock" : "Mock Mode (Aktif)")}
          {status === "offline" && (compact ? "Offline" : "API Terputus")}
        </span>
      </button>

      {/* Popover Detail */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-red-600" />
                Status Backend API
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkConnection();
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900"
                title="Cek ulang koneksi"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", status === "checking" && "animate-spin")} />
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Endpoint:</span>
                <span className="font-medium">/api/v1/health</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Koneksi:</span>
                <span
                  className={cn(
                    "font-bold",
                    status === "online" && "text-emerald-600",
                    status === "mock" && "text-amber-600",
                    status === "offline" && "text-rose-600"
                  )}
                >
                  {status === "online" && "Terhubung (Next.js)"}
                  {status === "mock" && "Simulasi UI (Mock)"}
                  {status === "offline" && "Gagal Terhubung"}
                </span>
              </div>
              {latency !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Respon:</span>
                  <span>{latency} ms</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Gunakan Mock Data:</span>
              <button
                onClick={() => {
                  apiClient.setMockMode(!apiClient.isMockMode());
                  checkConnection();
                }}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                  apiClient.isMockMode()
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {apiClient.isMockMode() ? "Aktif (Mock)" : "Nonaktif (Real API)"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
