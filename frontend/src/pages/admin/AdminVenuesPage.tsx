import * as React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Building,
  Ban,
  ShieldCheck,
  Eye,
  ExternalLink,
  Star,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Select,
  Modal,
  TablePagination,
} from "@/components/ui";
import { MOCK_VENUES, MOCK_FIELDS } from "@/lib/mock-data";
import { formatRupiah, VenueStatus, type Venue } from "@futsal/shared";

type VenueItem = Venue;

export function AdminVenuesPage() {
  const [venues, setVenues] = React.useState<VenueItem[]>(MOCK_VENUES);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;
  const [selectedVenue, setSelectedVenue] = React.useState<VenueItem | null>(null);
  const [actionVenue, setActionVenue] = React.useState<{
    venue: VenueItem;
    targetStatus: VenueStatus;
  } | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.city?.name && v.city.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleConfirmStatusChange = () => {
    if (!actionVenue) return;
    const { venue, targetStatus } = actionVenue;

    setVenues((prev) =>
      prev.map((v) => (v.id === venue.id ? { ...v, status: targetStatus } : v))
    );

    if (selectedVenue?.id === venue.id) {
      setSelectedVenue((prev) => (prev ? { ...prev, status: targetStatus } : null));
    }

    showToast(
      `Status venue "${venue.name}" berhasil diubah menjadi ${targetStatus.toUpperCase()}.`
    );
    setActionVenue(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Manajemen & Pengawasan Seluruh Venue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring seluruh arena futsal dan mini soccer terdaftar, status tayang, serta sanksi suspend
        </p>
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

      {/* Unified Filter Toolbar & Main Table Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama venue, kota, atau alamat..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:w-60 shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Status (${venues.length})` },
                  {
                    value: "aktif",
                    label: `Venue Aktif (${venues.filter((v) => v.status === "aktif").length})`,
                  },
                  {
                    value: "nonaktif",
                    label: `Venue Nonaktif (${venues.filter((v) => v.status === "nonaktif").length})`,
                  },
                  {
                    value: "diblokir",
                    label: `Venue Diblokir (${venues.filter((v) => v.status === "diblokir").length})`,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama Venue</TableHead>
                <TableHead className="text-xs">Kota & Lokasi</TableHead>
                <TableHead className="text-xs">Harga Mulai</TableHead>
                <TableHead className="text-xs">Rating & Review</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada venue yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVenues.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {v.photos?.[0]?.url && (
                          <img
                            src={v.photos[0].url}
                            alt={v.name}
                            className="w-12 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{v.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Slug: {v.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {v.city?.name || "Kota"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                        {v.address}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(v.startingPrice || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ jam</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{v.ratingAvg}</span>
                        <span className="text-slate-400 font-normal">({v.reviewCount})</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          v.status === "aktif"
                            ? "success"
                            : v.status === "nonaktif"
                            ? "default"
                            : "danger"
                        }
                      >
                        {v.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVenue(v)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail
                      </Button>

                      {v.status === "aktif" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setActionVenue({ venue: v, targetStatus: VenueStatus.DIBLOKIR })
                          }
                          className="text-xs h-7 px-2.5"
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setActionVenue({ venue: v, targetStatus: VenueStatus.AKTIF })
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          Aktifkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredVenues.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredVenues.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* DETAIL MODAL */}
      {selectedVenue && (
        <Modal
          isOpen={!!selectedVenue}
          onClose={() => setSelectedVenue(null)}
          title={`Detail Venue: ${selectedVenue.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-400 block">Status Operasional</span>
                <Badge
                  variant={
                    selectedVenue.status === "aktif"
                      ? "success"
                      : selectedVenue.status === "nonaktif"
                      ? "default"
                      : "danger"
                  }
                  className="mt-1"
                >
                  {selectedVenue.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <span className="text-slate-400 block">Harga Mulai</span>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {formatRupiah(selectedVenue.startingPrice || 0)} / jam
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800">Deskripsi</span>
              <p className="text-slate-600 leading-relaxed">{selectedVenue.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-400 block">Kota</span>
                <p className="font-semibold text-slate-800">{selectedVenue.city?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Koordinat GPS</span>
                <p className="font-mono text-slate-800">
                  {selectedVenue.latitude}, {selectedVenue.longitude}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800">Aturan Venue</span>
              <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedVenue.rules}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link
                to={`/venues/${selectedVenue.slug}`}
                target="_blank"
                className="text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                Lihat di Web Publik <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                {selectedVenue.status === "aktif" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setActionVenue({
                        venue: selectedVenue,
                        targetStatus: VenueStatus.DIBLOKIR,
                      });
                    }}
                    className="text-xs"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    Suspend Venue Ini
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setActionVenue({
                        venue: selectedVenue,
                        targetStatus: VenueStatus.AKTIF,
                      });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Aktifkan Kembali
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ACTION CONFIRMATION MODAL */}
      {actionVenue && (
        <Modal
          isOpen={!!actionVenue}
          onClose={() => setActionVenue(null)}
          title={`Konfirmasi Perubahan Status: ${actionVenue.venue.name}`}
        >
          <div className="space-y-4 text-xs">
            {actionVenue.targetStatus === VenueStatus.DIBLOKIR ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  Memblokir (suspend) venue akan menyembunyikan venue dari hasil pencarian publik dan
                  mencegah penyewa baru melakukan reservasi. Pesanan yang sudah dikonfirmasi harus
                  diselesaikan atau direfund.
                </p>
              </div>
            ) : (
              <p className="text-slate-600">
                Venue akan kembali muncul di halaman pencarian publik dan siap menerima booking slot
                lapangan.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionVenue(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant={
                  actionVenue.targetStatus === VenueStatus.DIBLOKIR ? "danger" : "primary"
                }
                size="sm"
                onClick={handleConfirmStatusChange}
                className="text-xs font-semibold"
              >
                {actionVenue.targetStatus === VenueStatus.DIBLOKIR
                  ? "Ya, Suspend Venue"
                  : "Ya, Aktifkan Venue"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
