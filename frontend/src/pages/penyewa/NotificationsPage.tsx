import * as React from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Calendar,
  Tag,
  Info,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button, Card, Select, useToast } from "@/components/ui";
import {
  MOCK_NOTIFICATIONS,
  type InAppNotification,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<string>("semua");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [notifications, setNotifications] = React.useState<InAppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast("success", "Semua notifikasi telah ditandai sebagai dibaca.", "Notifikasi Dibaca");
  };

  const handleMarkItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filtered = React.useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "unread" && n.isRead) return false;
      if (activeTab !== "semua" && activeTab !== "unread" && n.type !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeTab, searchQuery, notifications]);

  return (
    <div className="min-h-screen">
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Notifikasi Akun</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Pembaruan status pemesanan, tiket, dan informasi diskon promo terbaru.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white shadow-xs transition-all self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tandai Semua Dibaca</span>
            </Button>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Wide Search & Unified Category Select Filter */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul atau isi notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
            />
          </div>

          <div className="w-full sm:w-52 shrink-0">
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              options={[
                { value: "semua", label: `Semua Kategori (${notifications.length})` },
                { value: "unread", label: `Belum Dibaca (${unreadCount})` },
                { value: "booking", label: "Pemesanan" },
                { value: "promo", label: "Promo & Diskon" },
              ]}
            />
          </div>
        </div>

        {/* Notifications List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkItemRead(item.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all flex items-start gap-3.5 shadow-xs hover:border-slate-300 bg-white",
                  !item.isRead ? "border-slate-200 border-l-4 border-l-red-600" : "border-slate-200"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    item.type === "booking"
                      ? "bg-red-100 text-red-600"
                      : item.type === "promo"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  )}
                >
                  {item.type === "booking" ? (
                    <Calendar className="w-4 h-4" />
                  ) : item.type === "promo" ? (
                    <Tag className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-xs font-bold leading-tight",
                        !item.isRead ? "text-slate-900 font-extrabold" : "text-slate-700"
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {item.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  {item.linkUrl && (
                    <div className="pt-1.5">
                      <Link
                        to={item.linkUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Lihat Rincian
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {!item.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Tidak ada notifikasi</h3>
            <p className="text-xs text-slate-500">
              Belum ada informasi baru dalam kategori ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
