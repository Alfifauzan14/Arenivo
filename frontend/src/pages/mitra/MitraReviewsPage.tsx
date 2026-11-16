import * as React from "react";
import { CornerDownRight, Reply, Search, X, Edit2, Loader2, Star } from "lucide-react";
import {
  Card,
  Button,
  Modal,
  Select,
  useToast,
} from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { formatDateIndo, type Review } from "@futsal/shared";

export function MitraReviewsPage() {
  const { addToast } = useToast();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("semua");
  const [replyingReview, setReplyingReview] = React.useState<Review | null>(null);
  const [replyText, setReplyText] = React.useState("");

  const loadReviews = React.useCallback(async () => {
    try {
      const res = await apiClient.get<any[]>("/mitra/reviews");
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((r: any) => ({
          ...r,
          userName: r.user?.fullName || r.userName || "Penyewa",
          userAvatar: r.user?.avatarUrl || r.userAvatar || null,
        }));
        setReviews(formatted);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = React.useMemo(() => {
    return reviews.filter((r) => {
      if (filterStatus === "replied" && !r.reply) return false;
      if (filterStatus === "unreplied" && r.reply) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (r.userName || "").toLowerCase().includes(q) ||
          (r.comment || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, filterStatus, searchQuery]);

  const handleOpenReply = (rev: Review) => {
    setReplyingReview(rev);
    setReplyText(rev.reply || "");
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim().length < 2) {
      addToast("warning", "Tuliskan respon balasan pengelola minimal 2 karakter.", "Validasi");
      return;
    }
    if (!replyingReview) return;

    setSaving(true);
    try {
      await apiClient.post(`/mitra/reviews/${replyingReview.id}/reply`, {
        reply: replyText.trim(),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === replyingReview.id
            ? { ...r, reply: replyText.trim(), repliedAt: new Date().toISOString() }
            : r
        )
      );
      addToast("success", "Balasan ulasan berhasil disimpan ke database.", "Balasan Terkirim");
      setReplyingReview(null);
    } catch (err: any) {
      addToast("error", err?.error?.message || "Gagal menyimpan balasan ulasan.", "Gagal");
    } finally {
      setSaving(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ulasan Penyewa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pantau penilaian penyewa dan berikan tanggapan resmi pengelola venue.
          </p>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-white border border-slate-200 self-start sm:self-auto shadow-xs">
          <div className="text-amber-500 font-bold text-xs sm:text-sm">★ {avgRating}</div>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
            {reviews.length} Ulasan
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 sm:p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama penyewa atau isi ulasan..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "semua", label: `Semua Ulasan (${reviews.length})` },
                { value: "replied", label: "Sudah Dibalas" },
                { value: "unreplied", label: "Belum Dibalas" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Memuat ulasan penyewa...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="p-10 text-center space-y-2 bg-white border-slate-200">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Belum ada ulasan penyewa</p>
          <p className="text-xs text-slate-500">
            Ulasan akan muncul di sini setelah penyewa menyelesaikan permainan dan mengirim penilaian.
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {filteredReviews.map((rev) => (
            <Card key={rev.id} className="p-4 sm:p-5 space-y-3 bg-white border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {(rev.userName || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {rev.userName}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                        Terverifikasi
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-0.5">
                      {rev.createdAt ? formatDateIndo(rev.createdAt.split("T")[0], false) : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono tabular-nums shrink-0">
                  <span>★ {rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                "{rev.comment}"
              </p>

              {rev.reply ? (
                <div className="pl-3.5 py-2.5 pr-3 bg-white rounded-r-lg border border-slate-200 border-l-4 border-l-red-600 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[11px] text-slate-900 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      Balasan Pengelola
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReply(rev)}
                      className="h-6 px-2 text-[11px]"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.reply}</p>
                </div>
              ) : (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReply(rev)}
                    className="h-7 px-2.5 text-xs"
                  >
                    <Reply className="w-3.5 h-3.5 mr-1" />
                    Balas Ulasan
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Balas Ulasan */}
      <Modal
        isOpen={!!replyingReview}
        onClose={() => setReplyingReview(null)}
        title="Balas Ulasan Penyewa"
      >
        {replyingReview && (
          <form onSubmit={handleSaveReply} className="space-y-4 text-xs">
            <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1 text-slate-700">
              <span className="font-semibold block text-slate-900">
                Ulasan dari {replyingReview.userName}
              </span>
              <p className="text-slate-600">"{replyingReview.comment}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">
                Balasan Resmi Venue
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Terima kasih atas ulasannya..."
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setReplyingReview(null)}
                className="flex-1 text-xs"
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" className="flex-1 text-xs" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Balasan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default MitraReviewsPage;
