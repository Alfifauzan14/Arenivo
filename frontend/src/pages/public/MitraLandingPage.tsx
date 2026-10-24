import * as React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  QrCode,
  Users,
  ArrowRight,
  Wallet,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MitraLandingPage() {
  return (
    <div className="min-h-screen">
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kemitraan Pengelola Lapangan
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Kelola jadwal slot, pembayaran instan Midtrans, dan pendapatan arena dari satu dashboard
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Link to="/mitra/login">
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs gap-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white shadow-xs transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Portal Mitra</span>
              </Button>
            </Link>

            <Link to="/mitra/register">
              <Button
                variant="primary"
                size="sm"
                className="font-bold text-xs gap-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 border-white shadow-xs"
              >
                <span>Daftar Jadi Mitra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

      {/* 2. 4 KEUNTUNGAN UTAMA MITRA */}
      <section>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kenapa Bermitra dengan Kami?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistem operasional otomatis yang dirancang khusus untuk kenyamanan pengelola lapangan dan penyewa
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Fitur 1 */}
            <div className="p-6 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  Real-Time
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Bebas Double Booking
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Slot otomatis terkunci saat penyewa checkout sehingga tidak ada jadwal bentrok di lapangan.
                </p>
              </div>
            </div>

            {/* Fitur 2 */}
            <div className="p-6 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Otomatis
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Pencairan Dana Instan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pembayaran QRIS & VA terverifikasi otomatis. Tarik saldo pendapatan kapan saja ke rekening bank.
                </p>
              </div>
            </div>

            {/* Fitur 3 */}
            <div className="p-6 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  1 Detik
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Gate Scanner QR
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Petugas lapangan cukup scan QR e-tiket penyewa lewat kamera HP tanpa perlu cetak kertas.
                </p>
              </div>
            </div>

            {/* Fitur 4 */}
            <div className="p-6 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  24/7 Online
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Jangkauan Lebih Luas
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Jangkau ribuan tim futsal dan mini soccer di kota Anda yang mencari jadwal kosong setiap hari.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3 LANGKAH MUDAH BERGABUNG */}
      <section>
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-6">
            Cara Mudah Bergabung Menjadi Mitra
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Daftar & Lengkapi Data Usaha</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Isi formulir pendaftaran mitra, data penanggung jawab, rekening pencairan, dan unggah dokumen NIB/SIUP.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Verifikasi Resmi Admin</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Tim kami memverifikasi data dan legalitas usaha Anda dalam 1x24 jam untuk menjamin kredibilitas venue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">Mulai Terima Booking & Pendapatan</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Atur jam operasional dan tarif per jam. Lapangan Anda langsung tampil di katalog publik dan siap dipesan.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              Punya pertanyaan seputar kemitraan atau integrasi venue?
            </div>
            <Link to="/mitra/register">
              <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5 rounded-lg shadow-xs">
                <span>Mulai Pendaftaran Mitra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}

export default MitraLandingPage;
