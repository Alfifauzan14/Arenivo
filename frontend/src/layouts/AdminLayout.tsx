import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  CheckSquare,
  Database,
  Home,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Menu,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { cn } from "@/lib/utils";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuSections = [
    {
      title: "RINGKASAN",
      items: [
        { path: "/admin", label: "Dashboard Analitik", icon: <Home className="w-4 h-4" /> },
      ],
    },
    {
      title: "MANAJEMEN PENGGUNA",
      items: [
        {
          path: "/admin/mitra",
          label: "Verifikasi Mitra",
          icon: <CheckSquare className="w-4 h-4" />,
          badge: "1",
        },
        { path: "/admin/users", label: "Pengguna Penyewa", icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: "OPERASIONAL VENUE",
      items: [
        { path: "/admin/venues", label: "Manajemen Venue", icon: <MapPin className="w-4 h-4" /> },
        { path: "/admin/master", label: "Master Data", icon: <Database className="w-4 h-4" /> },
      ],
    },
    {
      title: "KEUANGAN & TRANSAKSI",
      items: [
        { path: "/admin/transactions", label: "Transaksi Midtrans", icon: <Receipt className="w-4 h-4" /> },
        {
          path: "/admin/refunds",
          label: "Penanganan Refund",
          icon: <RotateCcw className="w-4 h-4" />,
          badge: "1",
        },
        {
          path: "/admin/payouts",
          label: "Pencairan Mitra",
          icon: <Wallet className="w-4 h-4" />,
          badge: "1",
        },
      ],
    },
    {
      title: "KONTEN & SISTEM",
      items: [
        { path: "/admin/content", label: "Banner & Konten", icon: <ImageIcon className="w-4 h-4" /> },
        { path: "/admin/settings", label: "Pengaturan Sistem", icon: <Settings className="w-4 h-4" /> },
        { path: "/admin/audit-logs", label: "Audit Log Aktivitas", icon: <Activity className="w-4 h-4" /> },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("futsal_admin_authenticated");
    navigate("/admin/login");
  };

  const currentMenuLabel =
    menuSections
      .flatMap((s) => s.items)
      .find((m) =>
        m.path === "/admin"
          ? location.pathname === "/admin"
          : location.pathname.startsWith(m.path)
      )?.label || "Dashboard";

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans relative">
      <CleanBackgroundPattern variant="subtle" />

      {/* 1. Mobile Topbar (Clean White with notch safe area) */}
      <div className="md:hidden shrink-0 z-30 bg-white text-slate-900 px-4 h-14 pt-safe flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-touch-target flex items-center justify-center"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrandLogoIcon size="sm" className="w-6 h-6" />
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-slate-900">
              <span>Aren<span className="text-red-600">ivo</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border border-slate-200">
                Admin
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold p-1.5 min-touch-target cursor-pointer"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>

      {/* 2. Sidebar Desktop & Tablet (md:w-56 lg:w-64) & Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 md:w-56 lg:w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col transition-transform md:translate-x-0 md:static md:h-screen shrink-0 pt-safe shadow-xs md:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5">
            <BrandLogoIcon size="sm" className="w-8 h-8" />
            <div>
              <div className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                Aren<span className="text-red-600">ivo</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border border-slate-200">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Platform Operator & Audit</span>
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

        {/* Navigation Menus */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider">
                {section.title}
              </span>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const isActive =
                    item.path === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors group",
                        isActive
                          ? "bg-red-50 text-red-600 font-semibold border-r-4 border-red-600 rounded-l-lg rounded-r-none"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={cn(
                            "transition-colors",
                            isActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600"
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
                            isActive ? "text-red-700" : "text-red-600"
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

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-white shrink-0">
          <Link
            to="/"
            target="_blank"
            className="w-full text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg flex items-center justify-between font-medium transition-colors hover:bg-slate-50"
          >
            <span>Web Publik Penyewa</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi Admin</span>
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

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Area Super Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{currentMenuLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time System Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Normal</span>
            </div>

            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Web Publik</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* 4. Mobile Bottom Navigation Bar for Admin */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-20 pb-safe shadow-xs flex items-center justify-around h-16 px-2">
          <Link
            to="/admin"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname === "/admin"
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/mitra"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/admin/mitra")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span>Mitra</span>
          </Link>

          <Link
            to="/admin/transactions"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/admin/transactions")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Receipt className="w-4 h-4 mb-0.5" />
            <span>Transaksi</span>
          </Link>

          <Link
            to="/admin/payouts"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
              location.pathname.startsWith("/admin/payouts")
                ? "text-red-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Wallet className="w-4 h-4 mb-0.5" />
            <span>Payouts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
