import * as React from "react";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Search,
  X,
  Eye,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
  useToast,
} from "@/components/ui";
import {
  MOCK_MITRA_BALANCE,
  MOCK_PAYOUTS,
} from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatDateIndo } from "@futsal/shared";
import { cn } from "@/lib/utils";

interface BalanceEntry {
  id: string;
  type: "in" | "out" | "hold";
  description: string;
  orderCode?: string;
  amount: number;
  date: string;
}

export function MitraFinancePage() {
  const { addToast } = useToast();

  const [balance, setBalance] = React.useState(MOCK_MITRA_BALANCE);
  const [payouts, setPayouts] = React.useState(MOCK_PAYOUTS);

  // Live Backend Loading for Balance & Payouts
  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any>("/mitra/balance").then((res) => {
      if (isMounted && res.data) setBalance(res.data);
    }).catch(() => {});

    apiClient.get<any[]>("/mitra/payouts").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPayouts(res.data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Pagination states
  const [ledgerSearch, setLedgerSearch] = React.useState("");
  const [ledgerTypeFilter, setLedgerTypeFilter] = React.useState("semua");
  const [ledgerPage, setLedgerPage] = React.useState(1);

  const [payoutSearch, setPayoutSearch] = React.useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = React.useState("semua");
  const [payoutPage, setPayoutPage] = React.useState(1);
  const pageSize = 4;

  // Modal Payout State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = React.useState(false);
  const [selectedPayoutDetail, setSelectedPayoutDetail] = React.useState<any | null>(null);
  const [payoutAmount, setPayoutAmount] = React.useState<number>(1000000);
  const [selectedBank, setSelectedBank] = React.useState("BCA");
  const [bankAccount, setBankAccount] = React.useState("8830128491");
  const [accountHolder, setAccountHolder] = React.useState("PT Spartan Olahraga Sejahtera");

  // Ledger Mutasi Saldo
  const [ledgerEntries] = React.useState<BalanceEntry[]>([
    {
      id: "ent-1",
      type: "in",
      description: "Pendapatan Booking Online (Net 90%)",
      orderCode: "FB-8K2M4Q",
      amount: 378000,
      date: "15 Okt 2026, 08:35",
    },
    {
      id: "ent-2",
      type: "out",
      description: "Pencairan Dana (Payout) ke BCA 8830128491",
      amount: 1500000,
      date: "14 Okt 2026, 14:30",
    },
    {
      id: "ent-3",
      type: "in",
      description: "Pendapatan Booking Online (Net 90%)",
      orderCode: "FB-4L1B8C",
      amount: 288000,
      date: "13 Okt 2026, 10:05",
    },
    {
      id: "ent-4",
      type: "out",
      description: "Pencairan Dana (Payout) ke BCA 8830128491",
      amount: 2500000,
      date: "10 Okt 2026, 09:00",
    },
  ]);

  const filteredLedger = React.useMemo(() => {
    return ledgerEntries.filter((e) => {
      if (ledgerTypeFilter !== "semua" && e.type !== ledgerTypeFilter) return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          (e.orderCode || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ledgerEntries, ledgerTypeFilter, ledgerSearch]);

  const filteredPayouts = React.useMemo(() => {
    return payouts.filter((p) => {
      if (payoutStatusFilter !== "semua" && p.status !== payoutStatusFilter) return false;
      if (payoutSearch.trim()) {
        const q = payoutSearch.toLowerCase();
        return (
          p.bankName.toLowerCase().includes(q) ||
          p.bankAccountNumber.includes(q) ||
          p.bankAccountHolder.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payouts, payoutStatusFilter, payoutSearch]);

  const paginatedLedger = React.useMemo(() => {
    const start = (ledgerPage - 1) * pageSize;
    return filteredLedger.slice(start, start + pageSize);
  }, [filteredLedger, ledgerPage]);

  const paginatedPayouts = React.useMemo(() => {
    const start = (payoutPage - 1) * pageSize;
    return filteredPayouts.slice(start, start + pageSize);
  }, [filteredPayouts, payoutPage]);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount < 100000) {
      addToast("warning", "Batas minimum penarikan dana adalah Rp100.000.", "Validasi Payout");
      return;
    }

    if (payoutAmount > balance.saldoBisaDicairkan) {
      addToast(
        "error",
        `Saldo yang dapat dicairkan tidak mencukupi (${formatRupiah(balance.saldoBisaDicairkan)}).`,
        "Saldo Tidak Cukup"
      );
      return;
    }

    setBalance((prev) => ({
      ...prev,
      saldoTotal: prev.saldoTotal - payoutAmount,
      saldoBisaDicairkan: prev.saldoBisaDicairkan - payoutAmount,
    }));

    const newPayout = {
      id: `po-${Date.now()}`,
      mitraId: balance.mitraId,
      amount: payoutAmount,
      status: "diproses" as const,
      bankName: selectedBank,
      bankAccountNumber: bankAccount,
      bankAccountHolder: accountHolder,
      createdAt: new Date().toISOString(),
    };

    setPayouts((prev) => [newPayout, ...prev]);
    apiClient.post<any>("/mitra/payouts", { amount: payoutAmount }).catch(() => {});
    setIsPayoutModalOpen(false);
    setPayoutPage(1);

    addToast(
      "success",
      `Permohonan pencairan dana sebesar ${formatRupiah(payoutAmount)} ke rekening ${selectedBank} berhasil diajukan.`,
      "Pengajuan Payout Berhasil"
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Keuangan & Payout
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pantau saldo pendapatan bersih (setelah komisi online 10%) dan ajukan penarikan dana.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsPayoutModalOpen(true)}
          className="w-full sm:w-auto justify-center gap-1.5 text-xs"
        >
          <ArrowUpRight className="w-4 h-4" />
          Tarik Saldo (Payout)
        </Button>
      </div>

      {/* 1. Metric Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Saldo Siap Dicairkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono text-red-600 tabular-nums">
              {formatRupiah(balance.saldoBisaDicairkan)}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Minimal penarikan Rp100.000</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Saldo Tertahan (Escrow)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatRupiah(balance.saldoTertahan)}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Cair otomatis setelah jadwal selesai</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Saldo Mitra
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatRupiah(balance.saldoTotal)}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Pendapatan bersih mitra (90% online)</p>
        </Card>
      </div>

      {/* 2. Mutasi Saldo Dompet (Unified Modern Table + Wide Search & Select) */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 space-y-3 rounded-t-xl">
          <div>
            <CardTitle className="text-sm sm:text-base">Mutasi Saldo Dompet</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Riwayat dana masuk dari transaksi booking online dan dana keluar pencairan
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari keterangan mutasi atau kode booking..."
                value={ledgerSearch}
                onChange={(e) => {
                  setLedgerSearch(e.target.value);
                  setLedgerPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {ledgerSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLedgerSearch("");
                    setLedgerPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-48 shrink-0">
              <Select
                value={ledgerTypeFilter}
                onChange={(e) => {
                  setLedgerTypeFilter(e.target.value);
                  setLedgerPage(1);
                }}
                options={[
                  { value: "semua", label: `Semua Mutasi (${ledgerEntries.length})` },
                  { value: "in", label: "Dana Masuk (+)" },
                  { value: "out", label: "Dana Keluar (-)" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 */}
          <div className="md:hidden divide-y divide-slate-200">
            {paginatedLedger.length > 0 ? (
              paginatedLedger.map((ent, idx) => {
                const rowNo = (ledgerPage - 1) * pageSize + idx + 1;
                return (
                  <div
                    key={ent.id}
                    className={cn(
                      "px-4 py-3.5 space-y-2 text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"
                    )}
                  >
                    {/* Header: Nomor + Kode/Tipe & Nominal */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-red-50 text-red-700 border border-red-100 font-mono text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0">
                          {rowNo}
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums truncate">
                          {ent.orderCode || (ent.type === "in" ? "UANG MASUK" : "PENCAIRAN")}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold tabular-nums shrink-0 ${
                          ent.type === "in" ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {ent.type === "in" ? "+" : "-"}
                        {formatRupiah(ent.amount)}
                      </span>
                    </div>

                    {/* Isi Data: Grid Rapi Kiri-Kanan Rata Kiri */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-start gap-2">
                        <span className="text-slate-500">Keterangan</span>
                        <span className="font-semibold text-slate-900">
                          {ent.description}
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Waktu</span>
                        <span className="font-medium text-slate-600 tabular-nums">
                          {ent.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                Tidak ada mutasi saldo yang sesuai dengan pencarian.
              </div>
            )}
          </div>

          {/* 2. Tampilan Web / Desktop: Tabel Modern Header Merah Soft */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kode Booking</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLedger.length > 0 ? (
                  paginatedLedger.map((ent, idx) => {
                    const rowNo = (ledgerPage - 1) * pageSize + idx + 1;
                    return (
                      <TableRow key={ent.id}>
                        <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                          {rowNo}
                        </TableCell>
                        <TableCell className="font-mono text-slate-500 tabular-nums whitespace-nowrap">
                          {ent.date}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {ent.description}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-800 tabular-nums whitespace-nowrap">
                          {ent.orderCode || "—"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                            ent.type === "in" ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {ent.type === "in" ? "+" : "-"}
                          {formatRupiah(ent.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada mutasi saldo yang sesuai dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={ledgerPage}
            totalItems={filteredLedger.length}
            pageSize={pageSize}
            onPageChange={setLedgerPage}
          />
        </CardContent>
      </Card>

      {/* 3. Riwayat Permohonan Payout (Unified Modern Table + Wide Search & Select) */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 space-y-3 rounded-t-xl">
          <div>
            <CardTitle className="text-sm sm:text-base">Riwayat Pencairan Dana (Payout)</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Daftar permohonan transfer pendapatan ke rekening bank terdaftar
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari bank, nomor rekening, atau atas nama..."
                value={payoutSearch}
                onChange={(e) => {
                  setPayoutSearch(e.target.value);
                  setPayoutPage(1);
                }}
                className="h-10 w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
              {payoutSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setPayoutSearch("");
                    setPayoutPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-48 shrink-0">
              <Select
                value={payoutStatusFilter}
                onChange={(e) => {
                  setPayoutStatusFilter(e.target.value);
                  setPayoutPage(1);
                }}
                options={[
                  { value: "semua", label: `Semua Status (${payouts.length})` },
                  { value: "selesai", label: "Ditransfer" },
                  { value: "diproses", label: "Diproses" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          {/* 1. Tampilan Android / HP: Urut Kebawah 1 per 1 */}
          <div className="md:hidden divide-y divide-slate-200">
            {paginatedPayouts.length > 0 ? (
              paginatedPayouts.map((po, idx) => {
                const rowNo = (payoutPage - 1) * pageSize + idx + 1;
                return (
                  <div
                    key={po.id}
                    className={cn(
                      "px-4 py-3.5 space-y-2 text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/90"
                    )}
                  >
                    {/* Header: Nomor + Nominal & Status */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-red-50 text-red-700 border border-red-100 font-mono text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0">
                          {rowNo}
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatRupiah(po.amount)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          po.status === "selesai"
                            ? "success"
                            : po.status === "ditolak"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {po.status === "selesai" ? "DITRANSFER" : po.status === "ditolak" ? "DITOLAK" : "DIPROSES"}
                      </Badge>
                    </div>

                    {/* Isi Data: Grid Rapi Kiri-Kanan Rata Kiri */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Rekening</span>
                        <span className="font-semibold text-slate-900">
                          {po.bankName} • <span className="font-mono">{po.bankAccountNumber}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-start gap-2">
                        <span className="text-slate-500">Atas Nama</span>
                        <span className="font-medium text-slate-800">
                          {po.bankAccountHolder}
                        </span>
                      </div>
                      <div className="grid grid-cols-[84px_1fr] items-center gap-2">
                        <span className="text-slate-500">Tanggal</span>
                        <span className="font-medium text-slate-600 tabular-nums">
                          {po.createdAt
                            ? formatDateIndo(po.createdAt.split("T")[0], false)
                            : "15 Okt 2026"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayoutDetail(po)}
                        className="w-full h-7 text-xs justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detail Pencairan
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                Tidak ada riwayat pencairan yang sesuai dengan pencarian.
              </div>
            )}
          </div>

          {/* 2. Tampilan Web / Desktop: Tabel Modern Header Merah Soft */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Rekening</TableHead>
                  <TableHead className="text-xs">Atas Nama</TableHead>
                  <TableHead className="text-xs text-right">Nominal</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayouts.length > 0 ? (
                  paginatedPayouts.map((po, idx) => {
                    const rowNo = (payoutPage - 1) * pageSize + idx + 1;
                    return (
                      <TableRow key={po.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-center font-mono text-slate-500 font-bold tabular-nums">
                          {rowNo}
                        </TableCell>
                        <TableCell className="font-mono text-slate-500 tabular-nums whitespace-nowrap">
                          {po.createdAt
                            ? formatDateIndo(po.createdAt.split("T")[0], false)
                            : "15 Okt 2026"}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 whitespace-nowrap">
                          {po.bankName} • <span className="font-mono">{po.bankAccountNumber}</span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {po.bankAccountHolder}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatRupiah(po.amount)}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <Badge
                            variant={
                              po.status === "selesai"
                                ? "success"
                                : po.status === "ditolak"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {po.status === "selesai" ? "DITRANSFER" : po.status === "ditolak" ? "DITOLAK" : "DIPROSES"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayoutDetail(po)}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada riwayat pencairan yang sesuai dengan pencarian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={payoutPage}
            totalItems={filteredPayouts.length}
            pageSize={pageSize}
            onPageChange={setPayoutPage}
          />
        </CardContent>
      </Card>

      {/* MODAL: Ajukan Pencairan Dana */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Ajukan Pencairan Dana (Payout)"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
          <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Saldo Siap Dicairkan:</span>
            <span className="font-mono font-bold text-red-600 text-sm tabular-nums">
              {formatRupiah(balance.saldoBisaDicairkan)}
            </span>
          </div>

          <div className="space-y-2">
            <Input
              label="Nominal Pencairan (Minimal Rp100.000)"
              type="number"
              min={100000}
              max={balance.saldoBisaDicairkan}
              step={50000}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(parseInt(e.target.value, 10) || 0)}
            />
            <div className="flex flex-wrap gap-2">
              {[500000, 1000000, 2000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPayoutAmount(amt)}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-mono text-slate-700 cursor-pointer tabular-nums"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Bank Tujuan"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                options={[
                  { value: "BCA", label: "Bank BCA" },
                  { value: "Mandiri", label: "Bank Mandiri" },
                  { value: "BNI", label: "Bank BNI" },
                  { value: "BRI", label: "Bank BRI" },
                ]}
              />

              <Input
                label="Nomor Rekening"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="font-mono"
              />
            </div>

            <Input
              label="Nama Pemilik Rekening"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsPayoutModalOpen(false)}
              className="flex-1 text-xs"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1 text-xs">
              Ajukan Pencairan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Detail Pencairan Dana (Payout) */}
      <Modal
        isOpen={!!selectedPayoutDetail}
        onClose={() => setSelectedPayoutDetail(null)}
        title="Rincian Permohonan Pencairan (Payout)"
      >
        {selectedPayoutDetail && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                  ID Transaksi Payout
                </span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {selectedPayoutDetail.id}
                </span>
              </div>
              <Badge
                variant={
                  selectedPayoutDetail.status === "selesai"
                    ? "success"
                    : selectedPayoutDetail.status === "ditolak"
                    ? "danger"
                    : "warning"
                }
              >
                {selectedPayoutDetail.status === "selesai"
                  ? "DITRANSFER"
                  : selectedPayoutDetail.status === "ditolak"
                  ? "DITOLAK"
                  : "DIPROSES"}
              </Badge>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nominal Penarikan</span>
                <span className="font-mono font-bold text-base text-red-600">
                  {formatRupiah(selectedPayoutDetail.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500">Bank Tujuan</span>
                <span className="font-semibold text-slate-900">{selectedPayoutDetail.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nomor Rekening</span>
                <span className="font-mono font-bold text-slate-900">{selectedPayoutDetail.bankAccountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Atas Nama</span>
                <span className="font-medium text-slate-800">{selectedPayoutDetail.bankAccountHolder}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500">Tanggal Pengajuan</span>
                <span className="font-mono text-slate-700">
                  {selectedPayoutDetail.createdAt ? formatDateIndo(selectedPayoutDetail.createdAt.split("T")[0], false) : "15 Okt 2026"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
              Transfer pencairan dana diproses otomatis ke rekening bank terdaftar dalam 1x24 jam kerja hari bursa operasional BI-FAST.
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSelectedPayoutDetail(null)}
                className="w-full text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MitraFinancePage;
