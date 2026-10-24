import * as React from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Database,
  MapPin,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  TablePagination,
} from "@/components/ui";
import { MOCK_CITIES, MOCK_FACILITIES, MOCK_FIELD_TYPES } from "@/lib/mock-data";
import type { City, Facility, FieldType } from "@futsal/shared";

export function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = React.useState("cities");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 8;

  // States for data collections
  const [cities, setCities] = React.useState<City[]>(MOCK_CITIES);
  const [fieldTypes, setFieldTypes] = React.useState<FieldType[]>(MOCK_FIELD_TYPES);
  const [facilities, setFacilities] = React.useState<Facility[]>(MOCK_FACILITIES);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  // Form fields
  const [cityName, setCityName] = React.useState("");
  const [cityProvince, setCityProvince] = React.useState("");

  const [fieldCode, setFieldCode] = React.useState("");
  const [fieldName, setFieldName] = React.useState("");

  const [facilityName, setFacilityName] = React.useState("");
  const [facilityIcon, setFacilityIcon] = React.useState("");

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const filteredCities = React.useMemo(() => {
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.province.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  const filteredFieldTypes = React.useMemo(() => {
    return fieldTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fieldTypes, searchQuery]);

  const filteredFacilities = React.useMemo(() => {
    return facilities.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [facilities, searchQuery]);

  const currentTotal =
    activeTab === "cities"
      ? filteredCities.length
      : activeTab === "field_types"
      ? filteredFieldTypes.length
      : filteredFacilities.length;

  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedFieldTypes = filteredFieldTypes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setCityName("");
    setCityProvince("");
    setFieldCode("");
    setFieldName("");
    setFacilityName("");
    setFacilityIcon("sparkles");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === "cities") {
      setCityName(item.name);
      setCityProvince(item.province);
    } else if (activeTab === "field_types") {
      setFieldCode(item.code);
      setFieldName(item.name);
    } else if (activeTab === "facilities") {
      setFacilityName(item.name);
      setFacilityIcon(item.icon || "check");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (activeTab === "cities") {
      if (!cityName.trim() || !cityProvince.trim()) return;
      if (editingItem) {
        setCities((prev) =>
          prev.map((c) =>
            c.id === editingItem.id ? { ...c, name: cityName.trim(), province: cityProvince.trim() } : c
          )
        );
        showToast(`Kota "${cityName}" berhasil diperbarui.`);
      } else {
        const newCity: City = {
          id: `city-${Date.now()}`,
          name: cityName.trim(),
          province: cityProvince.trim(),
        };
        setCities((prev) => [...prev, newCity]);
        showToast(`Kota "${cityName}" berhasil ditambahkan.`);
      }
    } else if (activeTab === "field_types") {
      if (!fieldCode.trim() || !fieldName.trim()) return;
      if (editingItem) {
        setFieldTypes((prev) =>
          prev.map((f) =>
            f.id === editingItem.id ? { ...f, code: fieldCode.trim(), name: fieldName.trim() } : f
          )
        );
        showToast(`Jenis lapangan "${fieldName}" berhasil diperbarui.`);
      } else {
        const newType: FieldType = {
          id: `type-${Date.now()}`,
          code: fieldCode.trim().toLowerCase().replace(/\s+/g, "_"),
          name: fieldName.trim(),
        };
        setFieldTypes((prev) => [...prev, newType]);
        showToast(`Jenis lapangan "${fieldName}" berhasil ditambahkan.`);
      }
    } else if (activeTab === "facilities") {
      if (!facilityName.trim()) return;
      if (editingItem) {
        setFacilities((prev) =>
          prev.map((f) =>
            f.id === editingItem.id
              ? { ...f, name: facilityName.trim(), icon: facilityIcon.trim() || "check" }
              : f
          )
        );
        showToast(`Fasilitas "${facilityName}" berhasil diperbarui.`);
      } else {
        const newFacility: Facility = {
          id: `fac-${Date.now()}`,
          name: facilityName.trim(),
          icon: facilityIcon.trim() || "check",
        };
        setFacilities((prev) => [...prev, newFacility]);
        showToast(`Fasilitas "${facilityName}" berhasil ditambahkan.`);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (activeTab === "cities") {
      setCities((prev) => prev.filter((c) => c.id !== id));
    } else if (activeTab === "field_types") {
      setFieldTypes((prev) => prev.filter((f) => f.id !== id));
    } else if (activeTab === "facilities") {
      setFacilities((prev) => prev.filter((f) => f.id !== id));
    }
    showToast(`Data "${name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Master Data Platform
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tabel master: kota operasional, klasifikasi jenis lapangan, dan fasilitas standar
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah {activeTab === "cities" ? "Kota" : activeTab === "field_types" ? "Jenis Lapangan" : "Fasilitas"}
        </Button>
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

      {/* Unified Table Card */}
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
                  activeTab === "cities"
                    ? "Cari nama kota atau provinsi..."
                    : activeTab === "field_types"
                    ? "Cari jenis lapangan..."
                    : "Cari nama fasilitas venue..."
                }
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

            {/* Category Dropdown (Samakan seperti halaman lain) */}
            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                options={[
                  { value: "cities", label: `Daftar Kota (${cities.length})` },
                  { value: "field_types", label: `Jenis Lapangan (${fieldTypes.length})` },
                  { value: "facilities", label: `Fasilitas Venue (${facilities.length})` },
                ]}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {activeTab === "cities" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nama Kota / Kabupaten</TableHead>
                  <TableHead className="text-xs">Provinsi</TableHead>
                  <TableHead className="text-xs">ID Master</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">
                      Tidak ada kota yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCities.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{c.name}</span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{c.province}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{c.id}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(c)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(c.id, c.name)}
                          className="h-7 px-2 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "field_types" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kode Tipe</TableHead>
                  <TableHead className="text-xs">Nama Jenis Lapangan</TableHead>
                  <TableHead className="text-xs">ID Master</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFieldTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">
                      Tidak ada jenis lapangan yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFieldTypes.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-red-700 bg-red-50/50 px-2.5 py-1 rounded-md">
                        {t.code}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-900">{t.name}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{t.id}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(t)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(t.id, t.name)}
                          className="h-7 px-2 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "facilities" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nama Fasilitas</TableHead>
                  <TableHead className="text-xs">Icon Identifier</TableHead>
                  <TableHead className="text-xs">ID Master</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFacilities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">
                      Tidak ada fasilitas yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFacilities.map((f) => (
                    <TableRow key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{f.name}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{f.icon}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{f.id}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(f)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(f.id, f.name)}
                          className="h-7 px-2 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {currentTotal > pageSize && (
          <TablePagination
            currentPage={currentPage}
            totalItems={currentTotal}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingItem
              ? `Edit ${
                  activeTab === "cities"
                    ? "Kota"
                    : activeTab === "field_types"
                    ? "Jenis Lapangan"
                    : "Fasilitas"
                }`
              : `Tambah ${
                  activeTab === "cities"
                    ? "Kota Baru"
                    : activeTab === "field_types"
                    ? "Jenis Lapangan Baru"
                    : "Fasilitas Baru"
                }`
          }
        >
          <div className="space-y-4 text-xs">
            {activeTab === "cities" && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Nama Kota</label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Provinsi</label>
                  <input
                    type="text"
                    value={cityProvince}
                    onChange={(e) => setCityProvince(e.target.value)}
                    placeholder="Contoh: DKI Jakarta"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
              </>
            )}

            {activeTab === "field_types" && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Kode Tipe (snake_case)</label>
                  <input
                    type="text"
                    value={fieldCode}
                    onChange={(e) => setFieldCode(e.target.value)}
                    placeholder="Contoh: futsal_vinyl"
                    className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Nama Tipe Lapangan</label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Contoh: Futsal Vinyl Gerflor Standar FIFA"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
              </>
            )}

            {activeTab === "facilities" && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Nama Fasilitas</label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="Contoh: Lampu Sorot LED HD"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Nama Ikon Lucide</label>
                  <input
                    type="text"
                    value={facilityIcon}
                    onChange={(e) => setFacilityIcon(e.target.value)}
                    placeholder="Contoh: sparkles, sun, coffee, car"
                    className="w-full h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Simpan Data
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
