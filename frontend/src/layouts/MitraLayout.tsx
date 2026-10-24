import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Grid,
  Home,
  LogOut,
  Menu,
  QrCode,
  ShoppingBag,
  Star,
  Tag,
  User,
  X,
  AlertTriangle,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { MOCK_VENUES } from "@/lib/mock-data";
import { MitraVerificationStatus } from "@futsal/shared";

export function MitraLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedVenueId, setSelectedVenueId] = React.useState(MOCK_VENUES[0].id);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("futsal_mitra_authenticated");
    navigate("/jadi-mitra");
  };

  const [verificationStatus] = React.useState<MitraVerificationStatus>(
    MitraVerificationStatus.MENUNGGU
  );

  const selectedVenue =
    MOCK_VENUES.find((v) => v.id === selectedVenueId) || MOCK_VENUES[0];

  const menuSections = [
    {
      title: "MENU UTAMA",
      items: [
        { path: "/mitra", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
        { path: "/mitra/pesanan", label: "Pesanan Masuk", icon: <ShoppingBag className="w-4 h-4" /> },
        { path: "/mitra/scanner", label: "Gate Scanner", icon: <QrCode className="w-4 h-4" /> },
        { path: "/mitra/jadwal", label: "Jadwal & Slot", icon: <Calendar className="w-4 h-4" /> },
        { path: "/mitra/keuangan", label: "Keuangan & Payout", icon: <DollarSign className="w-4 h-4" /> },
      ],
    },
    {
      title: "KELOLA VENUE & AKUN",
      items: [
        { path: "/mitra/venues", label: "Venue & Lapangan", icon: <Grid className="w-4 h-4" /> },
        { path: "/mitra/promos", label: "Promo Venue", icon: <Tag className="w-4 h-4" /> },
        { path: "/mitra/reviews", label: "Ulasan Penyewa", icon: <Star className="w-4 h-4" /> },
        { path: "/mitra/profile", label: "Profil & Rekening", icon: <User className="w-4 h-4" /> },
        {
          path: "/mitra/application",
          label: "Verifikasi Usaha",
          icon: <FileCheck className="w-4 h-4" />,
          badge: verificationStatus === MitraVerificationStatus.MENUNGGU ? "1" : undefined,
        },
      ],
    },
  ];

  const currentMenuLabel =
    menuSections
      .flatMap((s) => s.items)
      .find((m) =>
        m.path === "/mitra"
          ? location.pathname === "/mitra"
          : location.pathname.startsWith(m.path)
      )?.label || "Dashboard";

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-slate-50 text-slate-900 relative font-sans">
      {/* 1. Mobile Topbar */}
      <div className="md:hidden shrink-0 z-30 bg-white border-b border-slate-200 px-4 h-14 pt-safe flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 text-slate-700 hover:bg-slate-100 rounded-lg min-touch-target flex items-center justify-center"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrandLogoIcon size="sm" className="w-6 h-6" />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                Aren<span className="text-red-600">ivo</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase tracking-wider border border-red-200">
                Mitra
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-slate-700 truncate max-w-[130px]">
            {selectedVenue.name}
          </span>
        </div>
      </div>

      {/* 2. Sidebar Desktop & Mobile Drawer (Scroll Container #1: Navigation) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform md:translate-x-0 md:static md:h-screen shrink-0 pt-safe",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <Link to="/mitra" className="flex items-center gap-2.5">
            <BrandLogoIcon size="sm" className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 leading-none tracking-tight">
                  Aren<span className="text-red-600">ivo</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase tracking-wider border border-red-200 leading-none">
                  Mitra
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                Manajemen Arena & Venue
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Venue Selector (Custom Stylized Dropdown) */}
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Venue Aktif
          </label>
          <Select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            options={MOCK_VENUES.map((v) => ({
              value: v.id,
              label: v.name,
            }))}
          />
        </div>

        {/* Independent Scrollable Navigation Menus */}
        <nav className="flex-1 py-4 space-y-5 overflow-y-auto scrollbar-thin">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {section.title}
              </span>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const isActive =
                    item.path === "/mitra"
                      ? location.pathname === "/mitra"
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between pl-5 pr-4 py-2.5 text-xs transition-colors group",
                        isActive
                          ? "bg-red-50 text-red-600 font-semibold border-r-4 border-red-600"
                          : "text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span
                          className={cn(
                            "transition-colors shrink-0",
                            isActive
                              ? "text-red-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums ml-auto shrink-0",
                            isActive ? "text-amber-700" : "text-amber-600"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-1 shrink-0">
          <Link
            to={`/venues/${selectedVenueId}`}
            target="_blank"
            className="md:hidden w-full text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg flex items-center justify-between font-medium transition-colors hover:bg-slate-50"
          >
            <span>Lihat Halaman Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-semibold transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Akun Mitra</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Area (Scroll Container #2: Page Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative z-10">
        {/* Desktop Sticky Header Bar */}
        <header className="hidden md:flex h-16 shrink-0 bg-white border-b border-slate-200 px-6 lg:px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-500">Portal Mitra</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{currentMenuLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                {selectedVenue.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                Aktif
              </span>
            </div>

            <Link
              to={`/venues/${selectedVenueId}`}
              target="_blank"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Lihat di Web</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Verification Notice Banner */}
        {verificationStatus !== MitraVerificationStatus.DISETUJUI && (
          <div
            className={cn(
              "px-4 sm:px-6 lg:px-8 py-2.5 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0",
              verificationStatus === MitraVerificationStatus.MENUNGGU
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {verificationStatus === MitraVerificationStatus.MENUNGGU
                  ? "Verifikasi Usaha: Berkas pendaftaran mitra Anda sedang ditinjau oleh Admin Platform."
                  : "Verifikasi Usaha: Pengajuan kemitraan memerlukan perbaikan berkas legalitas."}
              </span>
            </div>
            <Link
              to="/mitra/application"
              className="font-bold underline shrink-0 hover:opacity-80 text-amber-900"
            >
              Lihat Status Verifikasi →
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* 4. Mobile Bottom Navigation Bar (4 Menu Operasional Kunci Mitra di Lapangan) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 pb-safe shadow-xs">
          <Link
            to="/mitra"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname === "/mitra"
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/mitra/jadwal"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/mitra/jadwal") || location.pathname.startsWith("/mitra/schedule")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Jadwal</span>
          </Link>

          <Link
            to="/mitra/pesanan"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/mitra/pesanan") || location.pathname.startsWith("/mitra/bookings")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            <span>Pesanan</span>
          </Link>

          <Link
            to="/mitra/scanner"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/mitra/scanner")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <QrCode className="w-4 h-4 mb-0.5" />
            <span>Scanner</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MitraLayout;
