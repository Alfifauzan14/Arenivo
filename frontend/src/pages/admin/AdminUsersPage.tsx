import * as React from "react";
import {
  Users,
  Search,
  Ban,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle2,
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
import { MOCK_USERS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatDateIndo, AccountStatus } from "@futsal/shared";

type UserItem = (typeof MOCK_USERS)[number];

export function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/admin/users").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [togglingUser, setTogglingUser] = React.useState<UserItem | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesStatus = filterStatus === "all" || u.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleConfirmToggleBlock = () => {
    if (!togglingUser) return;

    const newStatus =
      togglingUser.status === AccountStatus.DIBLOKIR
        ? AccountStatus.AKTIF
        : AccountStatus.DIBLOKIR;

    setUsers((prev) =>
      prev.map((u) => (u.id === togglingUser.id ? { ...u, status: newStatus } : u))
    );

    showToast(
      `Akun pengguna ${togglingUser.fullName} berhasil diubah menjadi ${newStatus.toUpperCase()}.`
    );
    apiClient.patch(`/admin/users/${togglingUser.id}/status`, { status: newStatus }).catch(() => {});
    setTogglingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Manajemen Pengguna Penyewa
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau akun penyewa terdaftar, frekuensi booking, serta penegakan sanksi pemblokiran
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
                placeholder="Cari nama pengguna, email, atau nomor HP..."
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
            <div className="w-full sm:w-56 shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Status (${users.length})` },
                  {
                    value: "aktif",
                    label: `Akun Aktif (${users.filter((u) => u.status === "aktif").length})`,
                  },
                  {
                    value: "diblokir",
                    label: `Akun Diblokir (${users.filter((u) => u.status === "diblokir").length})`,
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
                <TableHead className="text-xs">Pengguna</TableHead>
                <TableHead className="text-xs">Email & Kontak</TableHead>
                <TableHead className="text-xs text-center">Total Booking</TableHead>
                <TableHead className="text-xs">Tanggal Daftar</TableHead>
                <TableHead className="text-xs">Status Akun</TableHead>
                <TableHead className="text-xs text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada akun penyewa yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">
                            {user.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-700 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-mono font-semibold text-xs text-slate-800 px-2 py-0.5 rounded-md bg-slate-100">
                        {user.bookingsCount} booking
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {user.createdAt ? formatDateIndo(user.createdAt.split("T")[0]) : "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant={user.status === AccountStatus.AKTIF ? "success" : "danger"}>
                        {user.status === AccountStatus.AKTIF ? "AKTIF" : "DIBLOKIR"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant={user.status === AccountStatus.AKTIF ? "danger" : "outline"}
                        size="sm"
                        onClick={() => setTogglingUser(user)}
                        className="text-xs h-7 px-2.5"
                      >
                        {user.status === AccountStatus.AKTIF ? (
                          <>
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            Blokir
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Buka Blokir
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredUsers.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* CONFIRM TOGGLE BLOCK MODAL */}
      {togglingUser && (
        <Modal
          isOpen={!!togglingUser}
          onClose={() => setTogglingUser(null)}
          title={
            togglingUser.status === AccountStatus.AKTIF
              ? `Konfirmasi Blokir Akun: ${togglingUser.fullName}`
              : `Buka Blokir Akun: ${togglingUser.fullName}`
          }
        >
          <div className="space-y-4 text-xs">
            {togglingUser.status === AccountStatus.AKTIF ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  Memblokir akun ini akan mencegah pengguna melakukan checkout pesanan baru,
                  mengakses e-tiket aktif, atau login ke platform sampai blokir dibuka kembali.
                </p>
              </div>
            ) : (
              <p className="text-slate-600">
                Pengguna akan diizinkan kembali untuk login dan melakukan reservasi lapangan futsal
                seperti biasa.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTogglingUser(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant={togglingUser.status === AccountStatus.AKTIF ? "danger" : "primary"}
                size="sm"
                onClick={handleConfirmToggleBlock}
                className="text-xs font-semibold"
              >
                {togglingUser.status === AccountStatus.AKTIF
                  ? "Ya, Blokir Akun Pengguna"
                  : "Ya, Buka Blokir Akun"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
