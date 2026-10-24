import * as React from "react";
import {
  CreditCard,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  useToast,
} from "@/components/ui";

export function MitraProfilePage() {
  const { addToast } = useToast();

  // Profile state
  const [businessName, setBusinessName] = React.useState("PT Spartan Olahraga Sejahtera");
  const [picName, setPicName] = React.useState("Bambang Hermawan");
  const [phone, setPhone] = React.useState("081122334455");
  const [email, setEmail] = React.useState("mitra.spartan@gmail.com");

  // Bank account state
  const [bankName, setBankName] = React.useState("BCA");
  const [accountNumber, setAccountNumber] = React.useState("8830128491");
  const [accountHolder, setAccountHolder] = React.useState("PT Spartan Olahraga Sejahtera");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      "success",
      "Profil pengelola dan data rekening bank pencairan berhasil diperbarui.",
      "Data Tersimpan"
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
          Profil & Rekening Bank
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Kelola identitas penanggung jawab usaha serta rekening bank tujuan pencairan dana.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-5 sm:space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
          {/* Card 1: Data Pengelola */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                Identitas Pengelola Usaha
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Data kontak resmi penanggung jawab operasional venue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-4 space-y-4">
              <Input
                label="Nama Perusahaan / Badan Usaha"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Penanggung Jawab"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Nomor WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <Input
                label="Email Bisnis Mitra"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </CardContent>
          </Card>

          {/* Card 2: Rekening Bank Pencairan */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                Rekening Bank Pencairan (Payout)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Digunakan untuk transfer pencairan saldo pendapatan mitra
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-4 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Pastikan nama pemilik rekening sesuai dengan identitas usaha yang terdaftar.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Nama Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  options={[
                    { value: "BCA", label: "Bank Central Asia (BCA)" },
                    { value: "Mandiri", label: "Bank Mandiri" },
                    { value: "BNI", label: "Bank Negara Indonesia (BNI)" },
                    { value: "BRI", label: "Bank Rakyat Indonesia (BRI)" },
                  ]}
                />

                <Input
                  label="Nomor Rekening"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>

              <Input
                label="Nama Pemilik Rekening"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto justify-center text-xs gap-1.5"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MitraProfilePage;
