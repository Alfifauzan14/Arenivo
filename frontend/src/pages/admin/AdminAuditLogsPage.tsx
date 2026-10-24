import * as React from "react";
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Database,
  Calendar,
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
  Select,
  TablePagination,
} from "@/components/ui";
import { MOCK_AUDIT_LOGS, type AuditLogItem } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { formatDateIndo } from "@futsal/shared";

export function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterAction, setFilterAction] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get<any[]>("/admin/audit-logs").then((res) => {
      if (isMounted && res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);

    const matchesAction = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case "VERIFY_MITRA":
      case "APPROVE_PAYOUT":
        return <Badge variant="success">{action}</Badge>;
      case "PROCESS_REFUND":
        return <Badge variant="info">{action}</Badge>;
      case "REJECT_MITRA":
      case "BLOCK_USER":
        return <Badge variant="danger">{action}</Badge>;
      case "UPDATE_SYSTEM_CONFIG":
        return <Badge variant="warning">{action}</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Audit Log Aktivitas Super Admin
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekaman jejak digital immutable untuk setiap aksi verifikasi, finansial, dan modifikasi konfigurasi platform
        </p>
      </div>

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
                placeholder="Cari deskripsi aksi, email operator, entitas target, atau IP..."
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

            {/* Action Filter Dropdown */}
            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: `Semua Tipe Aksi (${logs.length})` },
                  {
                    value: "VERIFY_MITRA",
                    label: `VERIFY_MITRA (${logs.filter((l) => l.action === "VERIFY_MITRA").length})`,
                  },
                  {
                    value: "REJECT_MITRA",
                    label: `REJECT_MITRA (${logs.filter((l) => l.action === "REJECT_MITRA").length})`,
                  },
                  {
                    value: "PROCESS_REFUND",
                    label: `PROCESS_REFUND (${logs.filter((l) => l.action === "PROCESS_REFUND").length})`,
                  },
                  {
                    value: "APPROVE_PAYOUT",
                    label: `APPROVE_PAYOUT (${logs.filter((l) => l.action === "APPROVE_PAYOUT").length})`,
                  },
                  {
                    value: "BLOCK_USER",
                    label: `BLOCK_USER (${logs.filter((l) => l.action === "BLOCK_USER").length})`,
                  },
                  {
                    value: "UPDATE_SYSTEM_CONFIG",
                    label: `UPDATE_SYSTEM_CONFIG (${logs.filter((l) => l.action === "UPDATE_SYSTEM_CONFIG").length})`,
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
                <TableHead className="text-xs">Waktu (WIB)</TableHead>
                <TableHead className="text-xs">Operator Admin</TableHead>
                <TableHead className="text-xs">Aksi & Target</TableHead>
                <TableHead className="text-xs">Detail Perubahan</TableHead>
                <TableHead className="text-xs text-right">Alamat IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada catatan audit yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {log.createdAt ? formatDateIndo(log.createdAt.split("T")[0]) : "-"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-5">
                        {log.createdAt ? log.createdAt.split("T")[1].substring(0, 8) : ""}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.adminEmail}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div>{getActionBadge(log.action)}</div>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {log.targetType} ({log.targetId})
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-slate-700 leading-relaxed max-w-md">
                        {log.details}
                      </p>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-500 text-right whitespace-nowrap">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {filteredLogs.length > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </div>
  );
}
