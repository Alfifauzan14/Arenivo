import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Star,
  Search,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  Button,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Modal,
  TablePagination,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { LoadingSkeleton, ErrorState } from "@/components/common/LoadingStates";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { formatRupiah, formatDateIndo, type Banner, type Promo } from "@futsal/shared";

interface ReviewRow {
  id: string;
  bookingId: string;
  userId: string;
  venueId: string;
  rating: number;
  comment: string;
  reply: string | null;
  isVisible: boolean;
  createdAt?: string;
  user?: { fullName: string; avatarUrl: string | null } | null;
  venue?: { name: string } | null;
}

export function AdminContentPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(() =>
    location.pathname.endsWith("/reviews") ? "reviews" : "banners"
  );

  React.useEffect(() => {
    if (location.pathname.endsWith("/reviews")) {
      setActiveTab("reviews");
    }
  }, [location.pathname]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [promoPage, setPromoPage] = React.useState(1);
  const [reviewPage, setReviewPage] = React.useState(1);
  const pageSize = 8;

  // Data states
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals
  const [bannerModalOpen, setBannerModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = React.useState("");
  const [bannerImageUrl, setBannerImageUrl] = React.useState("");
  const [bannerLinkUrl, setBannerLinkUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [promoModalOpen, setPromoModalOpen] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState<Promo | null>(null);
  const [promoCode, setPromoCode] = React.useState("");
  const [promoType, setPromoType] = React.useState<"fixed" | "percent">("fixed");
  const [promoValue, setPromoValue] = React.useState(25000);
  const [promoMaxDiscount, setPromoMaxDiscount] = React.useState<number | null>(null);
  const [promoMinSpend, setPromoMinSpend] = React.useState(100000);
  const [promoQuota, setPromoQuota] = React.useState(100);
  const [promoEndDate, setPromoEndDate] = React.useState("");

  // FAQ state
  const [faqItems, setFaqItems] = React.useState<{ question: string; answers: string[] }[]>([]);
  const [faqSaving, setFaqSaving] = React.useState(false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ====== FETCH DATA ON LOAD ======
  const fetchBanners = React.useCallback(async () => {
    try {
      const res = await apiClient.get<Banner[]>("/admin/banners");
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.data?.error?.message || "Gagal memuat banner.");
    }
  }, []);

  const fetchPromos = React.useCallback(async () => {
    try {
      const res = await apiClient.get<Promo[]>("/admin/promos");
      setPromos(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.data?.error?.message || "Gagal memuat promo.");
    }
  }, []);

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await apiClient.get<{ rows: ReviewRow[]; total: number }>(
        "/admin/reviews",
        searchQuery ? { q: searchQuery } : undefined
      );
      // Backend returns { rows, total } or array
      if (Array.isArray(res.data)) {
        setReviews(res.data as any);
      } else if (res.data && (res.data as any).rows) {
        setReviews((res.data as any).rows);
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      setError(err?.data?.error?.message || "Gagal memuat ulasan.");
    }
  }, [searchQuery]);

  const fetchFaq = React.useCallback(async () => {
    try {
      const res = await apiClient.get<{ faq?: { question: string; answers: string[] }[] }>(
        "/settings"
      );
      if (res.data?.faq && Array.isArray(res.data.faq)) {
        setFaqItems(res.data.faq);
      }
    } catch {
      // FAQ not yet set — that's ok
    }
  }, []);

  // Load all data on mount
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([fetchBanners(), fetchPromos(), fetchReviews(), fetchFaq()]).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch reviews when search changes
  React.useEffect(() => {
    if (activeTab === "reviews" && searchQuery !== undefined) {
      const t = setTimeout(() => fetchReviews(), 300);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab]);

  // ====== BANNER ACTIONS ======
  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setBannerTitle("");
    setBannerImageUrl("");
    setBannerLinkUrl("/venues");
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerTitle(b.title);
    setBannerImageUrl(b.imageUrl);
    setBannerLinkUrl(b.linkUrl || "/venues");
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      showToast("Judul dan gambar banner wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        await apiClient.patch<Banner>("/admin/banners", {
          id: editingBanner.id,
          title: bannerTitle.trim(),
          imageUrl: bannerImageUrl.trim(),
          linkUrl: bannerLinkUrl.trim() || null,
        });
        showToast(`Banner "${bannerTitle}" berhasil diperbarui.`);
      } else {
        await apiClient.post<Banner>("/admin/banners", {
          title: bannerTitle.trim(),
          imageUrl: bannerImageUrl.trim(),
          linkUrl: bannerLinkUrl.trim() || null,
          sortOrder: banners.length,
          isActive: true,
        });
        showToast(`Banner baru "${bannerTitle}" berhasil ditambahkan.`);
      }
      setBannerModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      showToast(err?.data?.error?.message || "Gagal menyimpan banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBannerActive = async (bannerId: string, current: boolean) => {
    // Optimistic
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, isActive: !current } : b))
    );
    try {
      await apiClient.patch("/admin/banners", { id: bannerId, isActive: !current });
      showToast("Status tayang banner berhasil diubah.");
    } catch {
      // Revert
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, isActive: current } : b))
      );
      showToast("Gagal mengubah status banner.");
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Hapus banner ini secara permanen? Tindakan tidak bisa dibatalkan.")) return;
    try {
      await apiClient.delete(`/admin/banners?id=${encodeURIComponent(bannerId)}`);
      showToast("Banner berhasil dihapus permanen.");
      await fetchBanners();
    } catch (err: any) {
      showToast(err?.data?.error?.message || "Gagal menghapus banner.");
      await fetchBanners();
    }
  };

  // ====== PROMO ACTIONS ======
  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoCode("");
    setPromoType("percent");
    setPromoValue(10);
    setPromoMaxDiscount(25000);
    setPromoMinSpend(100000);
    setPromoQuota(100);
    // Default end date: 30 days from now
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setPromoEndDate(d.toISOString().slice(0, 16));
    setPromoModalOpen(true);
  };

  const handleOpenEditPromo = (p: Promo) => {
    setEditingPromo(p);
    setPromoCode(p.code);
    setPromoType(p.discountType);
    setPromoValue(p.discountValue);
    setPromoMaxDiscount(p.maxDiscount ?? null);
    setPromoMinSpend(p.minSpend);
    setPromoQuota(p.quota);
    setPromoEndDate(p.endDate ? new Date(p.endDate).toISOString().slice(0, 16) : "");
    setPromoModalOpen(true);
  };

  const handleSavePromo = async () => {
    if (!promoCode.trim()) {
      showToast("Kode promo wajib diisi.");
      return;
    }
    if (!promoEndDate) {
      showToast("Tanggal berakhir promo wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (editingPromo) {
        await apiClient.patch<Promo>("/admin/promos", {
          id: editingPromo.id,
          code: promoCode.trim().toUpperCase(),
          discountType: promoType,
          discountValue: promoValue,
          maxDiscount: promoMaxDiscount,
          minSpend: promoMinSpend,
          quota: promoQuota,
          endDate: new Date(promoEndDate).toISOString(),
        });
        showToast(`Kode Promo ${promoCode.toUpperCase()} berhasil diperbarui.`);
      } else {
        await apiClient.post<Promo>("/admin/promos", {
          code: promoCode.trim().toUpperCase(),
          discountType: promoType,
          discountValue: promoValue,
          maxDiscount: promoMaxDiscount,
          minSpend: promoMinSpend,
          quota: promoQuota,
          endDate: new Date(promoEndDate).toISOString(),
        });
        showToast(`Kode Promo ${promoCode.toUpperCase()} berhasil dibuat.`);
      }
      setPromoModalOpen(false);
      await fetchPromos();
    } catch (err: any) {
      showToast(err?.data?.error?.message || "Gagal menyimpan promo.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePromoActive = async (promoId: string, current: boolean) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, isActive: !current } : p))
    );
    try {
      await apiClient.patch("/admin/promos", { id: promoId, isActive: !current });
      showToast("Status keaktifan promo berhasil diubah.");
    } catch {
      setPromos((prev) =>
        prev.map((p) => (p.id === promoId ? { ...p, isActive: current } : p))
      );
      showToast("Gagal mengubah status promo.");
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Nonaktifkan promo ini?")) return;
    setPromos((prev) => prev.filter((p) => p.id !== promoId));
    try {
      await apiClient.patch("/admin/promos", { id: promoId, isActive: false });
      showToast("Promo berhasil dinonaktifkan.");
      await fetchPromos();
    } catch {
      showToast("Gagal menonaktifkan promo.");
      await fetchPromos();
    }
  };

  // ====== REVIEW MODERATION ======
  const handleToggleReviewVisibility = async (reviewId: string, current: boolean) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isVisible: !current } : r))
    );
    try {
      await apiClient.patch(`/admin/reviews/${reviewId}/status`, {
        isVisible: !current,
      });
      showToast(
        !current
          ? "Ulasan sekarang ditampilkan ke publik."
          : "Ulasan berhasil disembunyikan dari publik."
      );
    } catch {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isVisible: current } : r))
      );
      showToast("Gagal mengubah status ulasan.");
    }
  };

  const getVenueName = (venueId: string) => {
    const r = reviews.find((rv) => rv.venueId === venueId);
    return r?.venue?.name || "Venue Olahraga";
  };

  // ====== FILTERED DATA ======
  const filteredBanners = React.useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const q = searchQuery.toLowerCase();
    return banners.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.linkUrl && b.linkUrl.toLowerCase().includes(q))
    );
  }, [banners, searchQuery]);

  const filteredPromos = React.useMemo(() => {
    if (!searchQuery.trim()) return promos;
    const q = searchQuery.toLowerCase();
    return promos.filter((p) => p.code.toLowerCase().includes(q));
  }, [promos, searchQuery]);

  const filteredReviews = React.useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        (r.user?.fullName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q) ||
        getVenueName(r.venueId).toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && banners.length === 0 && promos.length === 0 && reviews.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          Promise.all([fetchBanners(), fetchPromos(), fetchReviews()]).finally(() =>
            setLoading(false)
          );
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Konten
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola banner promo, kode diskon, dan moderasi ulasan penyewa
          </p>
        </div>

        {activeTab === "banners" && (
          <Button
            size="sm"
            onClick={handleOpenCreateBanner}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Banner
          </Button>
        )}

        {activeTab === "promos" && (
          <Button
            size="sm"
            onClick={handleOpenCreatePromo}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Promo
          </Button>
        )}
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

      {/* Main Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  activeTab === "banners"
                    ? "Cari judul banner atau tautan..."
                    : activeTab === "promos"
                    ? "Cari kode promo..."
                    : activeTab === "faqs"
                    ? "Cari pertanyaan atau jawaban FAQ..."
                    : "Cari nama penyewa, ulasan, atau venue..."
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPromoPage(1);
                  setReviewPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPromoPage(1);
                    setReviewPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setSearchQuery("");
                  setPromoPage(1);
                  setReviewPage(1);
                }}
                options={[
                  { value: "banners", label: `Banner Promo (${banners.length})` },
                  { value: "promos", label: `Kode Promo (${promos.length})` },
                  { value: "reviews", label: `Moderasi Ulasan (${reviews.length})` },
                  { value: "faq", label: `FAQ (${faqItems.length})` },
                ]}
              />
            </div>
          </div>
        </div>

        {/* BANNERS TAB */}
        {activeTab === "banners" && (
          <div className="p-4 sm:p-5">
            {filteredBanners.length === 0 ? (
              <div className="py-12 text-center">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? "Tidak ada banner yang sesuai pencarian."
                    : "Belum ada banner. Klik \"Tambah Banner\" untuk membuat."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBanners.map((b) => (
                  <div
                    key={b.id}
                    className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs group flex flex-col"
                  >
                    <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={b.isActive ? "success" : "default"}>
                          {b.isActive ? "TAYANG" : "NONAKTIF"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-2">
                          {b.title}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 block truncate mt-1">
                          → {b.linkUrl || "/venues"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleBannerActive(b.id, b.isActive)}
                          className="h-7 text-xs px-2"
                        >
                          {b.isActive ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Sembunyikan
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Tayangkan
                            </>
                          )}
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditBanner(b)}
                            className="h-7 text-xs px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteBanner(b.id)}
                            className="h-7 text-xs px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROMOS TAB */}
        {activeTab === "promos" && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kode Promo</TableHead>
                  <TableHead className="text-xs">Nilai Diskon</TableHead>
                  <TableHead className="text-xs">Min. Belanja</TableHead>
                  <TableHead className="text-xs text-center">Kuota Terpakai</TableHead>
                  <TableHead className="text-xs">Berakhir</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-400">
                      {searchQuery
                        ? "Tidak ada promo yang cocok."
                        : "Belum ada promo. Klik \"Tambah Promo\" untuk membuat."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromos
                    .slice((promoPage - 1) * pageSize, promoPage * pageSize)
                    .map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell>
                          <span className="font-mono font-bold text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            {p.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-900">
                          {p.discountType === "fixed"
                            ? formatRupiah(p.discountValue)
                            : `${p.discountValue}% (Maks. ${formatRupiah(p.maxDiscount || 0)})`}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600">
                          {formatRupiah(p.minSpend)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {p.usedCount} / {p.quota === 0 ? "∞" : p.quota}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {p.endDate ? formatDateIndo(p.endDate) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.isActive ? "success" : "default"}>
                            {p.isActive ? "AKTIF" : "NONAKTIF"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePromoActive(p.id, p.isActive)}
                            className="h-7 text-xs px-2"
                          >
                            {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditPromo(p)}
                            className="h-7 text-xs px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeletePromo(p.id)}
                            className="h-7 text-xs px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            {filteredPromos.length > pageSize && (
              <TablePagination
                currentPage={promoPage}
                totalItems={filteredPromos.length}
                pageSize={pageSize}
                onPageChange={setPromoPage}
              />
            )}
          </>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Penyewa & Venue</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Komentar</TableHead>
                  <TableHead className="text-xs">Balasan Mitra</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Moderasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                      {searchQuery
                        ? "Tidak ada ulasan yang cocok."
                        : "Belum ada ulasan dari penyewa."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews
                    .slice((reviewPage - 1) * pageSize, reviewPage * pageSize)
                    .map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell>
                          <span className="font-bold text-xs text-slate-900 block">
                            {r.user?.fullName || "Penyewa"}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[160px]">
                            {r.venue?.name || "Venue"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-bold text-xs text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{r.rating}.0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-700 leading-relaxed max-w-sm line-clamp-3">
                            {r.comment}
                          </p>
                        </TableCell>
                        <TableCell>
                          {r.reply ? (
                            <p className="text-[11px] text-slate-500 italic max-w-xs line-clamp-2">
                              "{r.reply}"
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400">Belum dibalas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.isVisible ? "success" : "danger"}>
                            {r.isVisible ? "DITAMPILKAN" : "DISEMBUNYIKAN"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={r.isVisible ? "danger" : "outline"}
                            size="sm"
                            onClick={() =>
                              handleToggleReviewVisibility(r.id, r.isVisible)
                            }
                            className="h-7 text-xs px-2.5"
                          >
                            {r.isVisible ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                Sembunyikan
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Tampilkan
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            {filteredReviews.length > pageSize && (
              <TablePagination
                currentPage={reviewPage}
                totalItems={filteredReviews.length}
                pageSize={pageSize}
                onPageChange={setReviewPage}
              />
            )}
          </>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Daftar pertanyaan yang tampil di halaman Beranda penyewa. Edit atau tambah FAQ
                baru, lalu klik "Simpan FAQ".
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFaqItems((prev) => [...prev, { question: "", answers: [""] }])
                }
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah FAQ
              </Button>
            </div>

            {faqItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada FAQ. Klik "Tambah FAQ" untuk membuat pertanyaan baru.
              </div>
            ) : (
              faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-1.5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const next = [...faqItems];
                        next[idx] = { ...next[idx], question: e.target.value };
                        setFaqItems(next);
                      }}
                      placeholder="Pertanyaan FAQ..."
                      className="flex-1 h-9 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setFaqItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="h-9 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2 pl-7">
                    {item.answers.map((ans, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2">
                        <span className="text-[11px] text-slate-400 mt-1.5">•</span>
                        <textarea
                          value={ans}
                          onChange={(e) => {
                            const next = [...faqItems];
                            const newAnswers = [...next[idx].answers];
                            newAnswers[aIdx] = e.target.value;
                            next[idx] = { ...next[idx], answers: newAnswers };
                            setFaqItems(next);
                          }}
                          placeholder="Jawaban..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 resize-none"
                        />
                        {item.answers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...faqItems];
                              next[idx] = {
                                ...next[idx],
                                answers: next[idx].answers.filter((_, i) => i !== aIdx),
                              };
                              setFaqItems(next);
                            }}
                            className="text-slate-400 hover:text-red-600 mt-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...faqItems];
                        next[idx] = {
                          ...next[idx],
                          answers: [...next[idx].answers, ""],
                        };
                        setFaqItems(next);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium ml-4"
                    >
                      + Tambah jawaban
                    </button>
                  </div>
                </div>
              ))
            )}

            {faqItems.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={async () => {
                    setFaqSaving(true);
                    try {
                      await apiClient.patch("/admin/settings", { faq: faqItems });
                      showToast("FAQ berhasil disimpan dan langsung tampil di Beranda.");
                    } catch (err: any) {
                      showToast(err?.data?.error?.message || "Gagal menyimpan FAQ.");
                    } finally {
                      setFaqSaving(false);
                    }
                  }}
                  disabled={faqSaving}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  {faqSaving ? "Menyimpan..." : "Simpan FAQ"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* BANNER MODAL */}
      {bannerModalOpen && (
        <Modal
          isOpen={bannerModalOpen}
          onClose={() => setBannerModalOpen(false)}
          title={editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Judul Banner</label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Contoh: Promo Main Malam Diskon 25%"
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <ImageUploadInput
              value={bannerImageUrl}
              onChange={setBannerImageUrl}
              label="Gambar Banner (Rasio 16:9)"
              bucket="venue-photos"
            />

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">URL Tautan Tujuan</label>
              <input
                type="text"
                value={bannerLinkUrl}
                onChange={(e) => setBannerLinkUrl(e.target.value)}
                placeholder="/venues"
                className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              <p className="text-[11px] text-slate-400">
                Halaman yang terbuka saat banner diklik (mis. /venues, /venues/nama-venue)
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBannerModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBanner}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Banner"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PROMO MODAL */}
      {promoModalOpen && (
        <Modal
          isOpen={promoModalOpen}
          onClose={() => setPromoModalOpen(false)}
          title={editingPromo ? "Edit Kode Promo" : "Buat Kode Promo Baru"}
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Kode Promo (Kapital)</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Contoh: MERDEKAFUTSAL"
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Tipe Potongan</label>
                <select
                  value={promoType}
                  onChange={(e) => setPromoType(e.target.value as "fixed" | "percent")}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                >
                  <option value="fixed">Nominal Tetap (Rp)</option>
                  <option value="percent">Persentase (%)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">
                  Nilai Potongan {promoType === "percent" ? "(%)" : "(Rp)"}
                </label>
                <input
                  type="number"
                  value={promoValue}
                  onChange={(e) => setPromoValue(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {promoType === "percent" && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">
                  Maks. Diskon (Rp) — kosongkan jika tanpa batas
                </label>
                <input
                  type="number"
                  value={promoMaxDiscount ?? ""}
                  onChange={(e) =>
                    setPromoMaxDiscount(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="25000"
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Min. Belanja (Rp)</label>
                <input
                  type="number"
                  value={promoMinSpend}
                  onChange={(e) => setPromoMinSpend(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Kuota Pemakaian (0 = ∞)</label>
                <input
                  type="number"
                  value={promoQuota}
                  onChange={(e) => setPromoQuota(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Berlaku Sampai</label>
              <input
                type="datetime-local"
                value={promoEndDate}
                onChange={(e) => setPromoEndDate(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPromoModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSavePromo}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Promo"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
