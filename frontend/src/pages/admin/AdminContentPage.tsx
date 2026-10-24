import * as React from "react";
import {
  Image as ImageIcon,
  Tag,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Star,
  Search,
  X,
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
import { MOCK_BANNERS, MOCK_PROMOS, MOCK_REVIEWS, MOCK_VENUES } from "@/lib/mock-data";
import { formatRupiah, formatDateIndo, type Banner, type Promo, type Review } from "@futsal/shared";

export function AdminContentPage() {
  const [activeTab, setActiveTab] = React.useState("banners");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [promoPage, setPromoPage] = React.useState(1);
  const [reviewPage, setReviewPage] = React.useState(1);
  const pageSize = 8;

  // States
  const [banners, setBanners] = React.useState<Banner[]>(MOCK_BANNERS);
  const [promos, setPromos] = React.useState<Promo[]>(MOCK_PROMOS);
  const [reviews, setReviews] = React.useState<Review[]>(MOCK_REVIEWS);

  // Modals
  const [bannerModalOpen, setBannerModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = React.useState("");
  const [bannerImageUrl, setBannerImageUrl] = React.useState("");
  const [bannerLinkUrl, setBannerLinkUrl] = React.useState("");

  const [promoModalOpen, setPromoModalOpen] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState<Promo | null>(null);
  const [promoCode, setPromoCode] = React.useState("");
  const [promoType, setPromoType] = React.useState<"fixed" | "percent">("fixed");
  const [promoValue, setPromoValue] = React.useState(25000);
  const [promoMinSpend, setPromoMinSpend] = React.useState(150000);
  const [promoQuota, setPromoQuota] = React.useState(100);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // BANNER ACTIONS
  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setBannerTitle("");
    setBannerImageUrl(
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
    );
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

  const handleSaveBanner = () => {
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) return;

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                title: bannerTitle.trim(),
                imageUrl: bannerImageUrl.trim(),
                linkUrl: bannerLinkUrl.trim() || "/venues",
              }
            : b
        )
      );
      showToast(`Banner "${bannerTitle}" berhasil diperbarui.`);
    } else {
      const newBanner: Banner = {
        id: `bnr-${Date.now()}`,
        title: bannerTitle.trim(),
        imageUrl: bannerImageUrl.trim(),
        linkUrl: bannerLinkUrl.trim() || "/venues",
        sortOrder: banners.length,
        isActive: true,
      };
      setBanners((prev) => [...prev, newBanner]);
      showToast(`Banner baru "${bannerTitle}" berhasil ditambahkan.`);
    }

    setBannerModalOpen(false);
  };

  const handleToggleBannerActive = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, isActive: !b.isActive } : b))
    );
    showToast("Status tayang banner berhasil diubah.");
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    showToast("Banner berhasil dihapus.");
  };

  // PROMO ACTIONS
  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoCode("");
    setPromoType("fixed");
    setPromoValue(25000);
    setPromoMinSpend(150000);
    setPromoQuota(100);
    setPromoModalOpen(true);
  };

  const handleOpenEditPromo = (p: Promo) => {
    setEditingPromo(p);
    setPromoCode(p.code);
    setPromoType(p.discountType);
    setPromoValue(p.discountValue);
    setPromoMinSpend(p.minSpend);
    setPromoQuota(p.quota);
    setPromoModalOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoCode.trim()) return;

    if (editingPromo) {
      setPromos((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? {
                ...p,
                code: promoCode.trim().toUpperCase(),
                discountType: promoType,
                discountValue: promoValue,
                minSpend: promoMinSpend,
                quota: promoQuota,
              }
            : p
        )
      );
      showToast(`Kode Promo ${promoCode.toUpperCase()} berhasil diperbarui.`);
    } else {
      const newPromo: Promo = {
        id: `pr-${Date.now()}`,
        code: promoCode.trim().toUpperCase(),
        discountType: promoType,
        discountValue: promoValue,
        minSpend: promoMinSpend,
        quota: promoQuota,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };
      setPromos((prev) => [...prev, newPromo]);
      showToast(`Kode Promo ${promoCode.toUpperCase()} berhasil dibuat.`);
    }

    setPromoModalOpen(false);
  };

  const handleTogglePromoActive = (promoId: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, isActive: !p.isActive } : p))
    );
    showToast("Status keaktifan voucher promo berhasil diubah.");
  };

  const handleDeletePromo = (promoId: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== promoId));
    showToast("Promo voucher berhasil dihapus.");
  };

  // REVIEW MODERATION ACTIONS
  const handleToggleReviewVisibility = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const nextState = !r.isVisible;
          showToast(
            nextState
              ? "Ulasan sekarang ditampilkan ke publik."
              : "Ulasan berhasil disembunyikan dari publik."
          );
          return { ...r, isVisible: nextState };
        }
        return r;
      })
    );
  };

  const getVenueName = (venueId: string) => {
    return MOCK_VENUES.find((v) => v.id === venueId)?.name || "Venue Olahraga";
  };

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
        (r.userName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q) ||
        getVenueName(r.venueId).toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Konten & Moderasi Ulasan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola banner hero promo, kupon diskon platform, dan moderasi sensor review penyewa
          </p>
        </div>

        {activeTab === "banners" && (
          <Button
            size="sm"
            onClick={handleOpenCreateBanner}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Banner Promo
          </Button>
        )}

        {activeTab === "promos" && (
          <Button
            size="sm"
            onClick={handleOpenCreatePromo}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Kode Promo Baru
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

      {/* Unified Table/Content Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        {/* Unified Filter Toolbar & Category Select */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  activeTab === "banners"
                    ? "Cari judul banner atau tautan..."
                    : activeTab === "promos"
                    ? "Cari kode promo diskon..."
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

            {/* Category Dropdown (Samakan seperti halaman lain) */}
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
                  { value: "promos", label: `Kode Promo Global (${promos.length})` },
                  { value: "reviews", label: `Moderasi Ulasan (${reviews.length})` },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 1. BANNERS TAB */}
        {activeTab === "banners" && (
          <div className="p-4 sm:p-5">
            {filteredBanners.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Tidak ada banner promo yang sesuai dengan kriteria pencarian.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBanners.map((b) => (
                  <div key={b.id} className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs group flex flex-col">
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
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{b.title}</h3>
                        <span className="text-[11px] font-mono text-slate-400 block truncate mt-1">
                          Tautan: {b.linkUrl}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleBannerActive(b.id)}
                          className="h-7 text-xs px-2"
                        >
                          {b.isActive ? "Sembunyikan" : "Tayangkan"}
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

        {/* 2. PROMOS TAB */}
        {activeTab === "promos" && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kode Promo</TableHead>
                  <TableHead className="text-xs">Nilai Diskon</TableHead>
                  <TableHead className="text-xs">Min. Belanja</TableHead>
                  <TableHead className="text-xs text-center">Kuota Terpakai</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                      Tidak ada kode promo yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromos.slice((promoPage - 1) * pageSize, promoPage * pageSize).map((p) => (
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
                        {p.usedCount} / {p.quota}
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
                          onClick={() => handleTogglePromoActive(p.id)}
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

        {/* 3. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Penyewa & Venue</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Komentar Ulasan</TableHead>
                  <TableHead className="text-xs">Balasan Mitra</TableHead>
                  <TableHead className="text-xs">Status Publik</TableHead>
                  <TableHead className="text-xs text-right">Moderasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                      Tidak ada ulasan penyewa yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.slice((reviewPage - 1) * pageSize, reviewPage * pageSize).map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <span className="font-bold text-xs text-slate-900 block">{r.userName}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[160px]">
                          {getVenueName(r.venueId)}
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
                          onClick={() => handleToggleReviewVisibility(r.id)}
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
      </Card>

      {/* BANNER MODAL */}
      {bannerModalOpen && (
        <Modal
          isOpen={bannerModalOpen}
          onClose={() => setBannerModalOpen(false)}
          title={editingBanner ? "Edit Banner Promo" : "Tambah Banner Promo Baru"}
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Judul / Headline Banner</label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Contoh: Promo Main Malam Diskon 25%"
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">URL Gambar (Rasio 16:9 HD)</label>
              <input
                type="text"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">URL Tautan Tujuan</label>
              <input
                type="text"
                value={bannerLinkUrl}
                onChange={(e) => setBannerLinkUrl(e.target.value)}
                placeholder="/venues"
                className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
              />
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
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Simpan Banner
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
                <label className="font-semibold text-slate-800">Nilai Potongan</label>
                <input
                  type="number"
                  value={promoValue}
                  onChange={(e) => setPromoValue(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

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
                <label className="font-semibold text-slate-800">Kuota Pemakaian</label>
                <input
                  type="number"
                  value={promoQuota}
                  onChange={(e) => setPromoQuota(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
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
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Simpan Promo
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
